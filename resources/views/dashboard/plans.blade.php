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
            <th>Name</th>
            <th>Start</th>
            <th>Degree Program</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($plans as $plan)
          <tr>
            <td>{{ $plan->id }}</td>
            <td>{{ $plan->student->name or "Unassigned" }}</td>
            <td>{{ $plan->name }}</td>
            <td>{{ $plan->starttext }}</td>
            <td>{{ $plan->degreeprogram->name or "Unassigned" }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/plans/' . $plan->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          </tbody>
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Name</th>
              <th>Start</th>
              <th>Degree Program</th>
              <th>Actions</th>
            </tr>
          </tfoot>
        </table>
        @if(isset($deleted))
          @if($deleted > 0)
            <a class="btn btn-warning btn-md" href="{{url('/admin/plans?deleted=1')}}" role="button">Show {{$deleted}} Deleted Records</a></td>
          @endif
        @else
          <a class="btn btn-info btn-md" href="{{url('/admin/plans')}}" role="button">Show Active Records</a></td>
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
