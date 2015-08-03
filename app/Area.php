<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    public function courses(){
    	return $this->belongsToMany('App\Course', 'kstate8', 'area_id', 'course_id');
    }
}
