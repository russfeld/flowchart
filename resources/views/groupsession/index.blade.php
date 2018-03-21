@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('styles')
    @parent
<!--
    <link rel="stylesheet" type="text/css" href="{{ asset('css/summernote.css') }}">
-->
@endsection

@section('content')

@include('editable.textarea', ['field' => $editables['head']])

@if($user->is_advisor)
<a class="btn btn-danger" href="/groupsession/enable">Group Advising is Disabled - Enable? <i class="fa fa-arrow-circle-right" aria-hidden="true"></i></a>
@else
@if($enabled)
<a class="btn btn-success" href="{{ url('groupsession/list') }}">I have my DARS and Schedule ready <i class="fa fa-arrow-circle-right" aria-hidden="true"></i></a>
@else
<a class="btn btn-danger" href="#" disabled="disabled">Group Advising is Unavailable at this Time! <i class="fa fa-ban" aria-hidden="true"></i></a>
@endif
@endif

@endsection
