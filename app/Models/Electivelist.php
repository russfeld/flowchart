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
      return $this->morphMany('App\Models\Degreerequirement', 'requireable');
    }

    public function planrequirements(){
        return $this->hasMany('App\Models\Planelectivecourse');
    }

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "electivelists.name LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }

}
