@extends('layouts.masterwide')

@section('title', 'Flowcharts - Manage Flowchart')

@section('content')

@include('flowcharts._flowchart', ['plan' => $plan, 'link' => false])


<div id="flowchart">

<draggable v-model="semesters" class="flowchart" :options="{group: 'semesters', animation: 150}">

  <template v-for="(semester, index) in semesters">
    <div class="semester" v-bind:data-id="semester.id" :key="semester.id">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title text-center">@{{ semester.name }}</h4>
        </div>

          <draggable v-model="semester.courses" class="list-group" :options="{group: 'courses', animation: 150}">

              <template v-for="course in semester.courses">
                <div class="course list-group-item" v-bind:data-id="course.id" :key="course.id">
                  <template v-if="course.name.length != 0">
                    <p>@{{ course.name }} (@{{ course.credits }})</p>
                    <template v-if="course.electivelist_name.length != 0">
                      <p>from @{{ course.electivelist_name }}</p>
                    </template>
                  </template>
                  <template v-else>
                    <p>@{{ course.electivelist_name }} (@{{ course.credits }})</p>
                  </template>
                  <p>@{{ course.notes }}</p>
                </div>
              </template>

          </draggable>

      </div> <!-- panel -->
    </div> <!-- semester -->
  </template>

</draggable>

</div>

<button class="btn btn-primary" id="reset">Reset</button>



<input type="hidden" id="id" value="{{$plan->id}}">

@endsection
