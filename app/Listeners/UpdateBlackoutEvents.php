<?php

namespace App\Listeners;

use App\Events\BlackoutSaved;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\Blackout;
use App\Models\Blackoutevent;
use App\Models\Meeting;

use DateTime;
use DateInterval;

class UpdateBlackoutEvents
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  BlackoutSaved  $event
     * @return void
     */
    public function handle(BlackoutSaved $event)
    {
      $blackout = $event->blackout;
      if($blackout->repeat_type == 1){ //daily
          Blackoutevent::where('blackout_id', $blackout->id)->delete();
          $start = $blackout->start;
          $end = $blackout->end;
          $stop = $blackout->repeat_until;
          $stop->hour(23)->minute(59)->second(59);
          while($start < $stop){
              $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $start)->where('start', '<', $end)->get();
              foreach($collisions as $meeting){
                  $meeting->conflict = true;
                  $meeting->save();
              }
              $blackoutevent = new Blackoutevent;
              $blackoutevent->title = $blackout->title;
              $blackoutevent->start = $start;
              $blackoutevent->end = $end;
              $blackoutevent->advisor_id = $blackout->advisor_id;
              $blackoutevent->blackout_id = $blackout->id;
              $blackoutevent->repeat = true;
              $blackoutevent->save();
              $start->addDays($blackout->repeat_every);
              $end->addDays($blackout->repeat_every);
          }
      }else if ($blackout->repeat_type == 2){//weekly
          Blackoutevent::where('blackout_id', $blackout->id)->delete();
          $start = $blackout->start;
          $end = $blackout->end;
          $stop = $blackout->repeat_until;
          $stop->hour(23)->minute(59)->second(59);
          $interval = new DateInterval("P" . ($blackout->repeat_every - 1) . "W");
          $day = new DateInterval("P1D");
          while($start < $stop){
              $dow = $start->format('w');
              if(strpos($blackout->repeat_detail, $dow) !== FALSE){
                  $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $start)->where('start', '<', $end)->get();
                  foreach($collisions as $meeting){
                      $meeting->conflict = true;
                      $meeting->save();
                  }
                  $blackoutevent = new Blackoutevent;
                  $blackoutevent->title = $blackout->title;
                  $blackoutevent->start = $start;
                  $blackoutevent->end = $end;
                  $blackoutevent->advisor_id = $blackout->advisor_id;
                  $blackoutevent->blackout_id = $blackout->id;
                  $blackoutevent->repeat = true;
                  $blackoutevent->save();
              }
              if($dow == 6){
                  $start->addWeeks($blackout->repeat_every - 1);
                  $end->addWeeks($blackout->repeat_every - 1);
              }
              $start->addDay();
              $end->addDay();
          }
      }else if ($blackout->repeat_type == 0){//no repeat
          Blackoutevent::where('blackout_id', $blackout->id)->delete();
          $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $blackout->start)->where('start', '<', $blackout->end)->get();
          foreach($collisions as $meeting){
              $meeting->conflict = true;
              $meeting->save();
          }
          $blackoutevent = new Blackoutevent;
          $blackoutevent->title = $blackout->title;
          $blackoutevent->start = $blackout->start;
          $blackoutevent->end = $blackout->end;
          $blackoutevent->advisor_id = $blackout->advisor_id;
          $blackoutevent->blackout_id = $blackout->id;
          $blackoutevent->repeat = false;
          $blackoutevent->save();
      }
    }

    protected $events = [
      'saved' => BlackoutSaved::class,
    ];
}
