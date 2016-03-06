<div class="form-group">
  <label class="control-label" for="{{ $field }}">{{ $label }}</label>
  <select class="form-control" id="{{ $field }}" aria-describedby="{{ $field }}help" {{ $disabled or '' }} value="{{ $value }}">
    @foreach($options as $option)
    @if($option->id == $value)
      <option selected value="{{ $option->id }}">{{$option->name}}</option>
    @else
      <option value="{{ $option->id }}">{{$option->name}}</option>
    @endif
    @endforeach
  </select>
  <span id="{{ $field }}help" class="help-block"></span>
</div>
