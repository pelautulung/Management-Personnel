<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Notification;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Submission::with(['personnel.company', 'submitter', 'reviewer']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by company for contractors
        if ($request->user()->isContractor()) {
            $query->whereHas('personnel', function($q) use ($request) {
                $q->where('company_id', $request->user()->company_id);
            });
        }

        $submissions = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnel,id',
            'submission_type' => 'required|string|max:100',
        ]);

        $submission = Submission::create([
            'personnel_id' => $validated['personnel_id'],
            'submitted_by' => $request->user()->id,
            'submission_type' => $validated['submission_type'],
            'status' => 'pending',
            'submission_date' => now(),
        ]);

        // Create notification for admins
        $this->notifyAdmins($submission);

        return response()->json([
            'success' => true,
            'message' => 'Submission created successfully',
            'data' => $submission->load(['personnel', 'submitter']),
        ], 201);
    }

    public function show($id)
    {
        $submission = Submission::with(['personnel.company', 'submitter', 'reviewer'])
                                ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $submission,
        ]);
    }

    public function approve(Request $request, $id)
    {
        if (!$request->user()->isAdmin() && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to approve submissions',
            ], 403);
        }

        $submission = Submission::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => 'nullable|string',
        ]);

        $submission->approve($request->user(), $validated['review_notes'] ?? null);

        // Notify submitter
        Notification::create([
            'user_id' => $submission->submitted_by,
            'title' => 'Submission Approved',
            'message' => "Your submission for {$submission->personnel->full_name} has been approved.",
            'type' => 'success',
            'related_table' => 'submissions',
            'related_id' => $submission->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission approved successfully',
            'data' => $submission->fresh(['personnel', 'submitter', 'reviewer']),
        ]);
    }

    public function reject(Request $request, $id)
    {
        if (!$request->user()->isAdmin() && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to reject submissions',
            ], 403);
        }

        $submission = Submission::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => 'required|string',
        ]);

        $submission->reject($request->user(), $validated['review_notes']);

        // Notify submitter
        Notification::create([
            'user_id' => $submission->submitted_by,
            'title' => 'Submission Rejected',
            'message' => "Your submission for {$submission->personnel->full_name} has been rejected.",
            'type' => 'error',
            'related_table' => 'submissions',
            'related_id' => $submission->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission rejected',
            'data' => $submission->fresh(['personnel', 'submitter', 'reviewer']),
        ]);
    }

    private function notifyAdmins($submission)
    {
        $admins = \App\Models\User::whereIn('role', ['admin', 'superadmin'])->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Submission',
                'message' => "New certification submission for {$submission->personnel->full_name}",
                'type' => 'info',
                'related_table' => 'submissions',
                'related_id' => $submission->id,
            ]);
        }
    }
}
