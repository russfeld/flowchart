@extends('layouts.master')

@section('title', 'Profiles')

@section('content')

@if (!($student->user->update_profile))
<h3 class="top-header" style="color: red">Update your user profile to continue:</h3>
@else
<h3 class="top-header">Update your user profile:</h3>
@endif
<form>
  @if (strlen($student->last_name) > 0)
    @include('forms.text', ['field' => 'first_name', 'label' => 'First Name', 'value' => $student->first_name])
  @else
    @include('forms.text', ['field' => 'first_name', 'label' => 'First Name', 'value' => ''])
  @endif
	@include('forms.text', ['field' => 'last_name', 'label' => 'Last Name', 'value' => $student->last_name])
  <span id="profilespin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
  <button type="button" class="btn btn-primary" id="saveProfile">Update Profile</button>
  @if (!($student->user->update_profile))
  <a id="profileAdvisingBtn" class="btn btn-success hide-spin" href="{{ url(isset($lastUrl) ? $lastUrl : 'advising') }}" role="button">Continue</a>
  @endif
  <br><br>
  <div class="panel panel-primary">
    <div class="panel-heading">
      <h4 class="panel-title">Contact your advisor or department to update these items if they are incorrect</h4>
    </div>
    <div class="panel-body">
    	@include('forms.text', ['field' => 'email', 'label' => 'Email Address', 'value' => $student->email, 'disabled' => 'disabled'])
      @if(isset($student->advisor->name))
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => $student->advisor->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => 'Unassigned', 'disabled' => 'disabled'])
      @endif
      @if(isset($student->department->name))
        @include('forms.text', ['field' => 'department', 'label' => 'Department', 'value' => $student->department->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'department', 'label' => 'Department', 'value' => 'Unassigned', 'disabled' => 'disabled'])
      @endif

    </div>
  </div>
</form>

@endsection
