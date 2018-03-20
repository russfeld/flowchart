@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        @include('dashboard._plan', ['plan' => $plan, 'buttons' => true])
        <h3>Plan Requirements:</h3>
        <table id="table" class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Credits</th>
            <th>Semester</th>
            <th>Ordering</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
            <!-- AJAX FILL -->
          </tbody>
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Semester</th>
              <th>Ordering</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </tfoot>
        </table>

        <h3>Plan Semesters:</h3>
        <table id="tablesem" class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Ordering</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
            <!-- AJAX FILL -->
          </tbody>
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Ordering</th>
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

@include('dashboard._planrequirementform', ['plan' => $plan])

@endsection
