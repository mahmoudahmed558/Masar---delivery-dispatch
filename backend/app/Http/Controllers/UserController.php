<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller {
    public function index() {
        $users = User::paginate(20);
        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'message' => 'Ok'
        ]);
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users',
            'email' => 'nullable|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['user','pilot','manager','admin'])],
            'vehicle_type' => 'nullable|string'
        ]);
        
        $data['password'] = Hash::make($data['password']);
        return response()->json(['success'=>true, 'data'=>User::create($data), 'message'=>'Created'], 201);
    }
    
    public function show($id) { 
        return response()->json(['success'=>true, 'data'=>User::findOrFail($id), 'message'=>'Ok']); 
    }
    
    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in(['user','pilot','manager','admin'])],
            'vehicle_type' => 'nullable|string'
        ]);
        
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        $user->update($data);
        return response()->json(['success'=>true, 'data'=>$user, 'message'=>'Updated']);
    }
    
    public function destroy($id) {
        User::findOrFail($id)->update(['is_active'=>false]);
        return response()->json(['success'=>true, 'data'=>null, 'message'=>'Deactivated']);
    }
}
