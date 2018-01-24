<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Degreerequirement extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    public function program(){
        return $this->belongsTo('App\Models\Degreeprogram')->withTrashed();
    }

    public function electivelist(){
        return $this->belongsTo('App\Models\Electivelist')->withTrashed();
    }

    protected $rules = array(
      'degreeprogram_id' => 'required|exists:degreeprograms,id',
      'semester' => 'required|integer',
      'ordering' => 'required|integer',
      'credits' => 'required|integer',
      'notes' => 'string',
      'course_name' => 'required_without:electivelist_id|string',
      'electivelist_id' => 'required_without:course_name|exists:electivelists,id',
    );

    protected $fillable = ['notes', 'degreeprogram_id', 'semester', 'ordering', 'credits', 'course_name', 'electivelist_id'];

}
