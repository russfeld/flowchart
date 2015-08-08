<div class="modal fade" id="createBlackout" tabindex="-1" role="dialog" aria-labelledby="createBlackoutLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createBlackoutLabel">Blackout Details</h4>
      </div>
      <div class="modal-body">
      	<form>
      		<div class="form-group">
        		<label class="control-label" for="btitle">Title</label>
        		<input type="text" class="form-control" id="btitle" aria-describedby="btitlehelp">
        		<span id="btitlehelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="bstart">Start Time</label>
        		<div class="input-group date" id="bstart_datepicker" aria-describedby="bstarthelp">
                <input type="text" class="form-control" id="bstart" />
                <span id="bstart_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
        		<span id="bstarthelp" class="help-block"></span>
        	</div>
        	<div class="form-group">
        		<label class="control-label" for="bend">End Time</label>
        		<div class="input-group date" id="bend_datepicker" aria-describedby="bendhelp">
                <input type="text" class="form-control" id="bend" />
                <span id="bend_span" class="input-group-addon">
                    <span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
        		<span id="bendhelp" class="help-block"></span>
        	</div>
          <div id="repeatdiv">
            <hr>
            <div class="form-group">
              <label class="control-label" for="brepeat">Repeat</label>
              <select class="form-control" id="brepeat" aria-describedby="brepeathelp">
                <option value="0" selected>None</option>
                <option value="1">Daily</option>
                <option value="2">Weekly</option>
              </select>
              <span id="brepeathelp" class="help-block"></span>  
            </div>
          </div>
          <div id="repeatdailydiv" hidden>
            <div class="form-group">
              <label class="control-label" for="brepeatdaily">Repeat Every ____ Days</label>
              <select class="form-control" id="brepeatdaily" aria-describedby="brepeatdailyhelp">
                @for ($i = 1; $i < 31; $i++)
                    <option value="{{ $i }}">{{ $i }}</option>
                @endfor
              </select>
              <span id="brepeatdailyhelp" class="help-block"></span>  
            </div>
          </div>
          <div id="repeatweeklydiv" hidden>
            <div class="form-group">
              <label class="control-label" for="brepeatweekly">Repeat Every ____ Weeks</label>
              <select class="form-control" id="brepeatweekly" aria-describedby="brepeatweeklyhelp">
                @for ($i = 1; $i < 20; $i++)
                    <option value="{{ $i }}">{{ $i }}</option>
                @endfor
              </select>
              <span id="brepeatweeklyhelp" class="help-block"></span>  
            </div>
            <div class="form-group">
              <label class="control-label" for="brepeatweekdays">On these days of the week</label><br>
                <label class="checkbox-inline">
                  <input type="checkbox" id="brepeatweekdays1" value="1"> M
                </label>
                <label class="checkbox-inline">
                  <input type="checkbox" id="brepeatweekdays2" value="2"> T
                </label>
                <label class="checkbox-inline">
                  <input type="checkbox" id="brepeatweekdays3" value="3"> W
                </label>
                <label class="checkbox-inline">
                  <input type="checkbox" id="brepeatweekdays4" value="4"> U
                </label>
                <label class="checkbox-inline">
                  <input type="checkbox" id="brepeatweekdays5" value="5"> F
                </label>
              <span id="brepeatweekdayshelp" class="help-block"></span>  
            </div>
          </div>
          <div id="repeatuntildiv" hidden>
            <div class="form-group">
              <label class="control-label" for="brepeatuntil">Repeat Until</label>
              <div class="input-group date">
                <input id="brepeatuntil" type="text" class="form-control" aria-describedby="brepeatuntilhelp"><span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>
              </div>
              <span id="brepeatuntilhelp" class="help-block"></span>
            </div>
          </div>
        	<input type="hidden" id="bblackoutid" value="-1" />
          <input type="hidden" id="bblackouteventid" value="-1" />
        </form>
      </div>
      <div class="modal-footer">
      	<button type="button" class="btn btn-danger" id="deleteBlackoutButton">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveBlackoutButton">Save</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="blackoutOption" tabindex="-1" role="dialog" aria-labelledby="blackoutOptionLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="blackoutOptionLabel">This event has multiple occurrences:</h4>
      </div>
      <div class="modal-body">
        <button type="button" class="btn btn-primary" id="blackoutSeries">Edit the series</button>
        <button type="button" class="btn btn-primary" id="blackoutOccurrence">Edit this occurrence</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="meetingOption" tabindex="-1" role="dialog" aria-labelledby="meetingOptionLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="meetingOptionLabel">Create which type of event</h4>
      </div>
      <div class="modal-body">
        <button type="button" class="btn btn-primary" id="advisingButton">Advising Meeting</button>
        <button type="button" class="btn btn-primary" id="blackoutButton">Blackout Times</button>
      </div>
    </div>
  </div>
</div>

