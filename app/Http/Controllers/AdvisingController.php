<?php

namespace App\Http\Controllers;

class AdvisingController extends Controller
{
    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        return view('advising/index');
    }

}