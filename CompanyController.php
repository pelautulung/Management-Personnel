<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    /**
     * Get all companies
     * GET /api/companies
     */
    public function index(Request $request)
    {
        try {
            $query = Company::query();

            // Search
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            // Filter active only
            if ($request->get('active_only') == 'true') {
                $query->where('status', 'active');
            }

            $companies = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $companies,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get companies error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get single company by ID
     * GET /api/companies/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $company = Company::with('personnel')->find($id);

            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $company,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get company error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Create new company
     * POST /api/companies
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'code' => 'required|string|unique:companies|max:50',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'status' => 'required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $company = Company::create($request->all());
            Log::info('Company created', ['company_id' => $company->id]);

            return response()->json([
                'success' => true,
                'message' => 'Company created successfully',
                'data' => $company,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create company error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Update company
     * PUT /api/companies/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $company = Company::find($id);

            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found',
                ], 404);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'status' => 'sometimes|required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $company->update($request->all());
            Log::info('Company updated', ['company_id' => $company->id]);

            return response()->json([
                'success' => true,
                'message' => 'Company updated successfully',
                'data' => $company,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update company error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Delete company
     * DELETE /api/companies/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $company = Company::find($id);

            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found',
                ], 404);
            }

            $company->delete();
            Log::info('Company deleted', ['company_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Company deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete company error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
