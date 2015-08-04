<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    public function advisors(){
        return $this->hasMany('App\Advisor');
    }
}
