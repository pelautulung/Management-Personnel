<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'required|string',
            'role' => 'required|in:superadmin,admin,contractor',
            'company_id' => 'required_if:role,contractor|exists:companies,id',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'full_name' => $validated['full_name'],
            'role' => $validated['role'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            Log::info('Login attempt', ['username' => $request->username, 'ip' => $request->ip()]);

            $user = User::where('username', $request->username)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'username' => ['The provided credentials are incorrect.'],
                ]);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated',
                ], 403);
            }

            // Delete old tokens
            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            // Try to eager-load `company` if the relationship is present, but
            // don't let a missing/invalid relation break the login flow.
            $userData = $user;
            if (method_exists($user, 'company')) {
                try {
                    $userData = $user->load('company');
                } catch (\Throwable $relEx) {
                    Log::warning('Could not load company relation for user', ['user_id' => $user->id, 'error' => $relEx->getMessage()]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $userData,
                    'token' => $token,
                ],
            ]);
        } catch (ValidationException $ve) {
            throw $ve; // let validation exceptions be handled by framework (422)
        } catch (\Throwable $e) {
            Log::error('Login error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $msg = config('app.debug') ? $e->getMessage() : 'Internal server error';
            return response()->json(['success' => false, 'message' => $msg], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('company'),
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed successfully',
            'data' => [
                'token' => $token,
            ],
        ]);
    }
}
