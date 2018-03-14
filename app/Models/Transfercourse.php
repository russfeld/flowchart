<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfercourse extends Validatable
{
    protected $dates = ['created_at', 'updated_at'];

    protected $rules = array(
      'incoming_institution' => 'required|string',
      'incoming_name' => 'required|string',
      'incoming_description' => 'required|string',
      'incoming_semester' => 'required|string',
      'incoming_credits' => 'required|integer|digits_between:1,2',
      'incoming_grade' => 'string|max:2',
    );

    protected $fillable = ['incoming_institution', 'incoming_name', 'incoming_description', 'incoming_semester', 'incoming_credits', 'incoming_grade'];

    public function completedcourse(){
      return $this->hasOne('App\Models\Completedcourse');
    }

}
