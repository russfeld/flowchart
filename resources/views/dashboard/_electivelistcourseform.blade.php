<div class="modal fade" id="electivelistcourseform" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Elective List Course Details</h4>
      </div>
      <div class="modal-body">
        <form id="form">
          @include('forms.hidden', ['field' => 'electivelist_id', 'label' => 'Elective List', 'value' => $electivelist->id, 'displayvalue' => $electivelist->name, 'disabled' => 'disabled="disabled"'])
          @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => '', 'disabled' => 'disabled'])
          @include('forms.text', ['field' => 'course_prefix', 'label' => 'Course Prefix', 'value' => ''])
          @include('forms.radio', ['field' => 'range', 'label1' => 'Single Course', 'label2' => 'Course Range'])
          <div id="singlecourse">
            @include('forms.text', ['field' => 'course_min_number', 'label' => 'Course Number', 'value' => ''])
          </div>
          <div id="courserange" hidden>
            @include('forms.text', ['field' => 'course_min_number', 'label' => 'Min Course Number', 'value' => ''])
            @include('forms.text', ['field' => 'course_max_number', 'label' => 'Max Course Number', 'value' => ''])
          </div>
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
