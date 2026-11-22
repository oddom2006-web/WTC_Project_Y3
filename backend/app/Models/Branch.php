<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = ['name', 'lat', 'lng'];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function toApiArray(): array
    {
        return [
            'id'        => (string) $this->id,
            'name'      => $this->name,
            'lat'       => $this->lat,
            'lng'       => $this->lng,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
