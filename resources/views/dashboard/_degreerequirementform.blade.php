<div class="modal fade" id="degreerequirementform" tabindex="-1" role="dialog" aria-labelledby="createEventLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="createEventLabel">Degree Requirement Details</h4>
      </div>
      <div class="modal-body">
        <form>
          @include('forms.hidden', ['field' => 'degreeprogram_id', 'label' => 'Degree Program', 'value' => $degreeprogram->id, 'displayvalue' => $degreeprogram->name, 'disabled' => 'disabled'])
          @include('forms.text', ['field' => 'id', 'label' => 'ID', 'value' => '', 'disabled' => 'disabled'])
          @include('forms.text', ['field' => 'notes', 'label' => 'Notes', 'value' => ''])
          <input type="hidden" id="degreerequirementid" value="" />
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
