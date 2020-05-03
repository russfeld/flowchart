<?php

namespace App\Events;

use App\Models\Groupsession;
use App\Events\Event;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PresenceChannel;

class GroupsessionRegister extends Event implements ShouldBroadcast
{
    use SerializesModels;

    public $id;
    public $userid;
    public $name;
    public $advisor;
    public $status;
    public $online;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Groupsession $gs)
    {
        $this->id = (int)$gs->id;
        $this->userid = (int)$gs->student->user_id;
        if(isset($gs->advisor)){
          $this->advisor = $gs->advisor->name;
        }else{
          $this->advisor = "";
        }
        $this->name = $gs->student->name;
        $this->status = (int)$gs->status;
        $this->online = 0;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('presence');
    }
}
