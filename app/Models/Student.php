<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    public function user(){
        return $this->belongsTo('App\Models\User');
    }

    public function meetings(){
    	return $this->hasMany('App\Models\Meetings');
    }

    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor');
    }

    public function department(){
    	return $this->belongsTo('App\Models\Department');
    }

    public function getNameAttribute(){
        return $this->first_name . ' ' . $this->last_name;
    }

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "concat(students.first_name, \" \", students.last_name) LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }
}
