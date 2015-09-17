<!DOCTYPE html>
<html>
    <head>
        @include('includes.head')
        <title>K-State Engineering Advising - @yield('title')</title>
    </head>
    <body role="document">
        @include('includes.navbar')
        <div class="container" role="main">
            <br>
            <a href="http://schedule.cis.ksu.edu" class="btn active btn-danger">Warning! This site is in BETA. Please use the CIS Advising Scheduler site to schedule actual meetings</a>
            <br><br>
            <div id="message">
            </div>
            @yield('content')
        </div>

        @include('includes.footer')

        @include('includes.scripts')
    </body>
</html>