<?php

namespace App\Events;

use App\Models\Groupsession;
use App\Events\Event;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class GroupsessionRegister extends Event implements ShouldBroadcast
{
    use SerializesModels;

    public $id;
    public $userid;
    public $name;
    public $advisor;
    public $status;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Groupsession $gs)
    {
        $this->id = $gs->id;
        $this->userid = $gs->student->user_id;
        if($gs->advsior_id > 0){
          $this->advisor = $gs->advisor->name;
        }else{
          $this->advisor = "";
        }
        $this->name = $gs->student->name;
        $this->status = $gs->status;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return ['groupsession'];
    }
}
