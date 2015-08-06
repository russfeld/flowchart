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

<div class="modal fade" id="createEvent" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Advising Appointment Details</h4>
      </div>
      <div class="modal-body">
      	<form>
      		<div class="form-group">
        		<label class="control-label" for="title">Title</label>
        		<input type="text" class="form-control" id="title" aria-describedby="titlehelp" disabled>
        		<span id="titlehelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="start">Start Time</label>
        		<input type="datetime-local" class="form-control" id="start" aria-describedby="starthelp" disabled>
        		<span id="starthelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="end">End Time</label>
        		<input type="datetime-local" class="form-control" id="end" aria-describedby="endhelp" disabled>
        		<span id="endhelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="desc">Description</label>
        		<input type="text" class="form-control" id="desc" aria-describedby="deschelp" >
        		<span id="deschelp" class="help-block"></span>
        	</div>
        	<input type="hidden" id="meetingID" value="-1" />
      </div>
      <div class="modal-footer">
      	<button type="button" class="btn btn-danger" id="deleteButton">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveButton">Save</button>
      </div>
    </div>
  </div>
</div>

<div id="calendar">
</div>

<input type="hidden" id="calendarFeedURL" value="{{ url('advising/meetingfeed') }}" />
<input type="hidden" id="calendarBlackoutFeedURL" value="{{ url('advising/blackoutfeed') }}" />
<input type="hidden" id="calendarAdvisorID" value="{{ $advisor->id }}" />
<input type="hidden" id="calendarPostURL" value="{{ url('advising/createmeeting') }}" />
<input type="hidden" id="calendarDeleteURL" value="{{ url('advising/deletemeeting') }}" />

