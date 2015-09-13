<?php

namespace App\Http\Controllers\Auth;

use App\User;
use Auth;
use Cas;
use Validator;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{

    protected $redirectPath = '/';

    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('cas', ['only' => ['CASLogin']]);
    }

    public function CASLogin()
    {
        return redirect('/');
    }

    public function Logout()
    {
        Auth::logout();
        return redirect('/auth/caslogout');
    }

    public function CASLogout()
    {
        CAS::logout();
        return redirect('/');
    }
    
}
