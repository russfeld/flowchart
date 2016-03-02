<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    public function courses(){
    	return $this->belongsToMany('App\Models\Course', 'kstate8', 'area_id', 'course_id');
    }
}
