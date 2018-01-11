<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Editable;
use DbConfig;

class PostDeploy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deploy:post';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Post Deploy Actions';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->info('PostDeploy routine beginning...');
        $settings = array("groupsessionenabled", "showmessage", "navbar_showcourses", "navbar_showflowcharts", "navbar_showgroupsession");
        $bar = $this->output->createProgressBar(count($settings));
        foreach($settings as $setting){
          if(!DbConfig::has($setting)){
            DbConfig::store($setting, false);
          }
          $bar->advance();
        }
        $bar->finish();
        $this->line('');

        //ADD EDITABLES TO App/Providers/ComposerServiceProvider AS WELL!

        $editables = Editable::where('controller', 'GroupsessionController')->where('action', 'getIndex')->where('key', 'head')->where('version', 0)->get();
        if($editables->count() == 0){
          $editable = new Editable;
          $editable->controller = "GroupsessionController";
          $editable->action = "getIndex";
          $editable->key = "head";
          $editable->version = 0;
          $editable->user_id = 1;
          $editable->contents= "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 bg-light-purple rounded'>
	<h3 class='top-header text-center'>Group Advising</h3>
</div>

<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>
  <p>The CS department holding group advising sessions as part of Fall 2018 enrollment. Please plan to attend the appropriate session from the list below. All group advising sessions will be held in Fiedler Auditorium (DUF 1107).</p>

  <ul>
    <li><b>Juniors/seniors (60+ hours already finished):</b> Wednesday, March 9, 6:00-9:00 pm</li>
    <li><b>Freshmen/sophomores with last name A-M:</b> Wednesday, March 23, 6:00-9:00 pm</li>
    <li><b>Freshmen/sophomores with last name N-Z:</b> Wednesday, March 30, 6:00-9:00 pm</li>
  </ul>

  <p>At the group session, you will meet with an advisor on a first-come, first-serve basis. The advisor will approve your schedule for the next semester and lift your advising flag.</p><p>

  </p><p>After your group advising session, you will still need to enroll in KSIS. You can look up your enrollment time in your KSIS Student Center under “Enrollment Dates”.  This is the first day and time when you are eligible to enroll. Please note that enrollment dates are staggered by number of hours: seniors may enroll as early as March 21, but freshmen may not enroll until April 15.</p>

  <p>If you have additional questions or are unable to make ANY of the listed group advising times, then you may schedule an individual appointment with your advisor. However, these individual times will be limited.<br></p>

  <div class='panel panel-primary'>
    <div class='panel-heading'>
      Make sure you have the following available, either on paper or electronically, <b>before</b> you check in:
    </div>
    <div class='panel-body'>
      <ul>
        <li>A copy of your DARS report (<a href='http://www.k-state.edu/ksis/help/students/stuViewDARS.html'>Instructions</a>)</li>
        <li>A proposed schedule for the next semester.
          <ul>
            <li>When planning your schedule, you should consult both your DARS report and your current CS flowchart (<a href='https://flowcharts.engg.ksu.edu/'>Engineering Flowchart Site</a>)</li>
            <li>Pay attention to which CS courses are marked as Fall-only or Spring-only in the flowchart.</li>
           </ul></li>
          </ul>
         <p><b>Students who do not have a DARS report and proposed schedule will not be seen by an advisor until these steps are completed</b></p>
     </div>
   </div>
</div>";
          $editable->save();
        }

        $this->info('PostDeploy routine complete!');
    }
}
