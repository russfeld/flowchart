@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_completedcourseedit"></script>
@endsection

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
      @include('forms.text', ['field' => 'grade', 'label' => 'Grade', 'value' => $completedcourse->grade])
      @include('forms.text', ['field' => 'credits', 'label' => 'Credits', 'value' => $completedcourse->credits])
      @if(count($completedcourse->student))
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => $completedcourse->student_id, 'valuetext' => $completedcourse->student->name, 'placeholder' => 'Enter Student Name'])
      @else
        @include('forms.autofill', ['field' => 'student_id', 'label' => 'Student', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Student Name'])
      @endif
      @if(count($completedcourse->course))
        @include('forms.autofill', ['field' => 'course_id', 'label' => 'Matched As', 'value' => $completedcourse->course_id, 'valuetext' => $completedcourse->course->fullTitle, 'placeholder' => 'Enter Course'])
      @else
        @include('forms.autofill', ['field' => 'course_id', 'label' => 'Matched As', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course'])
      @endif
      <input type="hidden" id="id" value="{{$completedcourse->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      <button type="button" class="btn btn-danger" id="delete">Delete</button>
      <a type="button" class="btn btn-warning" href="{{ url('/admin/completedcourses/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
