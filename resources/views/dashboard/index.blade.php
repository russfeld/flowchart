@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_index"></script>
@endsection

@section('dashcontent')

<div class="alert alert-success" role="alert">
  Use the menu to the left to manage settings and data.
  <br>
  Got suggestions for what you'd like to see here? Email russfeld@ksu.edu and let me know!
</div>

<div class="row">
  <div class="col-md-3 col-sm-6 col-xs-12">
    <a href="{{ url("admin/students")}}" class="nounderline">
    <div class="info-box">
      <!-- Apply any bg-* class to to the icon to color it -->
      <span class="info-box-icon bg-blue"><i class="fa fa-graduation-cap"></i></span>
      <div class="info-box-content">
        <span class="info-box-text">Students</span>
        <span class="info-box-number">{{ $data["students"] }}</span>
      </div><!-- /.info-box-content -->
    </div><!-- /.info-box -->
    </a>
  </div><!-- /.col -->

  <div class="col-md-3 col-sm-6 col-xs-12">
    <a href="{{ url("admin/advisors")}}" class="nounderline">
    <div class="info-box">
      <!-- Apply any bg-* class to to the icon to color it -->
      <span class="info-box-icon bg-green"><i class="fa fa-users"></i></span>
      <div class="info-box-content">
        <span class="info-box-text">Advisors</span>
        <span class="info-box-number">{{ $data["advisors"] }}</span>
      </div><!-- /.info-box-content -->
    </div><!-- /.info-box -->
    </a>
  </div><!-- /.col -->

  <div class="col-md-3 col-sm-6 col-xs-12">
    <div class="info-box">
      <!-- Apply any bg-* class to to the icon to color it -->
      <span class="info-box-icon bg-orange"><i class="fa fa-calendar-check-o"></i></span>
      <div class="info-box-content">
        <span class="info-box-text">Meetings</span>
        <span class="info-box-number">{{ $data["meetings"] }}</span>
      </div><!-- /.info-box-content -->
    </div><!-- /.info-box -->
  </div><!-- /.col -->

  <div class="col-md-3 col-sm-6 col-xs-12">
    <div class="info-box">
      <!-- Apply any bg-* class to to the icon to color it -->
      <span class="info-box-icon bg-purple"><i class="fa fa-thumbs-up"></i></span>
      <div class="info-box-content">
        <span class="info-box-text">Groupsessions</span>
        <span class="info-box-number">{{ $data["groupsessions"] }}</span>
      </div><!-- /.info-box-content -->
    </div><!-- /.info-box -->
  </div><!-- /.col -->
</div><!-- /.row -->

@endsection
