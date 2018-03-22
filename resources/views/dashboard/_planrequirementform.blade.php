<div class="modal fade" id="planrequirementform" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Plan Requirement Details</h4>
      </div>
      <div class="modal-body">
        <form id="form">
          <input type="hidden" id="plan_id" value="{{ $plan->id }}" />
          <input type="hidden" id="student_id" value="{{ $plan->student_id }}" />
          @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => '', 'disabled' => 'disabled'])
          @include('forms.text', ['field' => 'degreerequirement_id', 'label' => 'Degree Requirement ID', 'value' => '', 'disabled' => 'disabled'])
          @include('forms.text', ['field' => 'course_name', 'label' => 'Course', 'value' => ''])
          @include('forms.autofill', ['field' => 'electivelist_id', 'label' => 'Elective:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Elective List'])
          @include('forms.text', ['field' => 'credits', 'label' => 'Credits', 'value' => ''])
          @include('forms.selectajax', ['field' => 'semester_id', 'label' => 'Semester', 'value' => ''])
          @include('forms.text', ['field' => 'ordering', 'label' => 'Ordering', 'value' => ''])
          @include('forms.text', ['field' => 'notes', 'label' => 'Notes', 'value' => ''])
          @include('forms.autofilllock', ['field' => 'course_id', 'label' => 'Catalog Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course', 'locked' => 0])
          @include('forms.autofilllock', ['field' => 'completedcourse_id', 'label' => 'Completed Course Match:', 'value' => 0, 'valuetext' => '', 'placeholder' => 'Enter Course', 'locked' => 0])
        </form>
      </div>
      <div class="modal-footer">
        <span id="spin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
      	<button type="button" class="btn btn-danger" id="delete">Delete</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="save">Save</button>
      </div>
    </div>
  </div>
</div>
