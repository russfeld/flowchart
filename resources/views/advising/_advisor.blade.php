<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 bg-light-purple rounded">
<img class="img-responsive advisor-img hidden-xs pull-left" src="{{ url($advisor->pic) }}" alt="{{ $advisor->name . 'picture' }}">
@if($link)
<div class="hidden-xs">
	<h3><a href="{{ url('advising/index/' . $advisor->id)}}">{{ $advisor->name }}</a> <small>{{ $advisor->department->name }}</small></h3>
</div>
<div class="visible-xs-block">
	<h3><a href="{{ url('advising/index/' . $advisor->id)}}">{{ $advisor->name }}</a><br><small>{{ $advisor->department->name }}</small></h3>
</div>
@else
<div class="hidden-xs">
	<h3>{{ $advisor->name }} <small>{{ $advisor->department->name }}</small></h3>
</div>
<div class="visible-xs-block">
	<h3>{{ $advisor->name }}<br><small>{{ $advisor->department->name }}</small></h3>
</div>
@endif
	<p><b>Email: </b><a href="mailto:{{ $advisor->email }}">{{ $advisor->email }}</a><br>
	<b>Office: </b>{{ $advisor->office }}<br>
	<b>Phone: </b>{{ $advisor->phone }}<br>
	<b>Notes: </b>{{ $advisor->notes }}</p>
@if(!$link)
	<p><a href="{{ url('advising/select') }}" class="btn btn-primary">Select a Different Advisor</a></p>
@endif
</div>
