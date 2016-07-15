@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_settings"></script>
@endsection

@section('dashcontent')

<div class="row">
  <div class="col-xs-12">
    <div class="box">
      <div class="box-body">
        @foreach($settings as $setting)
          @if($setting->value === "true")
            <button class="btn btn-success settingsbutton" role="button" id="{{ $setting->key }}">{{ $setting->key }}- Enabled</button>
          @else
            <button class="btn btn-danger settingsbutton" role="button" id="{{ $setting->key }}">{{ $setting->key }} - Disabled</button>
          @endif
          <br><br>
        @endforeach
          <button class="btn btn-primary" role="button" id="newsetting">New Setting...</button>
          <br>
          <div class="alert alert-danger" role="alert">
            Any new settings must be coded into the application to be used.
            <br>
            See app/Console/Commands/PostDeploy.php to automatically create settings upon deployment. It is done automatically by the Envoy deployment routines
          </div>
      </div>
      <!-- /.box-body -->
    </div>
  <!-- /.box -->
  </div>
<!-- /.col -->
</div>
<!-- /.row -->

@endsection
