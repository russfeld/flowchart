<div class="form-group">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <textarea class="form-control" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }}>{{ $value }}</textarea>
  <span id="{{ $field }}help" class="help-block"></span>
</div>
