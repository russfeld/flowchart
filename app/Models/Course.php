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
    	return str_pad($this->number, 3, '0', STR_PAD_LEFT);
    }

    public function getFullTitleAttribute(){
    	return $this->prefix . ' ' . $this->numberStr . ' - ' . $this->title;
    }

    public function getShortTitleAttribute(){
      return $this->prefix . ' ' . $this->numberStr;
    }

    public function getNameAttribute(){
      return $this->title;
    }

    protected $dates = ['created_at', 'updated_at'];

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "concat(courses.prefix, \" \", lpad(courses.number, 3, 0), \" \",  courses.title) LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }

}
