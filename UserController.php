<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     * GET /api/users
     */
    public function index(Request $request)
    {
        try {
            // Only superadmin can view all users
            if (!$request->user() || !$request->user()->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $query = User::query();

            // Filter by role
            if ($request->has('role')) {
                $query->where('role', $request->get('role'));
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Search
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $users,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get users error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Get single user by ID
     * GET /api/users/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Users can only view their own profile unless they are admin
            if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Create new user (admin only)
     * POST /api/users
     */
    public function store(Request $request)
    {
        try {
            // Only admin can create users
            if (!$request->user() || !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|unique:users|max:255',
                'email' => 'required|email|unique:users|max:255',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:superadmin,admin,contractor',
                'status' => 'required|in:active,inactive',
                'company_id' => 'nullable|integer|exists:companies,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->status,
                'company_id' => $request->company_id,
            ]);

            Log::info('User created', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Update user
     * PUT /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Users can only update their own profile unless they are admin
            if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Validate input
            $rules = [
                'email' => 'sometimes|required|email|unique:users,email,' . $id . '|max:255',
                'status' => 'sometimes|required|in:active,inactive',
            ];

            // Only admin can change role
            if ($request->has('role') && $request->user()->isAdmin()) {
                $rules['role'] = 'sometimes|required|in:superadmin,admin,contractor';
            }

            // Allow password change if current password is provided
            if ($request->has('current_password') && $request->has('new_password')) {
                $rules['current_password'] = 'required|string';
                $rules['new_password'] = 'required|string|min:8|confirmed';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Verify current password if changing password
            if ($request->has('current_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect',
                    ], 401);
                }
                $user->password = Hash::make($request->new_password);
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            if ($request->has('status')) {
                $user->status = $request->status;
            }

            if ($request->has('role') && $request->user()->isAdmin()) {
                $user->role = $request->role;
            }

            $user->save();
            Log::info('User updated', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }

    /**
     * Delete user (admin only)
     * DELETE /api/users/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            // Only admin can delete users
            if (!$request->user() || !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Prevent deleting self
            if ($request->user()->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account',
                ], 400);
            }

            $user->delete();
            Log::info('User deleted', ['user_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error',
            ], 500);
        }
    }
}
