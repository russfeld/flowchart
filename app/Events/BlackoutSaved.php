<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

use App\Models\Blackout;

class BlackoutSaved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $blackout;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Blackout $blackout)
    {
        echo "make event";
        $this->blackout = $blackout;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('blackout-saved');
    }
}
