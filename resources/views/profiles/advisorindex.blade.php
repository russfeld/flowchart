@extends('layouts.master')

@section('title', 'Profiles')

@section('content')

@if (!($advisor->user->update_profile))
<h3 class="top-header" style="color: red">Update your user profile to continue:</h3>
@else
<h3 class="top-header">Update your user profile:</h3>
@endif
<form>
  @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $advisor->name])
	@include('forms.text', ['field' => 'email', 'label' => 'Email Address', 'value' => $advisor->email])
  @include('forms.text', ['field' => 'office', 'label' => 'Office Location', 'value' => $advisor->office])
  @include('forms.text', ['field' => 'phone', 'label' => 'Phone Number', 'value' => $advisor->phone])
  @include('forms.textarea', ['field' => 'notes', 'label' => 'Notes', 'value' => $advisor->notes])
  @include('forms.image', ['field' => 'pic', 'label' => 'Image', 'value' => $advisor->pic])
  <span id="profilespin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
  <button type="button" class="btn btn-primary" id="saveAdvisorProfile"><i class="fa fa-floppy-o" aria-hidden="true"></i> Update Profile</button>
  @if (!($advisor->user->update_profile))
  <a id="profileAdvisingBtn" class="btn btn-success hide-spin" href="{{ url(isset($lastUrl) ? $lastUrl : 'advising') }}" role="button"><i class="fa fa-arrow-right" aria-hidden="true"></i> Continue</a>
  @endif
  <br><br>
  <div class="panel panel-primary">
    <div class="panel-heading">
      <h4 class="panel-title">Contact the webmaster to update these items if they are incorrect</h4>
    </div>
    <div class="panel-body">
      @if(isset($advisor->department->name))
        @include('forms.text', ['field' => 'department', 'label' => 'Department', 'value' => $advisor->department->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'department', 'label' => 'Department', 'value' => 'Unassigned', 'disabled' => 'disabled'])
      @endif
    </div>
  </div>
</form>

@endsection
