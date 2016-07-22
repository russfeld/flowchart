<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Completedcourse extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function transfercourse(){
      return $this->belongsTo('App\Models\Transfercourse');
    }

    public function requirement(){
        return $this->hasOne('App\Models\Planrequirement');
    }

}
