<div class="modal fade" id="editCourse" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Course Details</h4>
      </div>
      <div class="modal-body">
      	<form>

      		@include('forms.text', ['field' => 'course_name', 'label' => 'Course Title', 'value' => ''])

          @include('forms.autofill', ['field' => 'electivelist_id', 'label' => 'Elective:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Elective List'])

          @include('forms.text', ['field' => 'credits', 'label' => 'Credits', 'value' => ''])

          @include('forms.text', ['field' => 'notes', 'label' => 'Notes', 'value' => ''])

          @include('forms.autofilllock', ['field' => 'course_id', 'label' => 'Catalog Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course', 'locked' => 0])

          @include('forms.autofilllock', ['field' => 'completedcourse_id', 'label' => 'Completed Course Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course', 'locked' => 0])

        	<input type="hidden" id="planrequirement_id" value="-1" />

        </form>
      </div>

      <div class="modal-footer">
        <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      	<button type="button" class="btn btn-danger" id="deleteCourse"><i class="fa fa-trash" aria-hidden="true"></i> Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times" aria-hidden="true"></i> Close</button>
        <button type="button" class="btn btn-primary" id="saveCourse"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save</button>
      </div>

    </div>
  </div>
</div>
