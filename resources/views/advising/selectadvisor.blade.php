@extends('layouts.master')

@section('title', 'Advising - Select Advisor')

@section('content')

<h3 class="top-header">Select an advisor <small>(click department names to expand)</small></h3>
<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
@foreach($departments as $department)

<div class="panel panel-default">
	<div class="panel-heading" role="tab" id="heading{{ $department->id }}">
@if($department->id == $dept)
		<h2 class="panel-title">
			<a href="#dept{{ $department->id }}" role="button" data-target="#dept{{ $department->id }}" data-toggle="collapse" data-parent="#accordion" aria-expanded="true" aria-controls="dept{{ $department->id }}">{{ $department->name }}</a>
		</h2>
	</div>
	<div id="dept{{ $department->id }}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading{{ $department->id }}">
@else
		<h2 class="panel-title">
			<a href="#dept{{ $department->id }}" class="collapsed" role="button" data-target="#dept{{ $department->id }}" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="dept{{ $department->id }}">{{ $department->name }}</a>
		</h2>
	</div>
	<div id="dept{{ $department->id }}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading{{ $department->id }}">
@endif
		<div class="panel-body">
@foreach($department->advisors as $advisor)
@include('advising._advisor', ['advisor' => $advisor, 'link' => true])
@endforeach
		</div>
	</div>
</div>
@endforeach
</div>
@endsection
