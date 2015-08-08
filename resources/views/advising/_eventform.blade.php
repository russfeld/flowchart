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
        		<div class="input-group date" id="start_datepicker" aria-describedby="starthelp">
                <input type="text" class="form-control" id="start" />
                <span id="start_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
            <span id="starthelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="end">End Time</label>
        		<div class="input-group date" id="end_datepicker" aria-describedby="endhelp">
                <input type="text" class="form-control" id="end" />
                <span  id="end_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
        		<span id="endhelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="desc">Description</label>
        		<input type="text" class="form-control" id="desc" aria-describedby="deschelp" >
        		<span id="deschelp" class="help-block"></span>
        	</div>
        	<input type="hidden" id="meetingID" value="-1" />
        </form>
      </div>
      <div class="modal-footer">
      	<button type="button" class="btn btn-danger" id="deleteButton">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveButton">Save</button>
      </div>
    </div>
  </div>
</div>