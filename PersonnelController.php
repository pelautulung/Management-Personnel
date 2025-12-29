<?php

namespace App\Http\Controllers\Api;

use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PersonnelController extends Controller
{
    /**
     * Get all personnel with optional filtering
     * GET /api/personnel
     */
    public function index(Request $request)
    {
        try {
            $query = Personnel::query();

            // Filter by company for contractors
            if ($request->user() && $request->user()->isContractor()) {
                $query->where('company_id', $request->user()->company_id);
            }

            // Filter by search term
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            // Filter by department
            if ($request->has('department')) {
                $query->where('department', $request->get('department'));
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            $personnel = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $personnel,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get personnel error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get single personnel by ID
     * GET /api/personnel/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $personnel = Personnel::find($id);

            if (!$personnel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personnel not found',
                ], 404);
            }

            // Check authorization for contractors
            if ($request->user() && $request->user()->isContractor() && 
                $personnel->company_id !== $request->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $personnel,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get personnel error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Create new personnel
     * POST /api/personnel
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:personnel|max:255',
                'employee_id' => 'required|string|unique:personnel|max:255',
                'department' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'company_id' => 'required|integer|exists:companies,id',
                'status' => 'required|in:active,inactive,on_leave',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $personnel = Personnel::create($request->all());
            Log::info('Personnel created', ['personnel_id' => $personnel->id]);

            return response()->json([
                'success' => true,
                'message' => 'Personnel created successfully',
                'data' => $personnel,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create personnel error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Update personnel
     * PUT /api/personnel/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $personnel = Personnel::find($id);

            if (!$personnel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personnel not found',
                ], 404);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:personnel,email,' . $id . '|max:255',
                'department' => 'sometimes|required|string|max:255',
                'position' => 'sometimes|required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'status' => 'sometimes|required|in:active,inactive,on_leave',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $personnel->update($request->all());
            Log::info('Personnel updated', ['personnel_id' => $personnel->id]);

            return response()->json([
                'success' => true,
                'message' => 'Personnel updated successfully',
                'data' => $personnel,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update personnel error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Delete personnel
     * DELETE /api/personnel/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $personnel = Personnel::find($id);

            if (!$personnel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personnel not found',
                ], 404);
            }

            $personnel->delete();
            Log::info('Personnel deleted', ['personnel_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Personnel deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete personnel error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Bulk import personnel
     * POST /api/personnel/bulk-import
     */
    public function bulkImport(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'personnel' => 'required|array',
                'personnel.*.name' => 'required|string|max:255',
                'personnel.*.email' => 'required|email|max:255',
                'personnel.*.employee_id' => 'required|string|max:255',
                'personnel.*.department' => 'required|string|max:255',
                'personnel.*.position' => 'required|string|max:255',
                'personnel.*.company_id' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $created = 0;
            $failed = 0;

            foreach ($request->personnel as $data) {
                try {
                    Personnel::create($data);
                    $created++;
                } catch (\Exception $e) {
                    Log::warning('Personnel import error: ' . $e->getMessage());
                    $failed++;
                }
            }

            Log::info('Bulk import completed', ['created' => $created, 'failed' => $failed]);

            return response()->json([
                'success' => true,
                'message' => 'Bulk import completed',
                'created' => $created,
                'failed' => $failed,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Bulk import error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
