@extends('layouts.master')

@section('title', 'Courses')

@section('content')

@foreach($colleges as $college)
	<h4>{{ $college->college_name }}</h4>

	<ul>
	@foreach($college->categories as $category)
		<li><a href="{{ url('courses/category/' . $category->url) }}">{{ $category->category_name }}</a></li>
	@endforeach
	</ul>

@endforeach

@endsection
