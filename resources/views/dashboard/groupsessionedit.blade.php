@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_groupsessionedit"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $groupsession->id, 'disabled' => 'disabled'])
      @if(isset($groupsession->student->name))
        @include('forms.text', ['field' => 'student', 'label' => 'Student', 'value' => $groupsession->student->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'student', 'label' => 'Student', 'value' => "Unassigned", 'disabled' => 'disabled'])
      @endif
      @if(isset($groupsession->advisor->name))
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => $groupsession->advisor->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => "Unassigned", 'disabled' => 'disabled'])
      @endif
      @include('forms.text', ['field' => 'status', 'label' => 'Status', 'value' => $groupsession->statustext, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'updated_at', 'label' => 'Updated At', 'value' => $groupsession->updated_at, 'disabled' => 'disabled'])
      <input type="hidden" id="id" value="{{$groupsession->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-danger" id="delete">Delete</button>
      <a type="button" class="btn btn-warning" href="{{ url('/admin/groupsessions/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
