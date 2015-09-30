<!DOCTYPE html>
<html>
    <head>
        @include('includes.head')
        <title>K-State Engineering Advising - @yield('title')</title>
    </head>
    <body role="document">
        @include('includes.navbar')
        <div class="container" role="main">
            <div id="message">
            </div>
            @yield('content')
        </div>

        @include('includes.footer')

        @include('includes.scripts')
    </body>
</html>