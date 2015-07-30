<?php

namespace App\Http\Controllers;

class FlowchartsController extends Controller
{
    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        return view('flowcharts/index');
    }

}