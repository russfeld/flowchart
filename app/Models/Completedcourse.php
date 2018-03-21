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

    public function requirement(){
        return $this->hasMany('App\Models\Planrequirement');
    }

    public function getFullTitleAttribute(){
    	return $this->name . ' (' . $this->semestertext . ' - ' . $this->grade .')';
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

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "completedcourses.name LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }

}
