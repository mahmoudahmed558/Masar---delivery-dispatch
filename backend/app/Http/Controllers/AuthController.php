<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'email' => 'nullable|email|unique:users',
        ]);
        $data['password'] = Hash::make($data['password']);
        $data['role'] = 'user';
        $user = User::create($data);
        $token = $user->createToken('auth')->plainTextToken;
        return response()->json([
            'success' => true,
            'data' => ['user' => $user, 'token' => $token],
            'message' => 'Registered'
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);
        $user = User::where('phone', $request->phone)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }
        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Account is deactivated'], 403);
        }
        $token = $user->createToken('auth')->plainTextToken;
        return response()->json([
            'success' => true,
            'data' => ['user' => $user, 'token' => $token],
            'message' => 'Logged in'
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'data' => null, 'message' => 'Logged out']);
    }

    public function me(Request $request) {
        return response()->json([
            'success' => true,
            'data' => ['user' => $request->user()],
            'message' => 'Profile'
        ]);
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $user->id,
        ]);
        $user->update($data);
        return response()->json([
            'success' => true,
            'data' => ['user' => $user->fresh()],
            'message' => 'Updated'
        ]);
    }

    public function changePassword(Request $request) {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);
        $user = $request->user();
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect'], 400);
        }
        $user->update(['password' => Hash::make($request->new_password)]);
        return response()->json(['success' => true, 'data' => null, 'message' => 'Password changed successfully']);
    }
}
