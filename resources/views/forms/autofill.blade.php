<div class="form-group">
  <input type="hidden" id="{{ $field }}" value="{{ $value }}">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <div class="input-group" aria-describedby="studentidhelp">
    <div id="{{ $field }}text" class="input-group-addon">Selected: ({{ $value }}) {{ $valuetext }}</div>
    <input type="text" class="form-control" id="{{ $field }}auto" aria-describedby="{{ $field }}help" {{ $disabled or '' }} placeholder="{{ $placeholder }}">
  </div>
  <span id="{{ $field }}help" class="help-block"></span>
</div>
