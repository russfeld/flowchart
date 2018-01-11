<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Editable;

use Auth;

class EditableController extends Controller
{
  public function postSave($id = -1, Request $request){
    $user = Auth::user();
    if($user->is_advisor){
      if($id < 0){
        abort(404);
      }else{
        $data = $request->all();
        $editable = Editable::findOrFail($id);
        if($editable->validate($data)){
          $editable->fill($data);
          $editable->user_id = $user->id;
          $editable->save();
          $request->session()->put('message', trans('messages.item_saved'));
          $request->session()->put('type', 'success');
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($editable->errors(), 422);
        }
      }
    }else{
      return response()->json(trans('errors.advisors_only'), 403);
    }
  }
}
