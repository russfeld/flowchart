<?php

namespace App\Models;

//https://daylerees.com/trick-validation-within-models/

use Illuminate\Database\Eloquent\Model;
use Validator;

class Validatable extends Model
{
    protected $rules = array();

    protected $errors;

    public function validate($data)
    {
        // make a new validator object
        $v = Validator::make($data, $this->rules);

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

    public function validateWithParams($data, $params)
    {
        // make a new validator object
        $v = Validator::make($data, $this->rules($params));

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

    public function errors()
    {
        return $this->errors;
    }
}
