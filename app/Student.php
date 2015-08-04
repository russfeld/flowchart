<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    public function user(){
        return $this->belongsTo('App\User');
    }

    public function meetings(){
    	return $this->hasMany('App\Meetings');
    }

    public function advisor(){
    	return $this->belongsTo('App\Advisor');
    }
}
