<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advisor extends Model
{
    public function user(){
        return $this->belongsTo('App\Models\User');
    }

    public function department(){
        return $this->belongsTo('App\Models\Department');
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
