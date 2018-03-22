<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Events\CompletedCourseSaved;

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
      'student_id' => 'sometimes|required|exists:students,id',
      'planrequirement_id' => 'sometimes|required|exists:planrequirements,id'
    );

    protected $fillable = ['name', 'coursenumber', 'year', 'semester', 'basis', 'grade', 'credits', 'student_id', 'planrequirement_id'];

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function transfercourse(){
      return $this->hasOne('App\Models\Transfercourse');
    }

    public function requirements(){
        return $this->hasMany('App\Models\Planrequirement');
    }

    public function getFullTitleAttribute(){
    	return $this->name . ' (' . $this->shortsemester . ' - ' . $this->grade .')';
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

    public function getShortsemesterAttribute(){
        switch ($this->semester){
          case 1:
            return "S" . substr($this->year, -2);
          case 2:
            return "Su" . substr($this->year, -2);
          case 3:
            return "F" . substr($this->year, -2);
          default:
            return $this->semester . "-" . substr($this->year, -2);
        }
    }

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "completedcourses.name LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }

    protected $events = [
      'saved' => CompletedCourseSaved::class,
    ];

}
