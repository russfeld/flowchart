<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor');
    }

    public function student(){
    	return $this->belongsTo('App\Models\Student');
    }

    //hidden from JSON view
    protected $hidden = ['advisor_id', 'student_id', 'advisor', 'student', 'created_at', 'updated_at'];
    protected $dates = ['created_at', 'updated_at', 'start', 'end'];

}
