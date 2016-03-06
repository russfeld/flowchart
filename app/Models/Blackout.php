<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blackout extends Model
{
    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor');
    }

    public function events(){
    	return $this->hasMany('App\Models\Blackoutevent');
    }

    protected $dates = ['created_at', 'updated_at', 'start', 'end', 'repeat_until'];
}
