@extends('dashboard._layout')

@section('scripts')
    @parent
    <script type="text/javascript" src="{{ asset('js/lib/require.js') }}" data-main="/js/dashboard_index"></script>
@endsection

@section('dashcontent')

Hello!

@endsection
