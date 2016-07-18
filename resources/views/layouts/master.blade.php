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
              @if(session('message') !== null)
                <input type="hidden" id="message_flash" value="{{ session('message') }}">
                <input type="hidden" id="message_type_flash" value="{{ session('type') }}">
              @endif
            </div>
            @yield('content')
        </div>

        @include('includes.footer')

        @include('includes.scripts')
    </body>
</html>
