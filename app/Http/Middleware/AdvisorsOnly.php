<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use App\Models\User;

class AdvisorsOnly
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
        $user = Auth::user();
        if(!($user->is_advisor)){
          if($request->ajax()){
            return response()->json(trans('errors.not_found'), 404);
          }else{
            abort(404);
          }
        }
        return $next($request);
    }
}
