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
          <div id="studentiddiv" hidden>
            <div class="form-group">
              <label class="control-label" for="studentid">Student</label>
              <div class="input-group" aria-describedby="studentidhelp">
                <input type="text" class="form-control" id="studentid" aria-describedby="studentidhelp" disabled>
                <span class="input-group-btn">
                  <button class="btn btn-success" type="button" id="newStudentButton"><i class="fa fa-plus" aria-hidden="true"></i></button>
                </span>
              </div>
              <span id="studentidhelp" class="help-block"></span>
            </div>
          </div>
        	<div class="form-group">
        		<label class="control-label" for="start">Start Time</label>
        		<div class="input-group date" id="start_datepicker" aria-describedby="starthelp">
                <input type="text" class="form-control" id="start" readonly/>
                <span id="start_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
            <span id="starthelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="end">End Time</label>
        		<div class="input-group date" id="end_datepicker" aria-describedby="endhelp">
                <input type="text" class="form-control" id="end" readonly/>
                <span  id="end_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
        		<span id="endhelp" class="help-block"></span>
        	</div>
          <div id="durationdiv">
            <div class="form-group">
              <label class="control-label" for="duration">Duration</label>
              <select class="form-control" id="duration" aria-describedby="durationhelp">
                <option value="20">20 minutes</option>
                <option value="40">40 minutes</option>
                <option value="60">60 minutes</option>
              </select>
              <span id="durationhelp" class="help-block"></span>
            </div>
          </div>
        	<div class="form-group">
        		<label class="control-label" for="desc">Reason for appointment (please be specific):</label>
        		<input type="text" class="form-control" id="desc" aria-describedby="deschelp" >
        		<span id="deschelp" class="help-block"></span>
        	</div>
          <div id="statusdiv" hidden>
            <div class="form-group">
              <label class="control-label" for="status">Status</label>
              <select class="form-control" id="status" aria-describedby="statushelp">
                <option value="0">New</option>
                <option value="1">Attended</option>
                <option value="2">Absent</option>
              </select>
              <span id="statushelp" class="help-block"></span>
            </div>
          </div>
        	<input type="hidden" id="meetingID" value="-1" />
          <input type="hidden" id="studentidval" value="-1" />
        </form>
      </div>
      <div class="modal-footer">
        <span id="createEventspin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      	<button type="button" class="btn btn-danger" id="deleteButton"><i class="fa fa-trash" aria-hidden="true"></i> Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times" aria-hidden="true"></i> Close</button>
        <button type="button" class="btn btn-primary" id="saveButton"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save</button>
      </div>
    </div>
  </div>
</div>
