<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blackoutevent extends Model
{
    public function blackout(){
    	return $this->belongsTo('App\Models\Blackout');
    }

    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor')->withTrashed();
    }

    protected $dates = ['created_at', 'updated_at', 'start', 'end'];

}
