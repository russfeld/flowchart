<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Degreerequirement extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function program(){
        return $this->belongsTo('App\Models\Degreeprogram')->withTrashed();
    }

    public function requireable(){
      return $this->morphTo();
    }
}
