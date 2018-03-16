<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Plan;

class Semester extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    //https://github.com/felixkiss/uniquewith-validator

    protected function rules($params){
      if($params[0] < 0){
        return array(
          'name' => 'required|string',
          'number' => 'required|integer|unique_with:semesters,plan_id',
          'ordering' => 'required|integer|unique_with:semesters,plan_id',
          'plan_id' => 'required|exists:plans,id',
        );
      }else{
        return array(
          'name' => 'required|string',
          'number' => 'required|integer|unique_with:semesters,plan_id,' . $params[0],
          'ordering' => 'required|integer|unique_with:semesters,plan_id,'. $params[0],
          'plan_id' => 'required|exists:plans,id',
        );
      }
    }

    protected $fillable = ['name', 'number', 'ordering', 'plan_id'];

    public function plan(){
        return $this->belongsTo('App\Models\Plan')->withTrashed();
    }
}
