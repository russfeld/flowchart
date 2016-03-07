@extends('layouts.nofooter')

@section('title', 'Profiles')

@section('styles')
    @parent
    <link rel="stylesheet" type="text/css" href="{{ asset('css/dashboard.css') }}">
@endsection

@section('content')

@include('dashboard._sidebar');

<!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <h1>
                {{ $page_title or "Page Title" }}
                <small>{{ $page_description or null }}</small>
            </h1>
            <!-- You can dynamically generate breadcrumbs here -->

            <ol class="breadcrumb">
                <li><a href="{{url('/admin')}}"><i class="fa fa-dashboard"></i> Dashboard</a></li>
                <?php $path = "/admin" ;?>
                @for($i = 2; $i <= count(Request::segments()); $i++)
                <li>
                  <?php $path = $path . "/" . Request::segment($i);?>
                  <a href="{{url($path)}}">{{ucfirst(Request::segment($i))}}</a>
                </li>
                @endfor
            </ol>
        </section>

        <!-- Main content -->
        <section class="content">
            <!-- Your Page Content Here -->
            @yield('dashcontent')
        </section><!-- /.content -->
    </div><!-- /.content-wrapper -->

@endsection
