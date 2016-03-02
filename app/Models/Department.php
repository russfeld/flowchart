<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    public function advisors(){
        return $this->hasMany('App\Models\Advisor')->orderBy('name');
    }

    public function students(){
        return $this->hasMany('App\Models\Student')->orderBy('last_name');
    }
}
