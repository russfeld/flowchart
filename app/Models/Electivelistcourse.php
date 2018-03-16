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
      'electivelist_id' => 'required|exists:electivelists,id',
      'course_prefix' => 'required|string',
      'course_min_number' => 'required|integer|min:0|max:999',
      'course_max_number' => 'sometimes|required|integer|min:0|max:999',
    );

    public function getFullRangeAttribute(){
      if(is_null($this->course_max_number)){
        return $this->course_prefix . ' ' . $this->min_str;
      }else{
        return $this->course_prefix . ' ' . $this->min_str . ' - ' . $this->max_str;
      }
    }

    public function getMinStrAttribute(){
    	return str_pad($this->course_min_number, 3, '0', STR_PAD_LEFT);
    }

    public function getMaxStrAttribute(){
    	return str_pad($this->course_max_number, 3, '0', STR_PAD_LEFT);
    }


    protected $fillable = ['electivelist_id', 'course_prefix', 'course_min_number', 'course_max_number'];
}
