@extends('layouts.master')

@section('title', 'Courses - ' . $category->category_name)

@section('content')

<h4>{{ $category->category_name }}</h4>

<ul>
@foreach($courses as $course)
	<li><a href="{{ url('courses/' . $course->slug) }}">{{ $course->fullTitle }}</a></li>
@endforeach
</ul>

@endsection