<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Planrequirement extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function plan(){
        return $this->belongsTo('App\Models\Plan')->withTrashed();
    }

    public function requireable(){
      return $this->morphTo();
    }

    public function completedcourse(){
      return $this->belongsTo('App\Models\Completedcourse');
    }
}
