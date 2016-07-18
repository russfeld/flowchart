<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    public function advisors(){
        return $this->hasMany('App\Models\Advisor')->orderBy('name');
    }

    public function students(){
        return $this->hasMany('App\Models\Student')->orderBy('last_name');
    }
}
