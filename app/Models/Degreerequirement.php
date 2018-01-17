<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Degreerequirement extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    public function program(){
        return $this->belongsTo('App\Models\Degreeprogram')->withTrashed();
    }

    public function requireable(){
      return $this->morphTo();
    }

    protected $rules = array(
      'degreeprogram_id' => 'required|exists:degreeprograms,id',
      'notes' => 'string',
    );

    protected $fillable = ['notes', 'degreeprogram_id'];

}
