<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class College extends Model
{
    public function categories(){
    	return $this->hasMany('App\Models\Category')->orderBy('category_name', 'asc');
    }

    protected $dates = ['created_at', 'updated_at'];
}
