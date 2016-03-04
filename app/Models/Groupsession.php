<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Groupsession extends Model
{

  public static $STATUS_NEW = 0;
  public static $STATUS_QUEUED = 1;
  public static $STATUS_BECKON = 2;
  public static $STATUS_DELAY = 3;
  public static $STATUS_ABSENT = 4;
  public static $STATUS_DONE = 5;

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
    return $this->belongsTo('App\Models\Advisor', 'advisor_id', 'id');
  }

  public function student(){
    return $this->belongsTo('App\Models\Student');
  }
}
