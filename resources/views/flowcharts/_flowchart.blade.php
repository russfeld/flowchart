<div class="row bg-light-purple rounded flowchart-header">
	<div class="col-xs-12">
	@if($link)
  		<div class="hidden-xs">
  			<h3><a href="{{ url('flowcharts/view/' . $plan->id)}}">{{ $plan->name }}</a> <small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
  		<div class="visible-xs-block">
  			<h3><a href="{{ url('flowcharts/view/' . $plan->id)}}">{{ $plan->name }}</a><br><small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
		@else
  		<div class="hidden-xs">
  			<h3>{{ $plan->name }} <small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
  		<div class="visible-xs-block">
  			<h3>{{ $plan->name }}<br><small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
		@endif
		<b>Description: </b>{{ $plan->description }}<br>
		<b>Starts: </b>{{ $plan->starttext }}<br></p>
	</div>
	<div class="col-xs-12">
		@if(!$link)
			<p>
				<a href="{{ url('flowcharts/' . $plan->student_id)}}" class="btn btn-primary"><i class="fa fa-list"></i> Select a Different Flowchart</a>
				<button class="btn btn-default" id="reset" title="Refresh Flowchart"><i class="fa fa-refresh"></i></button>
				<button class="btn btn-success" id="add-sem"><i class="fa fa-plus"></i> Semester</button>
				<button class="btn btn-info" id="add-course"><i class="fa fa-plus"></i> Requirement</button>
			</p>
		@endif
	</div>
</div>
