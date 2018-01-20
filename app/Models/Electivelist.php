<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Electivelist extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    use softDeletes;

    protected $rules = array(
      'name' => 'required|string',
      'abbreviation' => 'required|string|max:10',
    );

    protected $fillable = ['name', 'abbreviation'];

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
