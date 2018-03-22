<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Planrequirement;
use App\Models\Degreeprogram;
use App\Models\Degreerequirement;
use App\Models\Semester;

class Plan extends Validatable
{
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    use SoftDeletes;

    protected $rules = array(
      'name' => 'required|string',
      'description' => 'required|string',
      'start_year' => 'required|integer|digits:4',
      'start_semester' => 'required|integer|between:0,3',
      'degreeprogram_id' => 'required|exists:degreeprograms,id',
      'student_id' => 'required|exists:students,id',
    );

    protected $fillable = ['name', 'description', 'start_year', 'start_semester', 'degreeprogram_id', 'student_id'];

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function degreeprogram(){
        return $this->belongsTo('App\Models\Degreeprogram')->withTrashed();
    }

    public function requirements(){
    	return $this->hasMany('App\Models\Planrequirement');
    }

    public function semesters(){
      return $this->hasMany('App\Models\Semester');
    }

    public function getStarttextAttribute(){
        switch ($this->start_semester){
          case 1:
            return "Spring " . $this->start_year;
          case 2:
            return "Summer " . $this->start_year;
          case 3:
            return "Fall " . $this->start_year;
          default:
            return "Semester " . $this->start_semester . " " . $this->start_year;
        }
    }

    public function removeRequirements(){
      foreach($this->requirements as $requirement){
        $requirement->delete();
      }
      foreach($this->semesters as $semester){
        $semester->delete();
      }
    }

    public function fillRequirementsFromDegree(){
      $degreeprogram = $this->degreeprogram;
      $maxSemester = $degreeprogram->requirements->max('semester');
      $sem = $this->start_semester;
      $year = $this->start_year;
      $order = 0;
      $semesters = array();
      if($sem == 0){
        $sem = 3;
      }
      if($sem == 2){
        $semester = new Semester();
        $semester->name = "Summer " . $year;
        $semester->ordering = $order++;
        $semester->plan_id = $this->id;
        $sem = 3;
        $semester->save();
        $semesters[$maxSemester + 1] = $semester->id;
      }
      for($i = 0; $i <= $maxSemester; $i++){
        if($sem == 1){
          $semester = new Semester();
          $semester->name = "Spring " . $year;
          $semester->ordering = $order++;
          $semester->plan_id = $this->id;
          $sem = 3;
          $semester->save();
          $semesters[$i] = $semester->id;
        }else if ($sem == 3){
          $semester = new Semester();
          $semester->name = "Fall " . $year;
          $semester->ordering = $order++;
          $semester->plan_id = $this->id;
          $sem = 1;
          $year++;
          $semester->save();
          $semesters[$i] = $semester->id;
        }
      }
      foreach($degreeprogram->requirements as $requirement){
        $data = collect($requirement->getAttributes())->except(['degreeprogram_id', 'semester'])->toArray();
        $data['semester_id'] = $semesters[$requirement->semester];
        $planrequirement = new Planrequirement();
        $planrequirement->fill($data);
        $planrequirement->degreerequirement_id = $requirement->id;
        $planrequirement->plan_id = $this->id;
        $planrequirement->save();
      }

    }

    private function fillSemesters(){
      $maxSemester = $this->requirements->max('semester');
      $sem = $this->start_semester;
      $year = $this->start_year;
      $order = 0;
      if($sem == 2){
        $semester = new Semester();
        $semester->name = "Summer " . $year;
        $semester->number = $maxSemester + 1;
        $semester->ordering = $order++;
        $semester->plan_id = $this->id;
        $sem = 3;
        $semester->save();
      }
      for($i = 0; $i <= $maxSemester; $i++){
        if($sem == 1){
          $semester = new Semester();
          $semester->name = "Spring " . $year;
          $semester->number = $i;
          $semester->ordering = $order++;
          $semester->plan_id = $this->id;
          $sem = 3;
          $semester->save();
        }else if ($sem == 3){
          $semester = new Semester();
          $semester->name = "Fall " . $year;
          $semester->number = $i;
          $semester->ordering = $order++;
          $semester->plan_id = $this->id;
          $sem = 1;
          $year++;
          $semester->save();
        }
      }
    }
}
