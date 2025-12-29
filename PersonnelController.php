<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function index(Request $request)
    {
        $query = Personnel::with(['company', 'creator', 'certificates']);

        // Filter by company for contractors
        if ($request->user()->isContractor()) {
            $query->where('company_id', $request->user()->company_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $personnel = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $personnel,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'full_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string|max:100',
        ]);

        // Contractors can only add personnel to their own company
        if ($request->user()->isContractor()) {
            $validated['company_id'] = $request->user()->company_id;
        }

        $validated['created_by'] = $request->user()->id;

        $personnel = Personnel::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Personnel created successfully',
            'data' => $personnel->load(['company', 'creator']),
        ], 201);
    }

    public function show($id)
    {
        $personnel = Personnel::with(['company', 'creator', 'certificates', 'documents', 'submissions'])
                              ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $personnel,
        ]);
    }

    public function update(Request $request, $id)
    {
        $personnel = Personnel::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string|max:100',
        ]);

        $personnel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Personnel updated successfully',
            'data' => $personnel->fresh(['company', 'creator']),
        ]);
    }

    public function destroy($id)
    {
        $personnel = Personnel::findOrFail($id);
        $personnel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personnel deleted successfully',
        ]);
    }
}
