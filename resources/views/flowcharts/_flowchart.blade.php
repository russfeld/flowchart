<div class="row bg-light-purple rounded flowchart-header">
	@if($link)
		<div class="col-md-12">
  		<div class="hidden-xs">
  			<h3><a href="{{ url('flowcharts/view/' . $plan->id)}}">{{ $plan->name }}</a> <small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
  		<div class="visible-xs-block">
  			<h3><a href="{{ url('flowcharts/view/' . $plan->id)}}">{{ $plan->name }}</a><br><small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
			<b>Description: </b>{{ $plan->description }}<br>
			<b>Starts: </b>{{ $plan->starttext }}<br></p>
		</div>
	@else
		<div class="col-md-8">
  		<div class="hidden-xs">
  			<h3>{{ $plan->student->name }} - {{ $plan->name }} <small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
  		<div class="visible-xs-block">
  			<h3>{{ $plan->student->name }} - {{ $plan->name }} <br><small>{{ $plan->degreeprogram->name }}</small></h3>
  		</div>
			<b>Description: </b>{{ $plan->description }}<br>
			<b>Starts: </b>{{ $plan->starttext }}<br></p>
			<p>
				<a href="{{ url('flowcharts/' . $plan->student_id)}}" class="btn btn-primary"><i class="fa fa-list"></i> Select a Different Flowchart</a>
				<button class="btn btn-default" id="reset" title="Refresh Flowchart"><i class="fa fa-refresh"></i></button>
				<button class="btn btn-success" id="add-sem"><i class="fa fa-plus"></i> Semester</button>
				<button class="btn btn-info" id="add-course"><i class="fa fa-plus"></i> Requirement</button>
				<a href="{{ url('flowcharts/edit/' . $plan->id)}}" class="btn btn-warning"><i class="fa fa-pencil"></i> Edit Plan</a>
			</p>
		</div>
	@endif

	@if(!$link)
		<div class="col-md-4 flowchart-key">
			<dl class="dl-horizontal">
				<div class="row">
					<p class="text-center"><b>Flowchart Key:</b></p>
					<div class="col-xs-6">
						<dt><i class="fa fa-star prereq-icon" aria-hidden="true"></i></dt><dd>View Catalog Match</dd>
						<dt><i class="fa fa-code-fork text-primary" aria-hidden="true"></i></dt><dd>Elective List</dd>
						<dt><i class="fa fa-check text-success" aria-hidden="true"></i></dt><dd>Completed Course</dd>
						<dt><i class="fa fa-comment-o" aria-hidden="true"></i></dt><dd>Comments</dd>
						<dt><i class="fa fa-pencil" aria-hidden="true"></i></dt><dd>Edit</dd>
					</div>
					<div class="col-xs-6">
						<dt><i class="fa fa-times" aria-hidden="true"></i></dt><dd>Delete</dd>
						<dt><i class="fa fa-arrows-alt" aria-hidden="true"></i></dt><dd>Show Requisites</dd>
						<dt><i class="fa fa-circle prereq-icon" aria-hidden="true"></i></dt><dd>Selected Course</dd>
						<dt><i class="fa fa-arrow-circle-right prereq-icon" aria-hidden="true"></i></dt><dd>Prerequisite of Selected</dd>
						<dt><i class="fa fa-arrow-circle-left prereq-icon" aria-hidden="true"></i></dt><dd>Selected is Prerequisite</dd>
					</div>
				</div>
			</dl>
		</div>
	@endif
</div>
