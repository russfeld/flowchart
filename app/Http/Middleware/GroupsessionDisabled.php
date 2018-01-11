<?php

namespace App\Http\Middleware;

use Closure;
use DbConfig;
use Auth;

class GroupsessionDisabled
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
      if(!DbConfig::has('groupsessionenabled')){
        DbConfig::store('groupsessionenabled', false);
      }else{
        if(DbConfig::get('groupsessionenabled') == true){
          return $next($request);
        }
      }
      return redirect()->action('GroupsessionController@getIndex');
    }
}
