@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_meetingedit"></script>
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
              <th>Student</th>
              <th>Advisor</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          @foreach($meetings as $meeting)
          <tr>
            <td>{{ $meeting->id }}</td>
            <td>{{ $meeting->student->name or "Unassigned" }}</td>
            <td>{{ $meeting->advisor->name or "Unassigned" }}</td>
            <td>{{ $meeting->title }}</td>
            <td>{{ $meeting->start }}</td>
            <td>{{ $meeting->end }}</td>
            <td>{{ $meeting->statustext }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/meetings/' . $meeting->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Advisor</th>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
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
