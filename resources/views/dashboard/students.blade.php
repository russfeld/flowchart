@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_studentedit"></script>
@endsection

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
            <th>Actions</th>
          </tr>
          </tfoot>
        </table>
        @if(isset($deleted))
          @if($deleted > 0)
            <a class="btn btn-warning btn-md" href="{{url('/admin/students?deleted=1')}}" role="button">Show {{$deleted}} Deleted Records</a></td>
          @endif
        @else
          <a class="btn btn-info btn-md" href="{{url('/admin/students')}}" role="button">Show Active Records</a></td>
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
