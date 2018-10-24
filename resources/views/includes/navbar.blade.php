<!-- Fixed navbar -->
    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="{{ url('/') }}">K-State Engineering</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            @if(DbConfig::get('navbar_showcourses') === true)
              <li class="{{ Request::is('courses*') ? 'active' : '' }}"><a href="{{ url('/courses') }}">Courses</a></li>
            @endif
            @if(DbConfig::get('navbar_showflowcharts') === true)
              <li class="{{ Request::is('flowcharts*') ? 'active' : '' }}"><a href="{{ url('/flowcharts') }}">Flowcharts</a></li>
            @endif
            <li class="{{ Request::is('advising*') ? 'active' : '' }}"><a href="{{ url('/advising') }}">Advising</a></li>
            @if(DbConfig::get('navbar_showgroupsession') === true)
              <li class="{{ Request::is('groupsession*') ? 'active' : '' }}"><a href="{{ url('/groupsession') }}">Group Advising</a></li>
            @endif
            <li class="{{ Request::is('help*') ? 'active' : '' }}"><a href="{{ url('/help') }}">Help</a></li>
            @if( Auth::check() && Auth::user()->is_advisor )
            <li class="{{ Request::is('admin*') ? 'active' : '' }}"><a href="{{ url('/admin') }}">Admin</a></li>
            @endif
          </ul>
        @if( Auth::check())
          <ul class="nav navbar-nav navbar-right">
              <li><a href="{{ url('/profile') }}"><i class="fa fa-user" aria-hidden="true"></i> {{ Auth::user()->eid }}</a></li>
              <li><p class="navbar-btn">
                <a href="{{ url('auth/logout') }}" class="btn btn-success"><i class="fa fa-sign-out" aria-hidden="true"></i> Logout</a>
              </p></li>
          </ul>
        @else
          <ul class="nav navbar-nav navbar-right">
              <li><p class="navbar-btn">
                <a href="{{ url('auth/login') }}" class="btn btn-success"><i class="fa fa-sign-in" aria-hidden="true"></i> Sign in</a>
              </p></li>
          </ul>
        @endif
        </div><!--/.nav-collapse -->
      </div>
    </nav>
