<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Editable extends Model
{
  
  public function user(){
      return $this->belongsTo('App\Models\User')->withTrashed();
  }

  protected $dates = ['created_at', 'updated_at'];
}
