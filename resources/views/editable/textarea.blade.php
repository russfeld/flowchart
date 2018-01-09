<div class="editable" data-id="{{ $field->key }}">
  {!! $field->contents !!}
  <p><a href="#" class="editable_link" data-id="{{ $field->key }}"><i class="fa fa-pencil" aria-hidden="true"></i>[edit]</a> <small><i>Last edited {{ $field->updated_at }} by {{ $field->user->eid }}</i></small></p>
</div>
