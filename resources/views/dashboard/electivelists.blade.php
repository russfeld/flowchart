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
            <th>Abbr</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          @foreach($electivelists as $electivelist)
          <tr>
            <td>{{ $electivelist->id }}</td>
            <td>{{ $electivelist->name }}</td>
            <td>{{ $electivelist->abbreviation }}</td>
            <td><a class="btn btn-primary btn-sm" href="{{url('/admin/electivelists/' . $electivelist->id)}}" role="button">Details</a></td>
          </tr>
          @endforeach
          </tbody>
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Abbr</th>
              <th>Actions</th>
            </tr>
          </tfoot>
        </table>
        @if(isset($deleted))
          @if($deleted > 0)
            <a class="btn btn-warning btn-md" href="{{url('/admin/electivelists?deleted=1')}}" role="button">Show {{$deleted}} Deleted Records</a></td>
          @endif
        @else
          <a class="btn btn-info btn-md" href="{{url('/admin/electivelists')}}" role="button">Show Active Records</a></td>
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
