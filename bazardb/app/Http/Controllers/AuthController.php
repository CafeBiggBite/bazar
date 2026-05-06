<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'phone' => 'required|string|size:10',
        ]);

        // Validate Bangladesh phone format (10 digits without +880)
        if (!preg_match('/^[1][3-9]\d{8}$/', $validated['phone'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number. Please provide a valid 10-digit Bangladesh phone number (e.g., 1712345678)',
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => '+880' . $validated['phone'],
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Send password reset link
     */
    public function sendResetLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $status = Password::sendResetLink($validated);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => __($status),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __($status),
        ], 400);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required',
            'email' => 'required|string|email',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset($validated, function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();
        });

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => __($status),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __($status),
        ], 400);
    }
}
