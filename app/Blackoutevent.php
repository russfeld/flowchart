<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Blackoutevent extends Model
{
    public function blackout(){
    	return $this->belongsTo('App\Blackout');
    }

    public function advisor(){
    	return $this->belongsTo('App\Advisor');
    }
}
