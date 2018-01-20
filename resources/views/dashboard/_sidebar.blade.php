<!-- Left side column. contains the sidebar -->
<aside class="main-sidebar">

    <!-- sidebar: style can be found in sidebar.less -->
    <section class="sidebar">

        <!-- Sidebar user panel (optional) -->
        <div class="user-panel">
            <div class="pull-left image">
                <img src="{{ url(Auth::user()->advisor->pic) }}" class="img-circle" alt="User Image" />
            </div>
            <div class="pull-left info">
                <p>{{ Auth::user()->advisor->name}}</p>
            </div>
        </div>

        <!-- search form (Optional) -->
        <!--
        <form action="#" method="get" class="sidebar-form">
            <div class="input-group">
                <input type="text" name="q" class="form-control" placeholder="Search..."/>
                  <span class="input-group-btn">
                    <button type='submit' name='search' id='search-btn' class="btn btn-flat"><i class="fa fa-search"></i></button>
                  </span>
            </div>
        </form>
        -->
        <!-- /.search form -->

        <!-- Sidebar Menu -->
        <ul class="sidebar-menu" data-widget="tree">
            <li class="header">ADMIN DASHBOARD</li>
            <!-- Optionally, you can add icons to the links -->
            <li class="{{ Request::is('admin') ? 'active' : '' }}"><a href="{{ url('/admin') }}"><span>Home</span></a></li>
            <!--<li><a href="#"><span>Management</span></a></li>-->
            @if(Request::is('admin/students*') || Request::is('admin/departments*') || Request::is('admin/advisors*'))
            <li class="treeview active">
            @else
            <li class="treeview">
            @endif
                <a href="#"><span>Manage People</span> <i class="fa fa-angle-left pull-right"></i></a>
                <ul class="treeview-menu">
                    <li class="{{ Request::is('admin/students*') ? 'active' : '' }}" ><a href="{{ url('/admin/students') }}">Students</a></li>
                    <li class="{{ Request::is('admin/advisors*') ? 'active' : '' }}" ><a href="{{ url('/admin/advisors') }}">Advisors</a></li>
                    <li class="{{ Request::is('admin/departments*') ? 'active' : '' }}" ><a href="{{ url('/admin/departments') }}">Departments</a></li>
                </ul>
            </li>
            @if(Request::is('admin/blackouts*') || Request::is('admin/groupsessions*') || Request::is('admin/meetings*'))
            <li class="treeview active">
            @else
            <li class="treeview">
            @endif
                <a href="#"><span>Manage Scheduler</span> <i class="fa fa-angle-left pull-right"></i></a>
                <ul class="treeview-menu">
                    <li class="{{ Request::is('admin/meetings*') ? 'active' : '' }}" ><a href="{{ url('/admin/meetings') }}">Meetings</a></li>
                    <li class="{{ Request::is('admin/blackouts*') ? 'active' : '' }}" ><a href="{{ url('/admin/blackouts') }}">Blackouts</a></li>
                    <li class="{{ Request::is('admin/groupsessions*') ? 'active' : '' }}" ><a href="{{ url('/admin/groupsessions') }}">Groupsessions</a></li>
                </ul>
            </li>
            @if(Request::is('admin/degreeprograms*') || Request::is('admin/completedcourses*') || Request::is('admin/plans*') || Request::is('admin/electivelists*'))
            <li class="treeview active">
            @else
            <li class="treeview">
            @endif
                <a href="#"><span>Manage Flowcharts</span> <i class="fa fa-angle-left pull-right"></i></a>
                <ul class="treeview-menu">
                    <li class="{{ Request::is('admin/degreeprograms*') ? 'active' : '' }}" ><a href="{{ url('/admin/degreeprograms') }}">Degree Programs</a></li>
                    <li class="{{ Request::is('admin/electivelists*') ? 'active' : '' }}" ><a href="{{ url('/admin/electivelists') }}">Elective Lists</a></li>
                    <li class="{{ Request::is('admin/plans*') ? 'active' : '' }}" ><a href="{{ url('/admin/plans') }}">Plans</a></li>
                    <li class="{{ Request::is('admin/completedcourses*') ? 'active' : '' }}" ><a href="{{ url('/admin/completedcourses') }}">Completed Courses</a></li>
                </ul>
            </li>
            <li class="{{ Request::is('admin/settings*') ? 'active' : '' }}"><a href="{{ url('/admin/settings') }}"><span>Settings</span></a></li>
        </ul><!-- /.sidebar-menu -->
    </section>
    <!-- /.sidebar -->
</aside>
