<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    public function advisors(){
        return $this->hasMany('App\Advisor')->orderBy('name');
    }

    public function students(){
        return $this->hasMany('App\Student')->orderBy('last_name');
    }
}
