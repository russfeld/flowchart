@extends('layouts.master')

@section('title', 'Profiles')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/profiles"></script>
@endsection

@section('content')

@if (!($student->user->update_profile))
<h3 class="top-header" style="color: red">Update your user profile to continue:</h3>
@else
<h3 class="top-header">Update your user profile:</h3>
@endif
<form>
	<div class="form-group">
		<label class="control-label" for="first_name">First Name</label>
    @if (!($student->user->update_profile))
		<input type="text" class="form-control" id="first_name" aria-describedby="first_namehelp" value="">
    @else
    <input type="text" class="form-control" id="first_name" aria-describedby="first_namehelp" value="{{ $student->first_name }}">
    @endif
    <span id="first_namehelp" class="help-block"></span>
	</div>
	<div class="form-group">
		<label class="control-label" for="last_name">Last Name</label>
		<input type="text" class="form-control" id="last_name" aria-describedby="last_namehelp" value="{{ $student->last_name }}">
		<span id="last_namehelp" class="help-block"></span>
	</div>
  <span id="profileSpin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
  <button type="button" class="btn btn-primary" id="saveProfile">Update Profile</button>
  @if (!($student->user->update_profile))
  <a id="profileAdvisingBtn" class="btn btn-success hide-spin" href="{{ url('/advising') }}" role="button">Advising Calendar</a>
  @endif
  <br><br>
  <div class="panel panel-primary">
    <div class="panel-heading">
      <h4 class="panel-title">Contact your advisor or department to update these items if they are incorrect</h4>
    </div>
    <div class="panel-body">
    	<div class="form-group">
    		<label class="control-label" for="email">Email Address</label>
    		<input type="text" class="form-control" id="email" aria-describedby="emailhelp" disabled value="{{ $student->email }}">
    		<span id="emailhelp" class="help-block"></span>
    	</div>
    	<div class="form-group">
    		<label class="control-label" for="advisor">Advisor</label>
    		<input type="text" class="form-control" id="advisor" aria-describedby="advisorhelp" disabled value="{{ $student->advisor->name or 'Unassigned' }}">
    		<span id="advisorhelp" class="help-block"></span>
    	</div>
    	<div class="form-group">
    		<label class="control-label" for="department">Department</label>
    		<input type="text" class="form-control" id="department" aria-describedby="departmenthelp" disabled value="{{ $student->department->name or 'Unassigned' }}">
    		<span id="departmenthelp" class="help-block"></span>
    	</div>
    </div>
  </div>
</form>

@endsection
