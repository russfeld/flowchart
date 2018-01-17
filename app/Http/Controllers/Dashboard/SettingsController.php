<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use DbConfig;

class SettingsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getSettings(){
    $settings = DbConfig::listDb()->orderBy('key', 'asc')->get();
    return view('dashboard.settings')->with('page_title', "Edit Settings")->with('settings', $settings);
  }

  public function postNewsetting(Request $request){
    $this->validate($request, [
      'key' => 'required|string',
    ]);
    if(!DbConfig::has($request->input('key'))){
      DbConfig::store($request->input('key'), false);
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_saved'), 200);
    }else{
      return response()->json(trans('errors.item_exists'), 400);
    }
  }

  public function postSavesetting(Request $request){
    $this->validate($request, [
      'key' => 'required|string',
    ]);
    if(DbConfig::has($request->input('key'))){
      if(DbConfig::get($request->input('key')) == true){
        DbConfig::store($request->input('key'), false);
      }else{
        DbConfig::store($request->input('key'), true);
      }
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_saved'), 200);
    }else{
      return response()->json(trans('errors.not_found'), 400);
    }
  }

}
