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

    public function semester(){
        return $this->belongsTo('App\Models\Semester');
    }

    public function degreerequirement(){
      return $this->belongsTo('App\Models\Degreerequirement');
    }

    //https://github.com/felixkiss/uniquewith-validator

    protected function rules($params){
      if($params[0] < 0){
        return array(
          'plan_id' => 'required|exists:plans,id',
          'semester_id' => 'required|integer|exists:semesters,id,plan_id,' . $params[1] .'|unique_with:planrequirements,ordering,plan_id',
          'ordering' => 'required|integer|unique_with:planrequirements,semester_id,plan_id',
          'credits' => 'required|integer',
          'notes' => 'string',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
        );
      }else{
        return array(
          'plan_id' => 'required|exists:plans,id',
          'semester_id' => 'required|integer|exists:semesters,id,plan_id,' . $params[1] .'|unique_with:planrequirements,ordering,plan_id,' . $params[0],
          'ordering' => 'required|integer|unique_with:planrequirements,semester_id,plan_id,' . $params[0],
          'credits' => 'required|integer',
          'notes' => 'string',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
        );
      }
    }

    protected $fillable = ['notes', 'plan_id', 'semester_id', 'ordering', 'credits', 'course_name', 'electivelist_id'];
}
