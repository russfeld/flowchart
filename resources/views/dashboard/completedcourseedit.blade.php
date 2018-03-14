@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $completedcourse->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $completedcourse->name])
      @include('forms.text', ['field' => 'coursenumber', 'label' => 'Course Number', 'value' => $completedcourse->coursenumber])
      @if($completedcourse->semester > 0)
        @include('forms.select', ['field' => 'semester', 'label' => 'Semester', 'value' => $completedcourse->semester, 'options' => $semesters])
      @else
        @include('forms.select', ['field' => 'semester', 'label' => 'Semester', 'value' => 0, 'options' => $semesters])
      @endif
      @include('forms.text', ['field' => 'year', 'label' => 'Year', 'value' => $completedcourse->year])
      @include('forms.text', ['field' => 'basis', 'label' => 'Basis', 'value' => $completedcourse->basis])
      @include('forms.text', ['field' => 'credits', 'label' => 'Credits', 'value' => $completedcourse->credits])
      @include('forms.text', ['field' => 'grade', 'label' => 'Grade', 'value' => $completedcourse->grade])
      @if(count($completedcourse->student))
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => $completedcourse->student_id, 'valuetext' => $completedcourse->student->name, 'placeholder' => 'Enter Student Name'])
      @else
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Student Name'])
      @endif
      @include('forms.radio', ['field' => 'transfer', 'label1' => 'K-State Course', 'label2' => 'Transfer Course'])
      @if($completedcourse->transfercourse()->exists())
        <div id="kstatecourse" hidden>
        </div>
        <div id="transfercourse">
        @include('forms.text', ['field' => 'incoming_institution', 'label' => 'Institution', 'value' => $completedcourse->transfercourse->incoming_institution])
        @include('forms.text', ['field' => 'incoming_name', 'label' => 'Name', 'value' => $completedcourse->transfercourse->incoming_name])
        @include('forms.text', ['field' => 'incoming_description', 'label' => 'Description', 'value' => $completedcourse->transfercourse->incoming_description])
        @include('forms.text', ['field' => 'incoming_semester', 'label' => 'Semester', 'value' => $completedcourse->transfercourse->incoming_semester])
        @include('forms.text', ['field' => 'incoming_credits', 'label' => 'Credits', 'value' => $completedcourse->transfercourse->incoming_credits])
        @include('forms.text', ['field' => 'incoming_grade', 'label' => 'Grade', 'value' => $completedcourse->transfercourse->incoming_grade])
      @else
        <div id="kstatecourse">
        </div>
        <div id="transfercourse" hidden>
        @include('forms.text', ['field' => 'incoming_institution', 'label' => 'Institution', 'value' => ''])
        @include('forms.text', ['field' => 'incoming_name', 'label' => 'Name', 'value' => ''])
        @include('forms.text', ['field' => 'incoming_description', 'label' => 'Description', 'value' => ''])
        @include('forms.text', ['field' => 'incoming_semester', 'label' => 'Semester', 'value' => ''])
        @include('forms.text', ['field' => 'incoming_credits', 'label' => 'Credits', 'value' => ''])
        @include('forms.text', ['field' => 'incoming_grade', 'label' => 'Grade', 'value' => ''])
      @endif
    </div>
      <input type="hidden" id="id" value="{{$completedcourse->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      <button type="button" class="btn btn-danger" id="delete">Delete</button>
      <a type="button" class="btn btn-warning" href="{{ url('/admin/completedcourses/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
