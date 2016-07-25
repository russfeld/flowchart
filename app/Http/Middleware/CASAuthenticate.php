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
            $user = new User();
            $data = array(
              'eid' => Cas::user(),
            );
            if($user->validate($data)){
              $user->fill($data);
              $user->is_advisor = false;
              $user->save();
              $student = Student::buildFromUser($user);
              $student->save();
            }else{
              return $user->errors()->all();
            }
          }
          Auth::login($user);
        }
        return $next($request);
    }
}
