<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Electivelists extends Model
{
    protected $dates = ['created_at', 'updated_at'];

    public function courses(){
        return $this->hasMany('App\Models\Electivelistcourse');
    }

    public function degreerequirements(){
        return $this->hasMany('App\Models\Degreeelectivecourse');
    }

    public function planrequirements(){
        return $this->hasMany('App\Models\Planelectivecourse');
    }

}
