@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $degreeprogram->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $degreeprogram->name])
      @include('forms.text', ['field' => 'abbreviation', 'label' => 'Abbreviation', 'value' => $degreeprogram->abbreviation])
      @include('forms.textarea', ['field' => 'description', 'label' => 'Description', 'value' => $degreeprogram->description])
      @if($degreeprogram->effective_semester > 0)
        @include('forms.select', ['field' => 'effective_semester', 'label' => 'Effective Semester', 'value' => $degreeprogram->effective_semester, 'options' => $semesters])
      @else
        @include('forms.select', ['field' => 'effective_semester', 'label' => 'Effective Semester', 'value' => 0, 'options' => $semesters])
      @endif
      @include('forms.text', ['field' => 'effective_year', 'label' => 'Effective Year', 'value' => $degreeprogram->effective_year])
      @if(isset($degreeprogram->department))
        @include('forms.select', ['field' => 'department_id', 'label' => 'Department', 'value' => $degreeprogram->department->id, 'options' => $departments])
      @else
        @include('forms.select', ['field' => 'department_id', 'label' => 'Department', 'value' => 0, 'options' => $departments])
      @endif
      <input type="hidden" id="id" value="{{$degreeprogram->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      @if(!$degreeprogram->trashed())
        <button type="button" class="btn btn-primary" id="save">Save</button>
      @endif
      @if (isset($degreeprogram->id))
        @if ($degreeprogram->trashed())
          <button type="button" class="btn btn-danger" id="forcedelete">Force Delete</button>
        @else
          <button type="button" class="btn btn-danger" id="delete">Delete</button>
        @endif
      @endif
      @if ($degreeprogram->trashed())
        <button type="button" class="btn btn-success" id="restore">Restore</button>
      @endif
      @if (isset($degreeprogram->id))
        <a type="button" class="btn btn-warning" href="{{ url('/admin/degreeprograms/' . $degreeprogram->id )}}">Back</a>
      @else
        <a type="button" class="btn btn-warning" href="{{ url('/admin/degreeprograms/')}}">Back</a>
      @endif
    </form>
  </div>
</div>

@endsection
