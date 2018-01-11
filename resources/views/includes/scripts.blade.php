@section('scripts')

<script src="{{ mix('/js/manifest.js') }}"></script>
<script src="{{ mix('/js/vendor.js') }}"></script>
<script src="{{ mix('/js/app.js') }}"></script>

<script type="text/javascript">
  App.init('{{ $controller }}', '{{ $action }}');
</script>

@show
