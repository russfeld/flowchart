<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prefix extends Model
{
    public function category(){
    	return $this->belongsTo('App\Models\Category');
    }

    protected $dates = ['created_at', 'updated_at'];
}
