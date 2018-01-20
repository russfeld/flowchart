<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Electivelistcourse extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    public function electivelist(){
        return $this->belongsTo('App\Models\Electivelist');
    }

    public function course(){
        return $this->belongsTo('App\Models\Course');
    }

    protected $rules = array(
      'electivelist_id' => 'required|exists:degreeprograms,id',
      'course_id' => 'required|exists:courses,id',
    );

    protected $fillable = ['electivelist_id', 'course_id'];
}
