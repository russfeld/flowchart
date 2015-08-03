<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Prefix extends Model
{
    public function category(){
    	return $this->belongsTo('App\Category');
    }
}
