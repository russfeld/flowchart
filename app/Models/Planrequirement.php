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

    protected function rules($params){
      if($params[0] < 0){
        return array(
          'plan_id' => 'required|exists:plans,id',
          'semester' => 'required|integer|exists:semesters,number,plan_id,' . $params[1] .'|unique_with:planrequirements,ordering,degreeprogram_id',
          'ordering' => 'required|integer|unique_with:planrequirements,semester,degreeprogram_id',
          'credits' => 'required|integer',
          'notes' => 'string',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
        );
      }else{
        return array(
          'plan_id' => 'required|exists:plans,id',
          'semester' => 'required|integer|exists:semesters,number,plan_id,' . $params[1] .'|unique_with:planrequirements,ordering,degreeprogram_id,' . $params[0],
          'ordering' => 'required|integer|unique_with:planrequirements,semester,degreeprogram_id,' . $params[0],
          'credits' => 'required|integer',
          'notes' => 'string',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
        );
      }
    }

    protected $fillable = ['notes', 'plan_id', 'semester', 'ordering', 'credits', 'course_name', 'electivelist_id'];
}
