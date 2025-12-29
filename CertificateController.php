<?php

namespace App\Http\Controllers\Api;

use App\Models\Certificate;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    /**
     * Get all certificates
     * GET /api/certificates
     */
    public function index(Request $request)
    {
        try {
            $query = Certificate::with('personnel');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by expiry
            if ($request->has('expiry_status')) {
                $expiryStatus = $request->get('expiry_status');
                $today = now();
                $thirtyDaysFromNow = now()->addDays(30);

                if ($expiryStatus == 'expired') {
                    $query->where('expiry_date', '<', $today);
                } elseif ($expiryStatus == 'expiring_soon') {
                    $query->whereBetween('expiry_date', [$today, $thirtyDaysFromNow]);
                } elseif ($expiryStatus == 'valid') {
                    $query->where('expiry_date', '>', $thirtyDaysFromNow);
                }
            }

            // Filter by personnel
            if ($request->has('personnel_id')) {
                $query->where('personnel_id', $request->get('personnel_id'));
            }

            $certificates = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $certificates,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get certificates error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get single certificate by ID
     * GET /api/certificates/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $certificate = Certificate::with('personnel')->find($id);

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $certificate,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get certificate error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Create new certificate
     * POST /api/certificates
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'personnel_id' => 'required|integer|exists:personnel,id',
                'certificate_type' => 'required|string|max:255',
                'certificate_number' => 'required|string|unique:certificates|max:255',
                'issue_date' => 'required|date',
                'expiry_date' => 'required|date|after:issue_date',
                'issuer' => 'nullable|string|max:255',
                'status' => 'required|in:active,inactive,expired',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $certificate = Certificate::create($request->all());
            Log::info('Certificate created', ['certificate_id' => $certificate->id]);

            return response()->json([
                'success' => true,
                'message' => 'Certificate created successfully',
                'data' => $certificate,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create certificate error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Update certificate
     * PUT /api/certificates/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $certificate = Certificate::find($id);

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not found',
                ], 404);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'certificate_type' => 'sometimes|required|string|max:255',
                'issue_date' => 'sometimes|required|date',
                'expiry_date' => 'sometimes|required|date',
                'issuer' => 'nullable|string|max:255',
                'status' => 'sometimes|required|in:active,inactive,expired',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $certificate->update($request->all());
            Log::info('Certificate updated', ['certificate_id' => $certificate->id]);

            return response()->json([
                'success' => true,
                'message' => 'Certificate updated successfully',
                'data' => $certificate,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update certificate error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Delete certificate
     * DELETE /api/certificates/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $certificate = Certificate::find($id);

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not found',
                ], 404);
            }

            $certificate->delete();
            Log::info('Certificate deleted', ['certificate_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Certificate deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete certificate error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
