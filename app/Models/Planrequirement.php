<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Validator;
use App\Events\PlanRequirementSaved;

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

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    public function completedcourse(){
        return $this->belongsTo('App\Models\Completedcourse');
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
          'notes' => 'string|max:20',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists_or_null:electivelists,id',
          'course_id' => 'sometimes|exists_or_null:courses,id',
          'completedcourse_id' => 'sometimes|exists_or_null:completedcourses,id,student_id,' . $params[2],
          'course_id_lock' => 'required|boolean',
          'completedcourse_id_lock' => 'required|boolean',
        );
      }else{
        return array(
          'plan_id' => 'required|exists:plans,id',
          'semester_id' => 'required|integer|exists:semesters,id,plan_id,' . $params[1] .'|unique_with:planrequirements,ordering,plan_id,' . $params[0],
          'ordering' => 'required|integer|unique_with:planrequirements,semester_id,plan_id,' . $params[0],
          'credits' => 'required|integer',
          'notes' => 'string|max:20',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists_or_null:electivelists,id',
          'course_id' => 'sometimes|exists_or_null:courses,id',
          'completedcourse_id' => 'sometimes|exists_or_null:completedcourses,id,student_id,' . $params[2],
          'course_id_lock' => 'required|boolean',
          'completedcourse_id_lock' => 'required|boolean',
        );
      }
    }

    public function customEditValidate($data, $params)
    {
        $rules = array(
          'notes' => 'string|max:20',
          'course_name' => 'required_without:electivelist_id|string',
          'electivelist_id' => 'required_without:course_name|exists_or_null:electivelists,id',
          'credits' => 'required|integer',
          'course_id' => 'sometimes|exists_or_null:courses,id',
          'completedcourse_id' => 'sometimes|exists_or_null:completedcourses,id,student_id,' . $params[0],
          'course_id_lock' => 'required|boolean',
          'completedcourse_id_lock' => 'required|boolean',
        );
        // make a new validator object
        $v = Validator::make($data, $rules);

        // check for failure
        if ($v->fails())
        {
            // set errors and return false
            $this->errors = $v->errors();
            return false;
        }

        // validation pass
        return true;
    }

    public function defaultEditValidate($data, $params)
    {
        $rules = array(
          'notes' => 'string|max:20',
          'course_name' => 'sometimes|string',
          'course_id' => 'sometimes|exists_or_null:courses,id',
          'completedcourse_id' => 'sometimes|exists_or_null:completedcourses,id,student_id,' . $params[0],
          'course_id_lock' => 'required|boolean',
          'completedcourse_id_lock' => 'required|boolean',
        );
        // make a new validator object
        $v = Validator::make($data, $rules);

        // check for failure
        if ($v->fails())
        {
            // set errors and return false
            $this->errors = $v->errors();
            return false;
        }

        // validation pass
        return true;
    }

    public function validateElectiveCourse(){
      if($this->electivelist_id != null){
        if($this->course_name == null || strlen($this->course_name) == 0){
          return true;
        }
        $electivelist = $this->electivelist;
        $parts = explode(" ", strtoupper($this->course_name));
        if(count($parts) != 2){
          return false;
        }
        $prefix = $parts[0];
        $number = intval($parts[1]);
        $electivecourses = $electivelist->courses->whereIn('course_prefix', ["*", $prefix]);
        foreach($electivecourses as $electivecourse){
          if($electivecourse->course_max_number == null){
            if($electivecourse->course_min_number == $number){
              return true;
            }
          }else{
            if($electivecourse->course_min_number <= $number && $electivecourse->course_max_number >= $number){
              return true;
            }
          }
        }
        return false;
      }else{
        return true;
      }
    }

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "planrequirements.course_name LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }

    protected $fillable = ['notes', 'plan_id', 'semester_id', 'ordering', 'credits', 'course_name', 'electivelist_id', 'course_id', 'completedcourse_id', 'course_id_lock', 'completedcourse_id_lock'];

    protected $events = [
      'saving' => PlanRequirementSaved::class,
    ];
}
