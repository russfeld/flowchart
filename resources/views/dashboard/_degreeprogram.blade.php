<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 dashboard-detail rounded">
  <div class="hidden-xs">
  	<h3>{{ $degreeprogram->name }} ({{ $degreeprogram->abbreviation }}) <small>{{ $degreeprogram->department->name or "Unassigned" }}</small></h3>
  </div>
  <div class="visible-xs-block">
  	<h3>{{ $degreeprogram->name }} ({{ $degreeprogram->abbreviation }})<br><small>{{ $degreeprogram->department->name or "Unassigned" }}</small></h3>
  </div>
	<p><b>Description: </b>{{ $degreeprogram->description }}</a><br>
	<b>Effective: </b>{{ $degreeprogram->effectivetext }}<br>
@if($buttons)
  <a class="btn btn-primary" href="{{url('/admin/degreeprograms/' . $degreeprogram->id . '/edit')}}" role="button">Edit</a>
  <a type="button" class="btn btn-warning" href="{{ url('/admin/degreeprograms/')}}">Back</a>
@endif
</div>
