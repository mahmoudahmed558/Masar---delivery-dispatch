<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        $admin = User::create(['name'=>'Admin', 'phone'=>'01000000000', 'password'=>Hash::make('password'), 'role'=>'admin']);
        $manager = User::create(['name'=>'Manager', 'phone'=>'01100000000', 'password'=>Hash::make('password'), 'role'=>'manager']);
        $p1 = User::create(['name'=>'Ahmed', 'phone'=>'01200000001', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        $p2 = User::create(['name'=>'Mohamed', 'phone'=>'01200000002', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        $p3 = User::create(['name'=>'Hassan', 'phone'=>'01200000003', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        $c1 = User::create(['name'=>'Customer One', 'phone'=>'01500000001', 'password'=>Hash::make('password'), 'role'=>'user']);
        $c2 = User::create(['name'=>'Customer Two', 'phone'=>'01500000002', 'password'=>Hash::make('password'), 'role'=>'user']);
        
        $os = new OrderService();
        for($i=0; $i<10; $i++) {
            $os->create([
                'pickup_name' => 'Pickup ' . $i, 'pickup_phone' => '01011111111', 'pickup_address' => 'Addr ' . $i,
                'dropoff_name' => 'Drop ' . $i, 'dropoff_phone' => '01022222222', 'dropoff_address' => 'DAddr ' . $i,
                'delivery_fee' => 50, 'cod_amount' => 100
            ], $c1);
        }
    }
}
