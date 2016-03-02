<?php

namespace App\Events;

use App\Models\Groupsession;
use App\Events\Event;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class GroupsessionRegister extends Event implements ShouldBroadcast
{
    use SerializesModels;

    public $id

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Groupsession $gs)
    {
        $this->id = $gs->id;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return ['Groupsession'];
    }
}
