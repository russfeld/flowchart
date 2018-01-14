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
              <th>Name</th>
              <th>Number</th>
              <th>Semester</th>
              <th>Grade</th>
              <th>Credits</th>
              <th>Student</th>
              <th>Matched As</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          @foreach($completedcourses as $completedcourse)
          <tr>
            <td>{{ $completedcourse->id }}</td>
            <td>{{ $completedcourse->name }}</td>
            <td>{{ $completedcourse->coursenumber }}</td>
            <td>{{ $completedcourse->semestertext }}</td>
            <td>{{ $completedcourse->grade }}</td>
            <td>{{ $completedcourse->credits }}</td>
            <td>{{ $completedcourse->student->name or "Unassigned" }}</td>
            <td>{{ $completedcourse->course->fullTitle or "Unassigned" }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/completedcourses/' . $completedcourse->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Number</th>
              <th>Semester</th>
              <th>Grade</th>
              <th>Credits</th>
              <th>Student</th>
              <th>Matched As</th>
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
