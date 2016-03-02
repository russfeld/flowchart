@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/groupsession"></script>
@endsection

@section('content')

<h3 class="top-header">Welcome to Group Advising</h3>

<span id="groupSpin" class="fa fa-cog fa-spin fa-lg hide-spin">&nbsp;</span>
<button type="button" class="btn btn-primary" id="groupRegisterBtn">Put me on the List!</button>

@endsection
