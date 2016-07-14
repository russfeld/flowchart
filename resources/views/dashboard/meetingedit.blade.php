@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_meetingedit"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $meeting->id, 'disabled' => 'disabled'])
      @if(isset($meeting->student->name))
        @include('forms.text', ['field' => 'student', 'label' => 'Student', 'value' => $meeting->student->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'student', 'label' => 'Student', 'value' => "Unassigned", 'disabled' => 'disabled'])
      @endif
      @if(isset($meeting->advisor->name))
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => $meeting->advisor->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => "Unassigned", 'disabled' => 'disabled'])
      @endif
      @include('forms.text', ['field' => 'title', 'label' => 'Title', 'value' => $meeting->title, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'start', 'label' => 'Start', 'value' => $meeting->start, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'end', 'label' => 'End', 'value' => $meeting->end, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'description', 'label' => 'Description', 'value' => $meeting->description, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'status', 'label' => 'Status', 'value' => $meeting->statustext, 'disabled' => 'disabled'])
      <input type="hidden" id="id" value="{{$meeting->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-danger" id="delete">Delete</button>
      <a type="button" class="btn btn-warning" href="{{ url('/admin/meetings/')}}">Back</a>
    </form>
  </div>
</div>

@endsection
