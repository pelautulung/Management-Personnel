<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Company;
use App\Models\Personnel;
use App\Models\Certificate;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     * GET /api/dashboard/stats
     */
    public function stats(Request $request)
    {
        try {
            $user = $request->user();
            $stats = [];

            if ($user->isSuperAdmin() || $user->isAdmin()) {
                // Admin/SuperAdmin stats
                $stats = [
                    'total_companies' => Company::count(),
                    'total_users' => User::count(),
                    'total_personnel' => Personnel::count(),
                    'total_certificates' => Certificate::count(),
                    'active_personnel' => Personnel::where('status', 'active')->count(),
                    'inactive_personnel' => Personnel::where('status', 'inactive')->count(),
                    'pending_submissions' => Submission::where('status', 'pending')->count(),
                    'approved_submissions' => Submission::where('status', 'approved')->count(),
                    'rejected_submissions' => Submission::where('status', 'rejected')->count(),
                ];
            } else if ($user->isContractor()) {
                // Contractor stats
                $stats = [
                    'company_personnel' => Personnel::where('company_id', $user->company_id)->count(),
                    'active_personnel' => Personnel::where('company_id', $user->company_id)
                                                    ->where('status', 'active')->count(),
                    'pending_submissions' => Submission::where('company_id', $user->company_id)
                                                        ->where('status', 'pending')->count(),
                    'approved_submissions' => Submission::where('company_id', $user->company_id)
                                                         ->where('status', 'approved')->count(),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get personnel status summary
     * GET /api/dashboard/personnel-summary
     */
    public function personnelSummary(Request $request)
    {
        try {
            $user = $request->user();
            $query = Personnel::query();

            if ($user->isContractor()) {
                $query->where('company_id', $user->company_id);
            }

            $summary = [
                'total' => $query->count(),
                'by_status' => $query->select('status', DB::raw('count(*) as count'))
                                    ->groupBy('status')
                                    ->pluck('count', 'status')
                                    ->toArray(),
                'by_department' => $query->select('department', DB::raw('count(*) as count'))
                                        ->groupBy('department')
                                        ->pluck('count', 'department')
                                        ->toArray(),
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Personnel summary error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get certificate expiry status
     * GET /api/dashboard/certificate-expiry
     */
    public function certificateExpiry(Request $request)
    {
        try {
            $user = $request->user();
            $query = Certificate::query();

            if ($user->isContractor()) {
                $query->whereHas('personnel', function ($q) use ($user) {
                    $q->where('company_id', $user->company_id);
                });
            }

            $today = now();
            $thirtyDaysFromNow = now()->addDays(30);

            $expiring = [
                'expired' => $query->where('expiry_date', '<', $today)->count(),
                'expiring_soon' => $query->whereBetween('expiry_date', [$today, $thirtyDaysFromNow])->count(),
                'valid' => $query->where('expiry_date', '>', $thirtyDaysFromNow)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $expiring,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Certificate expiry error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get recent activities
     * GET /api/dashboard/activities
     */
    public function activities(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            // For now, return submissions as recent activities
            $activities = Submission::with('personnel', 'company')
                                    ->orderBy('created_at', 'desc')
                                    ->limit($limit)
                                    ->get();

            return response()->json([
                'success' => true,
                'data' => $activities,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Activities error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get submission status summary
     * GET /api/dashboard/submission-summary
     */
    public function submissionSummary(Request $request)
    {
        try {
            $user = $request->user();
            $query = Submission::query();

            if ($user->isContractor()) {
                $query->where('company_id', $user->company_id);
            }

            $summary = [
                'total' => $query->count(),
                'by_status' => $query->select('status', DB::raw('count(*) as count'))
                                    ->groupBy('status')
                                    ->pluck('count', 'status')
                                    ->toArray(),
                'completion_rate' => $query->where('status', 'approved')->count() / max($query->count(), 1) * 100,
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Submission summary error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
