<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
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
        $this->info('PostDeploy routine complete!');
    }
}
