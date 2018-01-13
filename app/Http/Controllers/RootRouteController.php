<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;

class RootRouteController extends Controller
{
  public function getIndex()
  {
      return view('root/index');
  }

  public function getAbout()
  {
      return view('root/about');
  }

  public function getHelp()
  {
      return view('help/index');
  }

  public function getImage($filename){
    $path = 'images/' . $filename;

    $file = Storage::get($path);
    $type = Storage::mimeType($path);

    $response = response($file, 200);
    $response->header("Content-Type", $type);

    return $response;
  }

  public function getTest()
  {
      return view('flowchart_test');
  }
}
