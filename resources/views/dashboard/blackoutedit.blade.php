@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <form>
      @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => $blackout->id, 'disabled' => 'disabled'])
      @if(isset($blackout->advisor->name))
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => $blackout->advisor->name, 'disabled' => 'disabled'])
      @else
        @include('forms.text', ['field' => 'advisor', 'label' => 'Advisor', 'value' => "Unassigned", 'disabled' => 'disabled'])
      @endif
      @include('forms.text', ['field' => 'title', 'label' => 'Title', 'value' => $blackout->title, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'start', 'label' => 'Start', 'value' => $blackout->start, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'end', 'label' => 'End', 'value' => $blackout->end, 'disabled' => 'disabled'])
      @include('forms.text', ['field' => 'repeat', 'label' => 'Repeat', 'value' => $blackout->repeattext, 'disabled' => 'disabled'])
      <input type="hidden" id="id" value="{{$blackout->id}}">
      <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      <button type="button" class="btn btn-danger" id="delete">Delete</button>
      <a type="button" class="btn btn-warning" href="{{ url('/admin/blackouts/')}}">Back</a>
    </form>
    <br>
    @if($blackout->repeat_type > 0)
    <h3>Blackout Events</h3>
    <div class="box">
      <div class="box-body">
        <table id="table" class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
          @foreach($blackout->events as $blackoutevent)
          <tr>
            <td>{{ $blackoutevent->id }}</td>
            <td>{{ $blackoutevent->title }}</td>
            <td>{{ $blackoutevent->start }}</td>
            <td>{{ $blackoutevent->end }}</td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- /.box-body -->
    </div>
  <!-- /.box -->
  @endif
  </div>
</div>

@endsection
