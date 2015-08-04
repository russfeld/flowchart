<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Advisor extends Model
{
    public function user(){
        return $this->belongsTo('App\User');
    }

    public function department(){
        return $this->belongsTo('App\Department');
    }

    public function meetings(){
    	return $this->hasMany('App\Meeting');
    }

    public function students(){
    	return $this->hasMany('App\Student');
    }

    public function blackouts(){
    	return $this->hasMany('App\Blackout');
    }

    public function events(){
    	return $this->hasMany('App\Blackoutevent');
    }
}
