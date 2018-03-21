<?php

/**
 * Validate ExistsInDatabase or 0/null
 *
 *https://laracasts.com/discuss/channels/laravel/validator-ignoring-field-if-value-is-0-for-exists-rule?page=1
 */
Validator::extend(
    'exists_or_null',
    function ($attribute, $value, $parameters)
    {
        if($value == 0 || is_null($value)) {
            return true;
        } else {
            $validator = Validator::make([$attribute => $value], [
                $attribute => 'exists:' . implode(",", $parameters)
            ]);
            return !$validator->fails();
        }
    }
);
