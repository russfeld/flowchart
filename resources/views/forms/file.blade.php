<div class="form-group">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <input type="file" class="form-control" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }} value="{{ $value }}">
  <span id="{{ $field }}help" class="help-block"></span>
</div>
