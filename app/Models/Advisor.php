<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Advisor extends Model
{

    use SoftDeletes;

    protected $dates = ['deleted_at', 'created_at', 'updated_at'];

    public function user(){
        return $this->belongsTo('App\Models\User')->withTrashed();
    }

    public function department(){
        return $this->belongsTo('App\Models\Department')->withTrashed();
    }

    public function meetings(){
    	return $this->hasMany('App\Models\Meeting');
    }

    public function students(){
    	return $this->hasMany('App\Models\Student');
    }

    public function blackouts(){
    	return $this->hasMany('App\Models\Blackout');
    }

    public function events(){
    	return $this->hasMany('App\Models\Blackoutevent');
    }
}
