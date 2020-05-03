@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $plan->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $plan->name])
      @include('forms.textarea', ['field' => 'description', 'label' => 'Description', 'value' => $plan->description])
      @if($plan->start_semester > 0)
        @include('forms.select', ['field' => 'start_semester', 'label' => 'Start Semester', 'value' => $plan->start_semester, 'options' => $semesters])
      @else
        @include('forms.select', ['field' => 'start_semester', 'label' => 'Start Semester', 'value' => 0, 'options' => $semesters])
      @endif
      @include('forms.text', ['field' => 'start_year', 'label' => 'Start Year', 'value' => $plan->start_year])
      @if(isset($plan->student))
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => $plan->student_id, 'valuetext' => $plan->student->name, 'placeholder' => 'Enter Student Name'])
      @else
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Student Name'])
      @endif
      @if(isset($plan->degreeprogram))
        @include('forms.select', ['field' => 'degreeprogram_id', 'label' => 'Degree Program', 'value' => $plan->degreeprogram->id, 'options' => $degreeprograms])
      @else
        @include('forms.select', ['field' => 'degreeprogram_id', 'label' => 'Degree Program', 'value' => 0, 'options' => $degreeprograms])
      @endif
      <input type="hidden" id="id" value="{{$plan->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      @if(!$plan->trashed())
        <button type="button" class="btn btn-primary" id="save">Save</button>
      @endif
      @if (isset($plan->id))
        @if ($plan->trashed())
          <button type="button" class="btn btn-danger" id="forcedelete">Force Delete</button>
        @else
          <button type="button" class="btn btn-danger" id="delete">Delete</button>
        @endif
      @endif
      @if ($plan->trashed())
        <button type="button" class="btn btn-success" id="restore">Restore</button>
      @endif
      @if (isset($plan->id))
        <a type="button" class="btn btn-warning" href="{{ url('/admin/plans/' . $plan->id )}}">Back</a>
        <button type="button" class="btn btn-info" id="repopulate">Reset Degree Requirements</a>
      @else
        <a type="button" class="btn btn-warning" href="{{ url('/admin/plans/')}}">Back</a>
      @endif
    </form>
  </div>
</div>

@endsection
