<div class="modal fade" id="editCourse" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Course Details</h4>
      </div>
      <div class="modal-body">
      	<form>

      		<div class="form-group">
        		<label class="control-label" for="course_name">Course Name</label>
        		<input type="text" class="form-control" id="course_name" aria-describedby="course_namehelp">
        		<span id="course_namehelp" class="help-block"></span>
        	</div>

          <div class="form-group">
        		<label class="control-label" for="electivelist_name">Elective List</label>
        		<input type="text" class="form-control" id="electivelist_name" aria-describedby="electivelist_namehelp">
        		<span id="electivelist_namehelp" class="help-block"></span>
        	</div>

          <div class="form-group">
        		<label class="control-label" for="match">Matched As</label>
        		<input type="text" class="form-control" id="match" aria-describedby="matchhelp">
        		<span id="matchhelp" class="help-block"></span>
        	</div>

          <div class="form-group">
        		<label class="control-label" for="credits">Credits</label>
        		<input type="text" class="form-control" id="credits" aria-describedby="creditshelp">
        		<span id="creditshelp" class="help-block"></span>
        	</div>

          <div class="form-group">
        		<label class="control-label" for="notes">Notes</label>
        		<input type="text" class="form-control" id="notes" aria-describedby="noteshelp">
        		<span id="noteshelp" class="help-block"></span>
        	</div>

        	<input type="hidden" id="planrequirement_id" value="-1" />

        </form>
      </div>

      <div class="modal-footer">
        <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      	<button type="button" class="btn btn-danger" id="deleteButton">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveButton">Save</button>
      </div>

    </div>
  </div>
</div>
