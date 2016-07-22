<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function program(){
        return $this->belongsTo('App\Models\Degreeprogram')->withTrashed();
    }
}
