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

<div class="col-sm-6 col-sm-offset-3 col-md-6 col-md-offset-3">
  <h3 class="top-header text-center">Group Advising Queue</h3>

  <button id="groupRegisterBtn" type="button" class="btn btn-primary btn-block" disabled>Put me on the List! <span id="groupSpin" class="fa fa-cog fa-spin fa-lg">&nbsp;</span></button>
  <br>
  <div id="groupList">
    
  </div>
</div>

<input type="hidden" id="userID" value="{{ $user->id }}" />
<input type="hidden" id="isAdvisor" value="{{ $user->is_advisor }}" />

@endsection
