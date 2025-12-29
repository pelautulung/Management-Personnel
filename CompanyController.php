<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::withCount(['users', 'personnel']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('company_code', 'like', "%{$search}%");
            });
        }

        // Filter active only
        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $companies = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        // Only superadmin can create companies
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to create companies',
            ], 403);
        }

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_code' => 'required|string|max:50|unique:companies',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $company = Company::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company created successfully',
            'data' => $company,
        ], 201);
    }

    public function show($id)
    {
        $company = Company::withCount(['users', 'personnel'])
                          ->with(['users', 'personnel'])
                          ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $company,
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update companies',
            ], 403);
        }

        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'company_code' => 'sometimes|string|max:50|unique:companies,company_code,' . $id,
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company updated successfully',
            'data' => $company->fresh(),
        ]);
    }

    public function destroy($id)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete companies',
            ], 403);
        }

        $company = Company::findOrFail($id);
        $company->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully',
        ]);
    }
}
