<?php

namespace App\Http\Controllers;

class ProfilesController extends Controller
{
    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        return view('profiles/index');
    }

}