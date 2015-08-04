<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Blackout extends Model
{
    public function advisor(){
    	return $this->belongsTo('App\Advisor');
    }

    public function events(){
    	return $this->hasMany('App\Blackoutevent');
    }
}
