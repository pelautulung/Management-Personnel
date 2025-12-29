<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\Personnel;
use App\Models\Certificate;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $stats = [];

        if ($user->isSuperAdmin() || $user->isAdmin()) {
            // Admin/Superadmin stats
            $stats = [
                'total_companies' => Company::active()->count(),
                'total_users' => User::where('is_active', true)->count(),
                'total_personnel' => Personnel::count(),
                'total_certificates' => Certificate::count(),
                'active_certificates' => Certificate::active()->count(),
                'expired_certificates' => Certificate::where('status', 'expired')->count(),
                'expiring_soon' => Certificate::expiringSoon(30)->count(),
                'pending_submissions' => Submission::pending()->count(),
                'approved_submissions' => Submission::approved()->count(),
                'rejected_submissions' => Submission::rejected()->count(),
            ];

            // Certificate stats by type
            $stats['certificates_by_type'] = Certificate::select('certificate_type', DB::raw('count(*) as total'))
                ->groupBy('certificate_type')
                ->get();

            // Monthly certificate issuance
            $stats['monthly_certificates'] = Certificate::select(
                    DB::raw('MONTH(issue_date) as month'),
                    DB::raw('YEAR(issue_date) as year'),
                    DB::raw('count(*) as total')
                )
                ->whereYear('issue_date', date('Y'))
                ->groupBy('year', 'month')
                ->orderBy('month')
                ->get();

        } elseif ($user->isContractor()) {
            // Contractor stats
            $companyId = $user->company_id;

            $stats = [
                'company_personnel' => Personnel::where('company_id', $companyId)->count(),
                'active_certificates' => Certificate::whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })->active()->count(),
                'expired_certificates' => Certificate::whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })->where('status', 'expired')->count(),
                'expiring_soon' => Certificate::whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })->expiringSoon(30)->count(),
                'pending_submissions' => Submission::whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })->pending()->count(),
                'approved_submissions' => Submission::whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })->approved()->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function recentActivities(Request $request)
    {
        $user = $request->user();
        $limit = $request->get('limit', 10);

        $activities = [];

        if ($user->isSuperAdmin() || $user->isAdmin()) {
            // Recent submissions
            $activities['recent_submissions'] = Submission::with(['personnel', 'submitter'])
                ->latest()
                ->limit($limit)
                ->get();

            // Recent certificates
            $activities['recent_certificates'] = Certificate::with(['personnel', 'issuer'])
                ->latest()
                ->limit($limit)
                ->get();

        } elseif ($user->isContractor()) {
            $companyId = $user->company_id;

            // Company's recent submissions
            $activities['recent_submissions'] = Submission::with(['personnel', 'submitter'])
                ->whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })
                ->latest()
                ->limit($limit)
                ->get();

            // Company's recent certificates
            $activities['recent_certificates'] = Certificate::with(['personnel', 'issuer'])
                ->whereHas('personnel', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })
                ->latest()
                ->limit($limit)
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }
}
