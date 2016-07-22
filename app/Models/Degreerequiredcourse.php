<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Degreerequiredcourse extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    public function requirement(){
        return $this->morphMany('App\Models\Degreerequirement', 'requireable');
    }
}
