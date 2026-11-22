<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public $timestamps = false;

    protected $table = 'notifications';

    protected $fillable = ['uid', 'title', 'body', 'type', 'read', 'time'];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
            'time' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }

    public function toApiArray(): array
    {
        return [
            'id'    => (string) $this->id,
            'uid'   => (string) $this->uid,
            'title' => $this->title,
            'body'  => $this->body,
            'type'  => $this->type,
            'read'  => $this->read,
            'time'  => $this->time?->toISOString(),
        ];
    }
}
