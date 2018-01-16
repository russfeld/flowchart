@extends('layouts.master')

@section('title', 'Home')

@section('content')

    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <div class="col-md-12">
          @include('editable.textarea', ['field' => $editables['about']])
        </div>
      </div>
    </div>

@endsection
