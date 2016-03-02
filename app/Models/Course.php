<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    public function followers(){
    	return $this->belongsToMany('App\Models\Course', 'prerequisites', 'prerequisite_course_id', 'prerequisite_for_course_id');
    }

    public function prerequisites(){
    	return $this->belongsToMany('App\Models\Course', 'prerequisites', 'prerequisite_for_course_id', 'prerequisite_course_id');
    }

    public function areas(){
    	return $this->belongsToMany('App\Models\Area', 'kstate8', 'course_id', 'area_id');
    }

    public function getNumberStrAttribute(){
    	return str_pad($this->number, 3, '0');
    }

    public function getFullTitleAttribute(){
    	return $this->prefix . ' ' . $this->numberStr . ' - ' . $this->title;
    }

}
