<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    /**
     * Get all documents
     * GET /api/documents
     */
    public function index(Request $request)
    {
        try {
            $query = Document::query();

            // Filter by personnel
            if ($request->has('personnel_id')) {
                $query->where('personnel_id', $request->get('personnel_id'));
            }

            // Filter by document type
            if ($request->has('document_type')) {
                $query->where('document_type', $request->get('document_type'));
            }

            // Search
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where('filename', 'like', "%{$search}%")
                      ->orWhere('original_name', 'like', "%{$search}%");
            }

            $documents = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $documents,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get documents error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get single document by ID
     * GET /api/documents/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $document = Document::find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $document,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get document error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Upload document
     * POST /api/documents
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'personnel_id' => 'required|integer|exists:personnel,id',
                'document_type' => 'required|string|max:255',
                'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'File is required',
                ], 422);
            }

            $file = $request->file('file');
            $path = Storage::disk('public')->putFile('documents', $file);

            $document = Document::create([
                'personnel_id' => $request->personnel_id,
                'document_type' => $request->document_type,
                'filename' => $path,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'description' => $request->description,
            ]);

            Log::info('Document uploaded', ['document_id' => $document->id]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => $document,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Document upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Download document
     * GET /api/documents/{id}/download
     */
    public function download(Request $request, $id)
    {
        try {
            $document = Document::find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found',
                ], 404);
            }

            if (!Storage::disk('public')->exists($document->filename)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            return Storage::disk('public')->download($document->filename, $document->original_name);
        } catch (\Exception $e) {
            Log::error('Document download error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Delete document
     * DELETE /api/documents/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $document = Document::find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found',
                ], 404);
            }

            // Delete file
            if (Storage::disk('public')->exists($document->filename)) {
                Storage::disk('public')->delete($document->filename);
            }

            $document->delete();
            Log::info('Document deleted', ['document_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete document error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['personnel.company', 'uploader']);

        // Filter by personnel
        if ($request->has('personnel_id')) {
            $query->where('personnel_id', $request->personnel_id);
        }

        // Filter by document type
        if ($request->has('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        $documents = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnel,id',
            'document_type' => 'required|string|max:100',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('documents', $filename, 'public');

        $document = Document::create([
            'personnel_id' => $validated['personnel_id'],
            'document_type' => $validated['document_type'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $document->load(['personnel', 'uploader']),
        ], 201);
    }

    public function show($id)
    {
        $document = Document::with(['personnel.company', 'uploader'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $document,
        ]);
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }
}
