<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Planrequirement extends Validatable
{

    protected $dates = ['created_at', 'updated_at'];

    public function plan(){
        return $this->belongsTo('App\Models\Plan')->withTrashed();
    }

    public function electivelist(){
        return $this->belongsTo('App\Models\Electivelist')->withTrashed();
    }

    protected $rules = array(
      'plan_id' => 'required|exists:plans,id',
      'semester' => 'required|integer',
      'ordering' => 'required|integer',
      'credits' => 'required|integer',
      'notes' => 'string',
      'course_name' => 'required_without:electivelist_id|string',
      'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
    );

    protected $fillable = ['notes', 'plan_id', 'semester', 'ordering', 'credits', 'course_name', 'electivelist_id'];
}
