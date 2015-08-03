@extends('layouts.master')

@section('title', 'Sign In')

@section('content')

<form class="form-signin" method="POST" action="/auth/login">
  {!! csrf_field() !!}
  <h2 class="form-signin-heading text-center">Please sign in</h2>
  <label for="inputEmail" class="sr-only">Email address</label>
  <input type="email" id="inputEmail" name="email" class="form-control" placeholder="Email address" required autofocus>
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPassword" name="password" class="form-control" placeholder="Password" required>
  <div class="checkbox">
    <label>
      <input type="checkbox" value="remember-me" name="remember"> Remember me
    </label>
  </div>
  <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
</form>

@endsection