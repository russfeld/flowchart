@extends('layouts.master')

@section('title', 'Profiles')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/profiles"></script>
@endsection

@section('content')

<h3 class="top-header">Update your user profile:</h3>
<form>
	<div class="form-group">
		<label class="control-label" for="first_name">First Name</label>
		<input type="text" class="form-control" id="first_name" aria-describedby="first_namehelp" value="{{ $student->first_name }}">
		<span id="first_namehelp" class="help-block"></span>
	</div>
	<div class="form-group">
		<label class="control-label" for="last_name">Last Name</label>
		<input type="text" class="form-control" id="last_name" aria-describedby="last_namehelp" value="{{ $student->last_name }}">
		<span id="last_namehelp" class="help-block"></span>
	</div>
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
	<span id="profileSpin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
	<button type="button" class="btn btn-primary" id="saveProfile">Update Profile</button>
</form>

@endsection
