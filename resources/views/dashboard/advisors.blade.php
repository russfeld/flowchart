@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_advisoredit"></script>
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
      </div>
      <!-- /.box-body -->
    </div>
  <!-- /.box -->
  </div>
<!-- /.col -->
</div>
<!-- /.row -->

@endsection
