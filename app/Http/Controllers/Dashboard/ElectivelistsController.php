<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Electivelist;

class ElectivelistsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getElectivelists(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $electivelists = Electivelist::with('courses')->onlyTrashed()->get();
          return view('dashboard.electivelists')->with('electivelists', $electivelists)->with('page_title', "Deleted Elective Lists");
        }else{
          $electivelists = Electivelist::with('courses')->get();
          $deleted = Electivelist::onlyTrashed()->count();
          return view('dashboard.electivelists')->with('electivelists', $electivelists)->with('page_title', "Elective Lists")->with('deleted', $deleted);
        }
      }else{
        $electivelist = Electivelist::withTrashed()->findOrFail($id);
        return view('dashboard.electivelistedit')->with('electivelist', $electivelist)->with('page_title', "Edit Elective List");
      }
  }

  public function getElectivelistDetail(Request $request, $id = -1){
    if($id < 0){
      return redirect ('admin/electivelists');
    }else{
      $electivelist = Electivelist::withTrashed()->findOrFail($id);
      return view('dashboard.electivelistdetail')->with('electivelist', $electivelist)->with('page_title', "Elective List Details");
    }
  }

  public function getNewelectivelist(){
      $electivelist = new Electivelist();
      return view('dashboard.electivelistedit')->with('electivelist', $electivelist)->with('page_title', "New Elective List");
  }

  public function postElectivelists($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $electivelist = Electivelist::findOrFail($id);
      if($electivelist->validate($data)){
        $electivelist->fill($data);
        $electivelist->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($electivelist->errors(), 422);
      }
    }
  }

  public function postNewelectivelist(Request $request){
    $data = $request->all();
    $electivelist = new Electivelist();
    if($electivelist->validate($data)){
      $electivelist->fill($data);
      $electivelist->save();
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(url('admin/electivelists/' . $electivelist->id));
    }else{
      return response()->json($electivelist->errors(), 422);
    }
  }

  public function postDeleteelectivelist(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:electivelists',
    ]);
    $electivelist = Electivelist::findOrFail($request->input('id'));
    $electivelist->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

  public function postRestoreelectivelist(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:electivelists',
    ]);
    $electivelist = Electivelist::withTrashed()->findOrFail($request->input('id'));
    $electivelist->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_restored'));
  }

  public function postForcedeleteelectivelist(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:electivelists',
    ]);
    $electivelist = Electivelist::withTrashed()->findOrFail($request->input('id'));
    if($electivelist->trashed()){
      foreach($electivelist->courses()->get() as $course){
        $course->delete();
      }
      $electivelist->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

}
