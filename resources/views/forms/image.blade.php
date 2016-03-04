<div class="form-group">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <div class="thumbnail">
    <img src="{{ url($value) }}" class="img-thumbnail" alt="Advisor Picture" style="height: 200px; margin-bottom: 5px;">
    <div class="input-group">
      <span class="input-group-btn">
        <span class="btn btn-primary btn-file">
            Browse&hellip; <input type="file" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }}>
        </span>
      </span>
      <input type="text" class="form-control" value="{{ $value }}" readonly>
    </div>
    <span id="{{ $field }}help" class="help-block"></span>
  </div>
</div>
