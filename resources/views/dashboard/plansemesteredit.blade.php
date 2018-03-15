@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $semester->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'plan_id', 'label' => 'Plan ID', 'value' => $plan_id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $semester->name])
      @include('forms.text', ['field' => 'number', 'label' => 'Semester Number', 'value' => $semester->number])
      @include('forms.text', ['field' => 'ordering', 'label' => 'Ordering', 'value' => $semester->ordering])
      <input type="hidden" id="id" value="{{$semester->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      @if (isset($semester->id))
        <button type="button" class="btn btn-danger" id="delete">Delete</button>
      @endif
      <a type="button" class="btn btn-warning" href="{{ url('/admin/plans/' . $plan_id )}}">Back</a>
    </form>
  </div>
</div>

@endsection
