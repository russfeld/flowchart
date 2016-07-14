<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{

    public static $STATUS_NEW = 0;
    public static $STATUS_ATTENDED = 1;
    public static $STATUS_ABSENT = 2;

    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor')->withTrashed();
    }

    public function student(){
    	return $this->belongsTo('App\Models\Student')->withTrashed();
    }

    public function getStatustextAttribute(){
      switch($this->status){
        case Meeting::$STATUS_NEW:
          return "New";
        case Meeting::$STATUS_ATTENDED:
          return "Attended";
        case Meeting::$STATUS_ABSENT:
          return "Absent";
        default:
          return "Unknown Status: " . $this->status;
      }
    }

    //See app.scss for how these are displayed on the calendar
    public function getStatusclassAttribute(){
      switch($this->status){
        case Meeting::$STATUS_NEW:
          return "fc-new-meeting";
        case Meeting::$STATUS_ATTENDED:
          return "fc-attend-meeting";
        case Meeting::$STATUS_ABSENT:
          return "fc-absent-meeting";
        default:
          return "Unknown Status: " . $this->status;
      }
    }

    //hidden from JSON view
    protected $hidden = ['advisor_id', 'student_id', 'advisor', 'student', 'created_at', 'updated_at'];
    protected $dates = ['created_at', 'updated_at', 'start', 'end'];

}
