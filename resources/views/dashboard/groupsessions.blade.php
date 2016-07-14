@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_groupsessionedit"></script>
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
              <th>Status</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          @foreach($groupsessions as $groupsession)
          <tr>
            <td>{{ $groupsession->id }}</td>
            <td>{{ $groupsession->student->name or "Unassigned" }}</td>
            <td>{{ $groupsession->advisor->name or "Unassigned" }}</td>
            <td>{{ $groupsession->statustext }}</td>
            <td>{{ $groupsession->updated_at }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/groupsessions/' . $groupsession->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Advisor</th>
              <th>Status</th>
              <th>Updated At</th>
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
