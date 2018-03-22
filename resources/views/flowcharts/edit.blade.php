@extends('layouts.master')

@section('title', 'Flowcharts - Edit Flowchart')

@section('content')

<h3 class="top-header">Edit Flowchart</h3>

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'student_name', 'label' => 'Student Name', 'value' => $plan->student->name, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $plan->name])
      @include('forms.textarea', ['field' => 'description', 'label' => 'Description', 'value' => $plan->description])
      @if($plan->start_semester > 0)
        @include('forms.select', ['field' => 'start_semester', 'label' => 'Start Semester', 'value' => $plan->start_semester, 'options' => $semesters])
      @else
        @include('forms.select', ['field' => 'start_semester', 'label' => 'Start Semester', 'value' => 0, 'options' => $semesters])
      @endif
      @include('forms.text', ['field' => 'start_year', 'label' => 'Start Year', 'value' => $plan->start_year])
      @if(count($plan->degreeprogram))
        @include('forms.select', ['field' => 'degreeprogram_id', 'label' => 'Degree Program', 'value' => $plan->degreeprogram->id, 'options' => $degreeprograms])
      @else
        @include('forms.select', ['field' => 'degreeprogram_id', 'label' => 'Degree Program', 'value' => 0, 'options' => $degreeprograms])
      @endif
      <input type="hidden" id="id" value="{{$plan->id}}">
      <input type="hidden" id="student_id" value="{{$plan->student_id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      @if (isset($plan->id))
        <button type="button" class="btn btn-danger" id="delete">Delete</button>
      @endif
      @if (isset($plan->id))
        <a type="button" class="btn btn-warning" href="{{ url('/flowcharts/view/' . $plan->id )}}">Back</a>
        <button type="button" class="btn btn-info" id="repopulate">Reset Degree Requirements</a>
      @else
        <a type="button" class="btn btn-warning" href="{{ url('/flowcharts/' . $plan->student_id )}}">Back</a>
      @endif
    </form>
  </div>
</div>

@endsection
