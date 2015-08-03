@extends('layouts.master')

@section('title', 'Sign In')

@section('content')

<form class="form-signin" method="POST" action="/auth/register">
  {!! csrf_field() !!}
  <h2 class="form-signin-heading text-center">Create an account</h2>
  <label for="inputName" class="sr-only">Name</label>
  <input type="text" id="inputName" name="name" class="form-control" placeholder="Name" value="{{ old('name') }}" required autofocus>
  <label for="inputEmail" class="sr-only">Email address</label>
  <input type="email" id="inputEmail" name="email" class="form-control" placeholder="Email address" value="{{ old('email') }}" required>
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPassword" name="password" class="form-control" placeholder="Password" required>
  <label for="confirmPassword" class="sr-only">Confirm Password</label>
  <input type="password" id="confirmPassword" name="password_confirmation" class="form-control" placeholder="Confirm Password" required>
  <button class="btn btn-lg btn-primary btn-block" type="submit">Register</button>
</form>

@endsection
