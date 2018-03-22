<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Events\BlackoutSaved;

class Blackout extends Model
{
    public function advisor(){
    	return $this->belongsTo('App\Models\Advisor')->withTrashed();
    }

    public function events(){
    	return $this->hasMany('App\Models\Blackoutevent');
    }

    public function getRepeattextAttribute(){
      if($this->repeat_type == 0){
        return "None";
      }elseif($this->repeat_type == 1){
        return "Every " . $this->repeat_every . " days until " . $this->repeat_until->toDateString();
      }elseif($this->repeat_type == 2){
        $days = "";
        if(strpos($this->repeat_detail, "1") !== false) $days = $days . "M";
        if(strpos($this->repeat_detail, "2") !== false) $days = $days . "T";
        if(strpos($this->repeat_detail, "3") !== false) $days = $days . "W";
        if(strpos($this->repeat_detail, "4") !== false) $days = $days . "U";
        if(strpos($this->repeat_detail, "5") !== false) $days = $days . "F";
        return "Every " . $this->repeat_every . " weeks on " . $days . " until " . $this->repeat_until->toDateString();
      }
    }

    protected $dates = ['created_at', 'updated_at', 'start', 'end', 'repeat_until'];

    protected $events = [
      'saved' => BlackoutSaved::class,
    ];
}
