@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/moment.js') }}"></script>
    <script type="text/javascript" src="{{ asset('js/fullcalendar.js') }}"></script>
    <script type="text/javascript" src="{{ asset('js/singlecalendar.js') }}"></script>
@endsection

@section('styles')
    @parent
    <link rel="stylesheet" type="text/css" href="{{ asset('css/fullcalendar.css') }}">
@endsection

<div id="calendar">
</div>

<input type="hidden" id="calendarFeedURL" value="{{ url('advising/meetingfeed') }}" />
<input type="hidden" id="calendarBlackoutFeedURL" value="{{ url('advising/blackoutfeed') }}" />
<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />
<input type="hidden" id="calendarPostURL" value="{{ url('advising/createmeeting') }}" />