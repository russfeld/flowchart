<div id="editable-{{ $field->id }}" class="editable">
  {!! $field->contents !!}
</div>
@if(Auth::user()->is_advisor)
<div id="editablebutton-{{ $field->id }}">
  <p><a href="#" class="editable-link" data-id="{{ $field->id }}"><i class="fa fa-pencil" aria-hidden="true"></i>[edit]</a> <small><i>Last edited {{ $field->updated_at }} by {{ $field->user->eid }}</i></small></p>
</div>
<div id="editablesave-{{ $field->id}}" class="hidden">
  <a class="btn btn-success editable-save" data-id="{{ $field->id }}" href="#"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save Changes <i id="editablespin-{{ $field->id}}" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</i></a>
  <a class="btn btn-warning editable-cancel" data-id="{{ $field->id }}" href="#"><i class="fa fa-times" aria-hidden="true"></i> Cancel </a>
</div>
@endif
