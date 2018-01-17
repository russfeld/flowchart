<?php

namespace App\Http\Controllers;

use App\Models\Electivelist;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

class ElectivelistsController extends Controller
{
  public function getElectivelistfeed(Request $request){
    $this->validate($request, [
          'query' => 'required|string',
      ]);

      $electivelists = Electivelist::filterName($request->input('query'))->get();

      $resource = new Collection($electivelists, function($electivelist) {
            return[
                'value' => $electivelist->name,
                'data' => $electivelist->id,
            ];
      });

    return $this->fractal->createData($resource)->toJson();

  }
}
