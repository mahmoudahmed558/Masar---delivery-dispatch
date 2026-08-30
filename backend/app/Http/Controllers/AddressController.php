<?php
namespace App\Http\Controllers;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller {
    public function index(Request $request) { 
        return response()->json(['success'=>true, 'data'=>$request->user()->addresses, 'message'=>'Ok']); 
    }
    
    public function show(Request $request, $id) {
        $address = $request->user()->addresses()->findOrFail($id);
        return response()->json(['success'=>true, 'data'=>$address, 'message'=>'Ok']);
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'label' => 'required|string|max:50',
            'address' => 'required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric'
        ]);
        $data['user_id'] = $request->user()->id;
        return response()->json(['success'=>true, 'data'=>Address::create($data), 'message'=>'Created'], 201);
    }
    
    public function update(Request $request, $id) {
        $address = $request->user()->addresses()->findOrFail($id);
        $data = $request->validate([
            'label' => 'sometimes|required|string|max:50',
            'address' => 'sometimes|required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric'
        ]);
        $address->update($data);
        return response()->json(['success'=>true, 'data'=>$address, 'message'=>'Updated']);
    }
    
    public function destroy(Request $request, $id) {
        $request->user()->addresses()->findOrFail($id)->delete();
        return response()->json(['success'=>true, 'data'=>null, 'message'=>'Deleted']);
    }
}
