<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class Advisor extends Validatable
{

    use SoftDeletes;

    protected $dates = ['deleted_at', 'created_at', 'updated_at'];

    protected $rules = array(
      'name' => 'required|string',
      'email' => 'required|string|email',
      'office' => 'required|string',
      'phone' => 'required|string',
      'notes' => 'string',
      'pic' => 'image',
      'department_id' => 'sometimes|required|exists:departments,id',
    );

    protected $fillable = ['name', 'email', 'office', 'phone', 'notes', 'department_id'];

    public function savePic(UploadedFile $file){
      $path = storage_path() . "/app/images";
      $extension = $file->getClientOriginalExtension();
      $filename = $this->user->eid . '.' . $extension;
      $file->move($path, $filename);
      $this->pic = 'images/' . $filename;
    }

    public function user(){
        return $this->belongsTo('App\Models\User')->withTrashed();
    }

    public function department(){
        return $this->belongsTo('App\Models\Department')->withTrashed();
    }

    public function meetings(){
    	return $this->hasMany('App\Models\Meeting');
    }

    public function students(){
    	return $this->hasMany('App\Models\Student');
    }

    public function blackouts(){
    	return $this->hasMany('App\Models\Blackout');
    }

    public function events(){
    	return $this->hasMany('App\Models\Blackoutevent');
    }
}
