<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Plan;

class Semester extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    protected $rules = array(
      'name' => 'required|string',
      'number' => 'required|integer',
      'ordering' => 'required|integer',
      'plan_id' => 'required|exists:plans,id',
    );

    protected $fillable = ['name', 'number', 'ordering', 'plan_id'];

    public function plan(){
        return $this->belongsTo('App\Models\Plan')->withTrashed();
    }
}
