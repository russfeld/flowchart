<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Groupsession extends Model
{

  protected $dates = ['created_at', 'updated_at'];

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
    return $this->belongsTo('App\Models\Advisor', 'advisor_id', 'id')->withTrashed();
  }

  public function student(){
    return $this->belongsTo('App\Models\Student')->withTrashed();
  }

  public function getStatustextAttribute(){
    switch($this->status){
      case Groupsession::$STATUS_NEW:
        return "New";
      case Groupsession::$STATUS_QUEUED:
        return "Queued";
      case Groupsession::$STATUS_BECKON:
        return "Beckon";
      case Groupsession::$STATUS_DELAY:
        return "Delayed";
      case Groupsession::$STATUS_ABSENT:
        return "Absent";
      case Groupsession::$STATUS_DONE:
        return "Done";
      default:
        return "Unknown Status: " . $this->status;
    }
  }
}
