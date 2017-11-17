<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Electivelistcourse extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function electivelist(){
        return $this->belongsTo('App\Models\Electivelist');
    }

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }
}
