@extends('layouts.master')

@section('title', 'Advising - View Advisor Calendar')

@section('scripts')
    <script type="text/javascript">
      window.advisor = true;
      window.nobind = true;
    </script>
    @parent
@endsection

@section('content')

@include('advising._message')

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<div class="col-sm-12">
	<h4>This calendar is read-only!</h4>
</div>

<div id="calendar">
</div>

<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />

<br>
@endsection
