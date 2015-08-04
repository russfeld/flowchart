<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    public function advisor(){
    	return $this->belongsTo('App\Advisor');
    }

    public function student(){
    	return $this->belongsTo('App\Student');
    }
}
