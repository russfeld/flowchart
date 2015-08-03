<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class College extends Model
{
    public function categories(){
    	return $this->hasMany('App\Category')->orderBy('category_name', 'asc');
    }
}
