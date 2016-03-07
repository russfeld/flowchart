@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_index"></script>
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
            <th>Name</th>
            <th>Office</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($departments as $department)
          <tr>
            <td>{{ $department->id }}</td>
            <td>{{ $department->name }}</td>
            <td>{{ $department->office }}</td>
            <td>{{ $department->email }}</td>
            <td>{{ $department->phone }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/departments/' . $department->id)}}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Office</th>
            <th>Email</th>
            <th>Phone</th>
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
