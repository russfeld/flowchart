@extends('dashboard._layout')

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
          </tbody>
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
        @if(isset($deleted))
          @if($deleted > 0)
            <a class="btn btn-warning btn-md" href="{{url('/admin/meetings?deleted=1')}}" role="button">Show {{$deleted}} Deleted Records</a></td>
          @endif
        @else
          <a class="btn btn-info btn-md" href="{{url('/admin/meetings')}}" role="button">Show Active Records</a></td>
        @endif
      </div>
      <!-- /.box-body -->
    </div>
  <!-- /.box -->
  </div>
<!-- /.col -->
</div>
<!-- /.row -->

@endsection
