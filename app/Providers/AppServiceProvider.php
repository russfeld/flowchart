<?php

namespace App\Providers;

use App\Blackout;
use App\Blackoutevent;

use DateTime;
use DateInterval;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blackout::saved(function ($blackout) {
            echo $blackout;
            if($blackout->repeat_type == 1){ //daily
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = new DateTime($blackout->start);
                $end = new DateTime($blackout->end);
                $stop = new DateTime($blackout->repeat_until);
                $stop->setTime(23,59,59);
                $interval = new DateInterval("P" . $blackout->repeat_every . "D");
                while($start < $stop){
                    $blackoutevent = new Blackoutevent;
                    $blackoutevent->title = $blackout->title;
                    $blackoutevent->start = $start;
                    $blackoutevent->end = $end;
                    $blackoutevent->advisor_id = $blackout->advisor_id;
                    $blackoutevent->blackout_id = $blackout->id;
                    $blackoutevent->save();
                    $start->add($interval);
                    $end->add($interval);
                }
            }else if ($blackout->repeat_type == 2){//weekly
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = new DateTime($blackout->start);
                $end = new DateTime($blackout->end);
                $stop = new DateTime($blackout->repeat_until);
                $stop->setTime(23,59,59);
                $interval = new DateInterval("P" . ($blackout->repeat_every - 1) . "W");
                $day = new DateInterval("P1D");
                while($start < $stop){
                    $dow = $start->format('w');
                    if(strpos($blackout->repeat_detail, $dow) !== FALSE){
                        $blackoutevent = new Blackoutevent;
                        $blackoutevent->title = $blackout->title;
                        $blackoutevent->start = $start;
                        $blackoutevent->end = $end;
                        $blackoutevent->advisor_id = $blackout->advisor_id;
                        $blackoutevent->blackout_id = $blackout->id;
                        $blackoutevent->save();
                    }
                    if($dow == 6){
                        $start->add($interval);
                        $end->add($interval);
                    }
                    $start->add($day);
                    $end->add($day);
                }
            }else if ($blackout->repeat_type == 0){//no repeat
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
            }
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
