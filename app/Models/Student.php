<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{

    use SoftDeletes;

    protected $dates = ['deleted_at'];

    public function user(){
        return $this->belongsTo('App\Models\User')->withTrashed();
    }

    public function meetings(){
    	return $this->hasMany('App\Models\Meeting');
    }

    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor')->withTrashed();
    }

    public function department(){
    	return $this->belongsTo('App\Models\Department')->withTrashed();
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
