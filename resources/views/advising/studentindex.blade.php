@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('scripts')
    <script type="text/javascript">
      window.advisor = false;
      window.nobind = false;
    </script>
    @parent
@endsection

@section('content')

@include('advising._message')

<h3 class="top-header">Welcome {{ $user->student->first_name}}! Your currently selected advisor is:</h3>

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<h4>Click an open time below to schedule a meeting</h4>

@include('advising._eventform')

<div id="calendar">
</div>

<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />
<input type="hidden" id="calendarStudentName" value="{{ $user->student->name }}" />
<br>
@endsection
