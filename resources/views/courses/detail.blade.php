@extends('layouts.master')

@section('title', 'Courses - ' .$slug)

@section('content')

@foreach($courses as $course)
<h4>{{ $course->fullTitle }}</h4>
<br>
<b>Credits:</b> {{ $course->min_hours }} @if($course->variable_hours) - {{ $course->max_hours }} @endif
<br><br>
{{ $course->description }}
<br><br>
@if(strlen($course->requisites) > 0)
<b>Requisites:</b>
{{ $course->requisites }}
<br>
@endif
<b>When Offered:</b>
{{ $course->semesters }}
<br>
<b>UGE Course:</b>
@if($course->uge) Yes @else No @endif
<br>
<b>K-State 8:</b>
@if($course->areas->count() == 0) None
@else
<br>
@foreach($course->areas as $key => $area)
<img class="kstate8" src="{{ asset('img/' . $area->area_icon) }}"> {{ $area->area_name }}</img>
@if($key < $course->areas->count() - 1)<br>@endif
@endforeach
@endif
<br><br>

@if($course->prerequisites->count() > 0)
<b>Prerequisites Courses:</b><br>
<ul>
@foreach($course->prerequisites as $prereq)
<li><a href="{{ url('courses/' . $prereq->slug) }}">{{ $prereq->fullTitle }}</a></li>
@endforeach {{--prereqs--}}
</ul>
@endif

@if($course->followers->count() > 0)
<b>Prerequisite for:</b><br>
<ul>
@foreach($course->followers as $prereq)
<li><a href="{{ url('courses/' . $prereq->slug) }}">{{ $prereq->fullTitle }}</a></li>
@endforeach {{--followers--}}
</ul>
@endif

<hr>
@endforeach {{--courses--}}

@endsection
