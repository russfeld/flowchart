<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

<!--csrf token -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<!-- CSS Files -->
@section('styles')
<link rel="stylesheet" type="text/css" href="{{ mix('css/app.css') }}">
@show

<!-- favicon -->
<link href="/favicon.ico" rel="shortcut icon">
