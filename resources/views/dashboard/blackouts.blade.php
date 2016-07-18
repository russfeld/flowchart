@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_blackoutedit"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        <table id="table" class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Advisor</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Repeat</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          @foreach($blackouts as $blackout)
          <tr>
            <td>{{ $blackout->id }}</td>
            <td>{{ $blackout->advisor->name or "Unassigned" }}</td>
            <td>{{ $blackout->title }}</td>
            <td>{{ $blackout->start }}</td>
            <td>{{ $blackout->end }}</td>
            <td>{{ $blackout->repeattext }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/blackouts/' . $blackout->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Advisor</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Repeat</th>
              <th>Actions</th>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- /.box-body -->
    </div>
  <!-- /.box -->
  </div>
<!-- /.col -->
</div>
<!-- /.row -->

@endsection
