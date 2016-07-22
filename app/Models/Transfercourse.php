<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfercourse extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    public function completedcourse(){
      return $this->hasOne('App\Models\Completedcourse');
    }

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }
}
