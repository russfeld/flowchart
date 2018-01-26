<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 dashboard-detail rounded">
  <div class="hidden-xs">
  	<h3>{{ $plan->name }} ({{ $plan->degreeprogram->abbreviation or "Unassigned" }}) <small>{{ $plan->student->name or "Unassigned" }}</small></h3>
  </div>
  <div class="visible-xs-block">
  	<h3>{{ $plan->name }} ({{ $plan->degreeprogram->abbreviation or "Unassigned" }})<br><small>{{ $plan->student->name or "Unassigned" }}</small></h3>
  </div>
	<p><b>Description: </b>{{ $plan->description }}<br>
  <b>Start: </b>{{ $plan->starttext }}<br>
@if($buttons)
  <a class="btn btn-primary" href="{{url('/admin/plans/' . $plan->id . '/edit')}}" role="button">Edit</a>
  <a type="button" class="btn btn-warning" href="{{ url('/admin/plans/')}}">Back</a>
@endif
  </p>
</div>
