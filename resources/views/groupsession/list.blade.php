@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('scripts')
    <script type="text/javascript">
      window.pusherKey = "{{ env('PUSHER_KEY') }}";
      window.pusherCluster = "{{ env('PUSHER_CLUSTER') }}";
    </script>
    @parent
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
    <template v-if="advisor">
      <template v-for="student in queue">
        <div class="alert groupsession-div" v-bind:class="getClass(student)" role="alert">
          <template v-if="student.status == 2">
            <button class="btn btn-danger pull-right groupsession-button del-button" v-bind:data-id="student.id" v-on:click="delStudent">X</button>
            <button class="btn btn-primary pull-right groupsession-button done-button" v-bind:data-id="student.id" v-on:click="doneStudent">Done</button>
            <button class="btn btn-info pull-right groupsession-button put-button" v-bind:data-id="student.id" v-on:click="putStudent">Requeue</button>
          </template>
          <template v-else>
            <button class="btn btn-danger pull-right groupsession-button del-button" v-bind:data-id="student.id" v-on:click="delStudent">X</button>
            <button class="btn btn-success pull-right groupsession-button take-button" v-bind:data-id="student.id" v-on:click="takeStudent">Take</button>
          </template>
          @{{ student.name }}
          <span class="badge"> @{{ student | statustext }}</span>
        </div>
      </template>
    </template>
    <template v-else>
      <div v-for="student in queue" class="alert groupsession-div" v-bind:class="getClass(student)"  role="alert">@{{ student.name }} <span class="badge"> @{{ student | statustext }}</span></div>
    </template
  </div>
</div>

<input type="hidden" id="userID" value="{{ $user->id }}" />
<input type="hidden" id="isAdvisor" value="{{ $user->is_advisor }}" />

@endsection
