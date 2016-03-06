@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'eid', 'label' => 'eID', 'value' => $student->user->eid, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'first_name', 'label' => 'First Name', 'value' => $student->first_name])
      @include('forms.text', ['field' => 'last_name', 'label' => 'Last Name', 'value' => $student->last_name])
      @include('forms.text', ['field' => 'email', 'label' => 'Email Address', 'value' => $student->email])
      @if(count($student->advisor))
        @include('forms.select', ['field' => 'advisor', 'label' => 'Advisor', 'value' => $student->advisor->id, 'options' => $advisors])
      @else
        @include('forms.select', ['field' => 'advisor', 'label' => 'Advisor', 'value' => 0, 'options' => $advisors])
      @endif
      @if(count($student->department))
        @include('forms.select', ['field' => 'department', 'label' => 'Department', 'value' => $student->department->id, 'options' => $departments])
      @else
        @include('forms.select', ['field' => 'department', 'label' => 'Department', 'value' => 0, 'options' => $departments])
      @endif
      <input type="hidden" id="id" value="{{$student->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
    </form>
  </div>
</div>

@endsection
