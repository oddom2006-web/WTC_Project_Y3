<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    public $timestamps = false;

    protected $table = 'order_history';

    protected $fillable = ['order_id', 'status', 'note', 'time'];

    protected function casts(): array
    {
        return [
            'time' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
