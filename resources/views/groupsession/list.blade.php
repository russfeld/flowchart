@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('scripts')
    @parent
    <script>
      var pusherKey = "{{ env('PUSHER_KEY') }}";
    </script>
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/groupsession"></script>
@endsection

@section('content')

<div class="col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">
@if(!$user->is_advisor)
  <h3 class="top-header text-center">Group Advising Queue</h3>
  <button id="groupRegisterBtn" type="button" class="btn btn-primary btn-block" disabled>Put me on the List! <span id="groupSpin" class="fa fa-cog fa-spin fa-lg">&nbsp;</span></button>
  <br>
@else
  <h3 class="top-header text-center">Group Advising Queue</h3>
  <button id="groupDisableBtn" type="button" class="btn btn-danger btn-block">Disable Group Advising <span id="groupSpin" class="fa fa-cog fa-spin fa-lg">&nbsp;</span></button>
  <br>
@endif
  <div id="groupList">

  </div>
</div>

<input type="hidden" id="userID" value="{{ $user->id }}" />
<input type="hidden" id="isAdvisor" value="{{ $user->is_advisor }}" />

@endsection
