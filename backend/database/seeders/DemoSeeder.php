<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@itea3express.com'],
            ['username' => 'Admin', 'password' => Hash::make('admin123'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'driver@itea3express.com'],
            ['username' => 'Demo Driver', 'password' => Hash::make('driver123'), 'role' => 'driver', 'status' => 'active']
        );

        User::firstOrCreate(
            ['email' => 'nii@gmail.com'],
            ['username' => 'Nii', 'password' => Hash::make('cust123'), 'role' => 'customer']
        );

        user::firstOrCreate(
            ['email' => 'pich.employee@itea3express.com'],
            ['username' => 'Pich', 'password' => Hash::make('Pich@123'), 'role' => 'employee']
        );

        foreach (['Phnom Penh Branch', 'Siem Reap Branch', 'Battambang Branch', 'Sihanoukville Branch', 'Kampot Branch'] as $name) {
            Branch::firstOrCreate(['name' => $name]);
        }
    }
}
