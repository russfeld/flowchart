<?php

namespace App\Http\Middleware;

use Closure;
use Cas;
use Auth;
use App\Models\User;
use App\Models\Student;

class CASAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if(!Auth::check()){
            Cas::authenticate();
            $user = User::where('eid', Cas::user())->first();
            if($user === null){
                $user = new User;
                $user->eid = Cas::user();
                $user->is_advisor = false;
                $user->save();

                $student = new Student;
                $student->user_id = $user->id;
                $student->first_name = $user->eid;
                $student->email = $user->eid . "@ksu.edu";
                $student->department_id = null;
                $student->advisor_id = null;
                $student->save();
            }
            Auth::login($user);
        }

        return $next($request);
    }
}
