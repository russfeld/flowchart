<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 dashboard-detail rounded">
  <div class="hidden-xs">
  	<h3>{{ $electivelist->name }} ({{ $electivelist->abbreviation }})</h3>
  </div>
  <div class="visible-xs-block">
  	<h3>{{ $electivelist->name }} ({{ $electivelist->abbreviation }})</h3>
  </div>
  <input type="hidden" id="electivelist_id" value="{{ $electivelist->id }}">
@if($buttons)
  <p>
    <a class="btn btn-primary" href="{{url('/admin/electivelists/' . $electivelist->id . '/edit')}}" role="button">Edit</a>
    <a type="button" class="btn btn-warning" href="{{ url('/admin/electivelists/')}}">Back</a>
  </p>
@endif
</div>
