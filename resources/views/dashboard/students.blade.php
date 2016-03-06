@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        <table id="table" class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>eID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Advisor</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($students as $student)
          <tr>
            <td>{{ $student->user->eid }}</td>
            <td>{{ $student->first_name }}</td>
            <td>{{ $student->last_name }}</td>
            <td>{{ $student->advisor->name or "Unassigned" }}</td>
            <td>{{ $student->department->name or "Unassigned" }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/students/' . $student->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
          <tr>
            <th>eID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Advisor</th>
            <th>Department</th>
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
