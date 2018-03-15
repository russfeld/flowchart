<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Planrequirement;
use App\Models\Degreeprogram;
use App\Models\Degreerequirement;

class Plan extends Validatable
{
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    use SoftDeletes;

    protected $rules = array(
      'name' => 'required|string',
      'description' => 'required|string',
      'start_year' => 'required|integer|digits:4',
      'start_semester' => 'required|integer|between:0,4',
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
    }

    public function fillRequirementsFromDegree(){
      $degreeprogram = $this->degreeprogram;
      foreach($degreeprogram->requirements as $requirement){
        $planrequirement = new Planrequirement();
        $planrequirement->fill($requirement->getAttributes());
        $planrequirement->degreerequirement_id = $requirement->id;
        $planrequirement->plan_id = $this->id;
        $planrequirement->save();
      }
    }
}
