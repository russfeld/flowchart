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

    //hidden from JSON view
    protected $hidden = ['advisor_id', 'student_id', 'advisor', 'student', 'created_at', 'updated_at'];

    //added to JSON view
    protected $appends = ['type'];

    public function getTypeAttribute(){
    	return "m";
    }

}
