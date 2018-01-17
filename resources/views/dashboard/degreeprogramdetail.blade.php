@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        @include('dashboard._degreeprogram', ['degreeprogram' => $degreeprogram, 'buttons' => true])
        <table id="table" class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>ID</th>
            <th>Notes</th>
            <th>Semester</th>
            <th>Ordering</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($degreeprogram->requirements as $requirement)
          <tr>
            <td>{{ $requirement->id }}</td>
            <td>{{ $requirement->notes }}</td>
            <td>{{ $requirement->semester }}</td>
            <td>{{ $requirement->ordering }}</td>
            <td>{{ $requirement->credits }}</td>
            <td><a class="btn btn-primary btn-sm edit" href="#" data-id="{{ $requirement->id }}" role="button">Edit</a></td>
          </tr>
          @endforeach
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Notes</th>
              <th>Semester</th>
              <th>Ordering</th>
              <th>Credits</th>
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

@include('dashboard._degreerequirementform', ['degreeprogram' => $degreeprogram])

@endsection
