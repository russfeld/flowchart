<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Electivelistcourse extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    public function electivelist(){
        return $this->belongsTo('App\Models\Electivelist');
    }

    protected $rules = array(
      'electivelist_id' => 'required|exists:degreeprograms,id',
      'course_prefix' => 'required|string',
      'course_min_number' => 'required|integer|min:0|max:999',
      'course_max_number' => 'sometimes|required|integer|min:0|max:999',
    );

    public function getFullRangeAttribute(){
      if(is_null($this->course_max_number)){
        return $this->course_prefix . ' ' . $this->course_min_number;
      }else{
        return $this->course_prefix . ' ' . $this->course_min_number . ' - ' . $this->course_max_number;
      }
    }


    protected $fillable = ['electivelist_id', 'course_prefix', 'course_min_number', 'course_max_number'];
}
