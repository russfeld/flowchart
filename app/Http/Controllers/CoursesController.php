<?php

namespace App\Http\Controllers;

class CoursesController extends Controller
{
    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        return view('courses/index');
    }

    public function getSearch()
    {
    	return view('courses/index');
    }

}