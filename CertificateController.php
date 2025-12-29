<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Personnel;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = Certificate::with(['personnel.company', 'issuer']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter expiring soon
        if ($request->has('expiring_soon')) {
            $query->expiringSoon($request->get('days', 30));
        }

        // Search by certificate number
        if ($request->has('search')) {
            $query->where('certificate_number', 'like', "%{$request->search}%");
        }

        $certificates = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $certificates,
        ]);
    }

    public function store(Request $request)
    {
        // Only admin and superadmin can issue certificates
        if (!$request->user()->isAdmin() && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to issue certificates',
            ], 403);
        }

        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnel,id',
            'certificate_type' => 'required|string|max:50',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
        ]);

        // Generate certificate number
        $certificateNumber = 'SBTC-' . date('Y') . '-' . str_pad(Certificate::count() + 1, 5, '0', STR_PAD_LEFT);

        // Generate QR Code
        $qrCode = base64_encode(QrCode::format('png')
            ->size(300)
            ->generate(route('certificates.verify', $certificateNumber)));

        $certificate = Certificate::create([
            'personnel_id' => $validated['personnel_id'],
            'certificate_type' => $validated['certificate_type'],
            'certificate_number' => $certificateNumber,
            'issue_date' => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'],
            'status' => 'active',
            'issued_by' => $request->user()->id,
            'qr_code' => $qrCode,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Certificate issued successfully',
            'data' => $certificate->load(['personnel', 'issuer']),
        ], 201);
    }

    public function show($id)
    {
        $certificate = Certificate::with(['personnel.company', 'issuer'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $certificate,
        ]);
    }

    public function update(Request $request, $id)
    {
        $certificate = Certificate::findOrFail($id);

        $validated = $request->validate([
            'expiry_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,expired,revoked',
        ]);

        $certificate->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Certificate updated successfully',
            'data' => $certificate->fresh(['personnel', 'issuer']),
        ]);
    }

    public function destroy($id)
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->revoke();

        return response()->json([
            'success' => true,
            'message' => 'Certificate revoked successfully',
        ]);
    }

    public function verify($certificateNumber)
    {
        $certificate = Certificate::where('certificate_number', $certificateNumber)
                                  ->with(['personnel.company'])
                                  ->first();

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'certificate' => $certificate,
                'is_valid' => $certificate->status === 'active' && !$certificate->is_expired,
            ],
        ]);
    }
}
