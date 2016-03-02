<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Groupsession extends Model
{

  //http://code.htmlasks.com/laravel_5_null_foreign_key_error
  /*
  public function setAdvisorIdAttribute($value){
    $this->attributes['advisor_id'] = $value == "null" ? null : $value;
  }

  public function setStudentIdAttribute($value){
    $this->attributes['student_id'] = $value == "null" ? null : $value;
  }
*/
  public function advisor(){
    return $this->belongsTo('App\Models\Advisor');
  }

  public function student(){
    return $this->belongsTo('App\Models\Student');
  }
}
