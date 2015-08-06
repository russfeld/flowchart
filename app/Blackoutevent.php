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

    protected $hidden = ['advisor_id', 'blackout_id', 'advisor', 'blackout', 'created_at', 'updated_at'];

    //added to JSON view
    protected $appends = ['type'];

    public function getTypeAttribute(){
    	return "b";
    }
}
