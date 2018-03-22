@extends('layouts.masterwide')

@section('title', 'Flowcharts - Manage Flowchart')

@section('content')

@include('flowcharts._flowchart', ['plan' => $plan, 'link' => false])


<div id="flowchart">

<draggable v-model="semesters" class="flowchart" :options="{group: 'semesters', animation: 150, filter: '.no-drag', preventOnFilter: false}" @end="dropSemester">

  <template v-for="(semester, index) in semesters">
    <div class="semester" v-bind:data-id="semester.id" :key="semester.id">
      <div class="panel panel-default">
        <div v-bind:id="'sem-panelhead-' + semester.id" class="panel-heading clearfix move">
          <h4 class="panel-title pull-left">@{{ semester.name }}</h4>
          <div class="btn-group pull-right">
            <template v-if="semester.courses.length == 0">
              <button type="button" class="delete-sem btn btn-default btn-xs" aria-label="Delete" v-bind:data-id="semester.id" title="Delete Semester" v-on:click.capture="deleteSemester"><i class="fa fa-times"></i></button>
            </template>
            <button type="button" class="edit-sem btn btn-default btn-xs" aria-label="Edit" v-bind:data-id="semester.id" title="Edit Semester" v-on:click.capture="editSemester"><i class="fa fa-pencil"></i></button>
          </div>
        </div>

        <div v-bind:id="'sem-paneledit-' + semester.id" class="panel-heading clearfix" hidden>
          <div class="input-group no-drag">
            <input v-bind:id="'sem-text-' + semester.id" v-on:keyup.enter="saveSemester" type="text" class="form-control input-sm" v-bind:data-id="semester.id" v-model="semester.name">
            <div class="input-group-btn">
              <button type="button" class="save-sem btn btn-success btn-sm" v-bind:data-id="semester.id" aria-label="Save" title="Save Semester" v-on:click.capture="saveSemester"><i class="fa fa-check"></i></button>
            </div>
          </div>
        </div>

          <draggable v-model="semester.courses" class="list-group" v-bind:data-id="index" :options="{group: 'courses', animation: 150}" @end="dropCourse">

              <template v-for="(course, cindex) in semester.courses">
                <div class="course list-group-item move" v-bind:class="{'custom-course': course.custom, 'complete-course': course.complete}" v-bind:data-id="course.id" :key="course.id">
                  <div class="course-content pull-left">
                    <template v-if="course.name.length != 0">
                      <template v-if="course.course_id <= 0">
                        <p><b>@{{ course.name }} (@{{ course.credits }})</b></p>
                      </template>
                      <template v-else>
                        <p><i class="fa fa-star" aria-hidden="true"></i> <b>@{{ course.name }} (@{{ course.credits }})</b></p>
                      </template>
                      <template v-if="course.electivelist_name.length != 0">
                        <p><i class="fa fa-code-fork text-primary" aria-hidden="true"></i> @{{ course.electivelist_abbr }}</p>
                      </template>
                    </template>
                    <template v-else>
                      <p><i class="fa fa-code-fork text-primary" aria-hidden="true"></i> <b>@{{ course.electivelist_abbr }} (@{{ course.credits }})</b></p>
                    </template>
                    <template v-if="course.completedcourse_name.length != 0">
                      <p><i><i class="fa fa-check text-success" aria-hidden="true"></i> @{{ course.completedcourse_name }}</i></p>
                    </template>
                    <template v-if="course.notes.length != 0">
                      <p><i class="fa fa-comment-o" aria-hidden="true"></i> @{{ course.notes }}</p>
                    </template>
                  </div>

                  <div class="btn-group pull-right">
                    <button type="button" class="edit-course btn btn-default btn-xs" aria-label="Edit" title="Edit Course" v-bind:data-id="cindex" v-bind:data-sem="index" v-on:click.capture="editCourse"><i class="fa fa-pencil"></i></button>
                  </div>
                </div>
              </template>

          </draggable>

      </div> <!-- panel -->
    </div> <!-- semester -->
  </template>

</draggable>

</div>

@include('flowcharts._courseform')

<input type="hidden" id="id" value="{{$plan->id}}">
<input type="hidden" id="student_id" value="{{$plan->student_id}}">

@endsection
