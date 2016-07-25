<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\SoftDeletes;
use Validator;

class User extends Validatable implements AuthenticatableContract, AuthorizableContract, CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword, SoftDeletes;

    protected $rules = array(
          'eid' => 'required|string|regex:/^[A-Za-z][A-Za-z0-9]{2,19}$/|unique:users,eid',
    );

    public function validateChange($data)
    {
        $changeRules = array(
              'eid' => 'required|string|regex:/^[A-Za-z][A-Za-z0-9]{2,19}$/|unique:users,eid,'.$this->id,
        );
        // make a new validator object
        $v = Validator::make($data, $changeRules);

        // check for failure
        if ($v->fails())
        {
            // set errors and return false
            $this->errors = $v->errors();
            return false;
        }

        // validation pass
        return true;
    }

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [ 'eid'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */

     protected $dates = ['deleted_at', 'created_at', 'updated_at'];

    // http://stackoverflow.com/questions/23910553/laravel-check-if-related-model-exists
    public function student(){
        return $this->hasOne('App\Models\Student')->withTrashed();
    }

    public function advisor(){
        return $this->hasOne('App\Models\Advisor')->withTrashed();
    }

}
