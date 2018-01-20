@extends('dashboard._layout')

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        @include('dashboard._electivelist', ['_electivelist' => $electivelist, 'buttons' => true])
          <form id="form">
            @include('forms.autofill', ['field' => 'course_id', 'label' => 'Course:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course'])
            <a id="save" class="btn btn-success" href="#" role="button">Add Course</a> <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
          </form>
        <table id="table" class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
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
