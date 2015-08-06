<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 bg-light-purple rounded">
<div class="col-md-2 col-sm-2 col-lg-2 hidden-xs center-block" style="height: auto">
	<img class="img-responsive advisor-img hidden-xs pull-right" src="{{ url('img/' . $advisor->pic) }}" alt="{{ $advisor->name . 'picture' }}">
</div>
<div class="col-md-10 col-sm-10 col-lg-10 col-xs-12">
@if($link)
	<h3><a href="{{ url('advising/index/' . $advisor->id)}}">{{ $advisor->name }}</a> <small>{{ $advisor->department->name }}</small></h3>
@else
	<h3>{{ $advisor->name }} <small>{{ $advisor->department->name }}</small></h3>
@endif
	<p><a href="mailto:{{ $advisor->email }}">{{ $advisor->email }}</a></p>
	<p><b>Office: </b>{{ $advisor->office }}<br>
	<b>Phone: </b>{{ $advisor->phone }}<br>
	<b>Notes: </b>{{ $advisor->notes }}</p>
</div>
</div>