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

          @include('forms.autofill', ['field' => 'course_id', 'label' => 'Catalog Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course'])

          @include('forms.autofill', ['field' => 'completedcourse_id', 'label' => 'Completed Course Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course'])

        	<input type="hidden" id="planrequirement_id" value="-1" />

        </form>
      </div>

      <div class="modal-footer">
        <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      	<button type="button" class="btn btn-danger" id="deleteCourse">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveCourse">Save</button>
      </div>

    </div>
  </div>
</div>
