<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverLocation extends Model
{
    protected $fillable = ['driver_id', 'lat', 'lng', 'heading', 'speed'];

    protected function casts(): array
    {
        return [
            'lat'     => 'float',
            'lng'     => 'float',
            'heading' => 'float',
            'speed'   => 'float',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
