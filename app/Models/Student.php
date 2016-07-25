<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Student extends Validatable
{

    use SoftDeletes;

    protected $dates = ['deleted_at', 'created_at', 'updated_at'];

    protected $rules = array(
          'first_name' => 'required|string',
          'last_name' => 'required|string',
          'email' => 'sometimes|required|email',
          'advisor_id' => 'sometimes|required|exists:advisors,id',
          'department_id' => 'sometimes|required|exists:departments,id',
    );

    public static function buildFromUser(User $user){
      $student = new Student();
      $student->user_id = $user->id;
      $student->first_name = $user->eid;
      $student->email = $user->eid . "@ksu.edu";
      $student->department_id = null;
      $student->advisor_id = null;
      return $student;
    }

    protected $fillable = ['first_name', 'last_name', 'email', 'advisor_id', 'department_id'];


    public function user(){
        return $this->belongsTo('App\Models\User')->withTrashed();
    }

    public function meetings(){
    	return $this->hasMany('App\Models\Meeting');
    }

    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor')->withTrashed();
    }

    public function department(){
    	return $this->belongsTo('App\Models\Department')->withTrashed();
    }

    public function plans(){
      return $this->hasMany('App\Models\Plan');
    }

    public function completedcourses(){
      return $this->hasMany('App\Models\Completedcourse');
    }

    public function transfercourses(){
      return $this->hasMany('App\Models\Transfercourse');
    }

    public function getNameAttribute(){
        return $this->first_name . ' ' . $this->last_name;
    }

    public function scopeFilterName($query, $name)
    {
            $filter = str_replace('"', "", $name);
            $queryStr = "concat(students.first_name, \" \", students.last_name) LIKE \"%" . $filter . "%\"";
            return $query->whereRaw($queryStr);
    }
}
