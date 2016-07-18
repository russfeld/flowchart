@if(DbConfig::get('showmessage') === true)
<br>
<div class="alert alert-danger" role="alert">The CIS Department is holding <b>Group Advising</b> sessions this year. Click <a href="{{ url('/help/groupsession') }}" class="alert-link"><b>here</b></a> to learn more! Please attend a group session if possible unless you require an in-depth advising appointment. This will help us keep individual times available for students who need them most.</div>
@endif
