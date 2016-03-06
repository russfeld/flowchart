<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public function college(){
    	return $this->belongsTo('App\Models\College');
    }

    public function prefixes(){
    	return $this->hasMany('App\Models\Prefix');
    }
}
