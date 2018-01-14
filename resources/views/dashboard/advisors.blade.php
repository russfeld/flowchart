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
            <th>Name</th>
            <th>Office</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Pic</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($advisors as $advisor)
          <tr>
            <td>{{ $advisor->user->eid }}</td>
            <td>{{ $advisor->name }}</td>
            <td>{{ $advisor->office }}</td>
            <td>{{ $advisor->email }}</td>
            <td>{{ $advisor->phone }}</td>
            <td>{{ $advisor->department->name or "Unassigned" }}</td>
            <td><a href="{{ url($advisor->pic) }}">{{ $advisor->pic }}</a></td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/advisors/' . $advisor->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
          <tr>
            <th>eID</th>
            <th>Name</th>
            <th>Office</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Pic</th>
            <th>Actions</th>
          </tr>
          </tfoot>
        </table>
        @if(isset($deleted))
          @if($deleted > 0)
            <a class="btn btn-warning btn-md" href="{{url('/admin/advisors?deleted=1')}}" role="button">Show {{$deleted}} Deleted Records</a></td>
          @endif
        @else
          <a class="btn btn-info btn-md" href="{{url('/admin/advisors')}}" role="button">Show Active Records</a></td>
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
