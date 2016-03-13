@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_departmentedit"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $department->id, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $department->name])
      @include('forms.text', ['field' => 'office', 'label' => 'Office', 'value' => $department->office])
      @include('forms.text', ['field' => 'email', 'label' => 'Email', 'value' => $department->email])
      @include('forms.text', ['field' => 'phone', 'label' => 'Phone', 'value' => $department->phone])
      <input type="hidden" id="id" value="{{$department->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      @if(isset($department->id))
        <button type="button" class="btn btn-danger" id="delete">Delete</button>
      @endif
      <a type="button" class="btn btn-warning" href="{{ url('/admin/departments/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
