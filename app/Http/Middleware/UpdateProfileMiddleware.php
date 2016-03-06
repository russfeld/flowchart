<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use App\Models\User;

class UpdateProfileMiddleware
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
        if(Auth::check()){
          $user = Auth::user();
          if(!($user->update_profile)){
            $request->session()->put('lastUrl', $request->path());
            return redirect('/profile');
          }
        }
        return $next($request);
    }
}
