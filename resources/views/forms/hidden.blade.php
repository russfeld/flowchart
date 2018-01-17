<div class="form-group">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <input type="text" class="form-control" id="{{ $field }}view" aria-describedby="{{ $field }}help" {{ $disabled or '' }} value="{{ $displayvalue }}">
  <input type="hidden" id="{{ $field }}" aria-describedby="{{ $field }}help" value="{{ $value }}">
  <span id="{{ $field }}help" class="help-block"></span>
</div>
