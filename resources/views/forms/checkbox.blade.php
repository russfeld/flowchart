<div class="form-group">
@if($value == 1)
  <input type="checkbox" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }} checked>
@else
  <input type="checkbox" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }} >
@endif
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <span id="{{ $field }}help" class="help-block"></span>
</div>
