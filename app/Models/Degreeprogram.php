<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Degreeprogram extends Model
{
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    public function department(){
        return $this->belongsTo('App\Models\Department')->withTrashed();
    }

    public function requirements(){
    	return $this->hasMany('App\Models\Degreerequirement');
    }

    public function plans(){
    	return $this->hasMany('App\Models\Plan')->withTrashed();
    }
}
