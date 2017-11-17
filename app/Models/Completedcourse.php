<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Completedcourse extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    protected $rules = array(
      'name' => 'required|string',
      'coursenumber' => 'required|integer|digits:5',
      'year' => 'required|integer|digits:4',
      'semester' => 'required|integer|between:0,4',
      'basis' => 'string|max:5',
      'grade' => 'string|max:2',
      'credits' => 'required|integer|digits_between:1,2',
      'course_id' => 'sometimes|required|exists:courses,id',
      'student_id' => 'sometimes|required|exists:students,id',
      'planrequirement_id' => 'sometimes|required|exists:planrequirements,id'
    );

    protected $fillable = ['name', 'coursenumber', 'year', 'semester', 'basis', 'grade', 'credits', 'course_id', 'student_id', 'planrequirement_id'];

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function transfercourse(){
      return $this->belongsTo('App\Models\Transfercourse');
    }

    public function requirement(){
        return $this->belongsTo('App\Models\Planrequirement');
    }

    public function getSemestertextAttribute(){
        switch ($this->semester){
          case 1:
            return "Spring " . $this->year;
          case 2:
            return "Summer " . $this->year;
          case 3:
            return "Fall " . $this->year;
          default:
            return "Semester " . $this->semester . " " . $this->year;
        }
    }

}
