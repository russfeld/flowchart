@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $electivelist->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $electivelist->name])
      @include('forms.text', ['field' => 'abbreviation', 'label' => 'Abbreviation', 'value' => $electivelist->abbreviation])
      <input type="hidden" id="id" value="{{$electivelist->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      @if(!$electivelist->trashed())
        <button type="button" class="btn btn-primary" id="save">Save</button>
      @endif
      @if (isset($electivelist->id))
        @if ($electivelist->trashed())
          <button type="button" class="btn btn-danger" id="forcedelete">Force Delete</button>
        @else
          <button type="button" class="btn btn-danger" id="delete">Delete</button>
        @endif
      @endif
      @if ($electivelist->trashed())
        <button type="button" class="btn btn-success" id="restore">Restore</button>
      @endif
      @if (isset($electivelist->id))
        <a type="button" class="btn btn-warning" href="{{ url('/admin/electivelists/' . $electivelist->id )}}">Back</a>
      @else
        <a type="button" class="btn btn-warning" href="{{ url('/admin/electivelists/')}}">Back</a>
      @endif
    </form>
  </div>
</div>

@endsection
