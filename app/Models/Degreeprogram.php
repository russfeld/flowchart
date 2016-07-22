<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Degreeprogram extends Validatable
{
    //Effective Semester: 1 = Spring, 2 = Summer, 3 = Fall

    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    protected $rules = array(
      'name' => 'required|string',
      'description' => 'required|string',
      'abbreviation' => 'required|string|max:10',
      'effective_year' => 'required|integer|digits:4',
      'effective_semester' => 'required|integer|between:0,4',
      'department_id' => 'sometimes|required|exists:departments,id',
    );

    protected $fillable = ['name', 'description', 'abbreviation', 'effective_year', 'effective_semester', 'department_id'];

    use SoftDeletes;

    public function department(){
        return $this->belongsTo('App\Models\Department')->withTrashed();
    }

    public function requirements(){
    	return $this->hasMany('App\Models\Degreerequirement');
    }

    public function plans(){
    	return $this->hasMany('App\Models\Plan')->withTrashed();
    }

    public function getEffectivetextAttribute(){
        switch ($this->effective_semester){
          case 1:
            return "Spring " . $this->effective_year;
          case 2:
            return "Summer " . $this->effective_year;
          case 3:
            return "Fall " . $this->effective_year;
          default:
            return "Semester " . $this->effective_semester . " " . $this->effective_year;
        }
    }
}
