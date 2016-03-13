@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_advisoredit"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @if (isset($advisor->user->eid))
        @include('forms.text', ['field' => 'eid', 'label' => 'eID', 'value' => $advisor->user->eid, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'eid', 'label' => 'eID', 'value' => ''])
      @endif
      @include('forms.text', ['field' => 'name', 'label' => 'Name', 'value' => $advisor->name])
      @include('forms.text', ['field' => 'office', 'label' => 'Office', 'value' => $advisor->office])
      @include('forms.text', ['field' => 'email', 'label' => 'Email', 'value' => $advisor->email])
      @include('forms.text', ['field' => 'phone', 'label' => 'Phone', 'value' => $advisor->phone])
      @if(count($advisor->department))
        @include('forms.select', ['field' => 'department', 'label' => 'Department', 'value' => $advisor->department->id, 'options' => $departments])
      @else
        @include('forms.select', ['field' => 'department', 'label' => 'Department', 'value' => 0, 'options' => $departments])
      @endif
      @include('forms.textarea', ['field' => 'notes', 'label' => 'Notes', 'value' => $advisor->notes])
      @include('forms.image', ['field' => 'pic', 'label' => 'Image', 'value' => $advisor->pic])
      <input type="hidden" id="id" value="{{$advisor->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-primary" id="save">Save</button>
      @if (isset($advisor->user->eid))
        <button type="button" class="btn btn-danger" id="delete">Delete</button>
      @endif
      <a type="button" class="btn btn-warning" href="{{ url('/admin/advisors/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
