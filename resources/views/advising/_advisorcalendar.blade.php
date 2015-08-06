@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/moment.js') }}"></script>
    <script type="text/javascript" src="{{ asset('js/fullcalendar.js') }}"></script>
    <script type="text/javascript" src="{{ asset('js/advisorcalendar.js') }}"></script>
@endsection

@section('styles')
    @parent
    <link rel="stylesheet" type="text/css" href="{{ asset('css/fullcalendar.css') }}">
@endsection

@include('advising._blackoutform')

@include('advising._eventform')

<div id="calendar">
</div>

<input type="hidden" id="calendarFeedURL" value="{{ url('advising/meetingfeed') }}" />
<input type="hidden" id="calendarBlackoutFeedURL" value="{{ url('advising/blackoutfeed') }}" />
<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />
<input type="hidden" id="calendarPostURL" value="{{ url('advising/createmeeting') }}" />
<input type="hidden" id="calendarDeleteURL" value="{{ url('advising/deletemeeting') }}" />
<input type="hidden" id="blackoutPostURL" value="{{ url('advising/createblackout') }}" />
<input type="hidden" id="blackoutDeleteURL" value="{{ url('advising/deleteblackout') }}" />

