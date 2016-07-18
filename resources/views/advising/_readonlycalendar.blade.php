@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/readonly-calendar"></script>
@endsection

@section('styles')
    @parent
    <link rel="stylesheet" type="text/css" href="{{ asset('css/calendar.css') }}">
@endsection

<div id="calendar">
</div>

<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />
