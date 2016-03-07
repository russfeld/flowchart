<!DOCTYPE html>
<html>
    <head>
        @include('includes.head')
        <title>K-State Engineering Advising - @yield('title')</title>
    </head>
    <body class="skin-purple" role="document">
        @include('includes.navbar')
        <div class="container-fluid" role="main">
            <div id="message">
            </div>
            @yield('content')
        </div>

        @include('includes.scripts')
    </body>
</html>
