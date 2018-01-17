<div class="form-group">
  <input type="radio" id="{{ $field }}1" name="{{ $field }}" value="1" aria-describedby="{{ $field }}help" checked >
  <label class="control-label" for="{{ $field }}1">{{ $label1 }}</label>
  <input type="radio" id="{{ $field }}2" name="{{ $field }}" value="2" aria-describedby="{{ $field }}help" >
  <label class="control-label" for="{{ $field }}2">{{ $label2 }}</label>
  <span id="{{ $field }}help" class="help-block"></span>
</div>
