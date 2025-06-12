<?php

namespace App\Events;

use App\Models\Note;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Note $note;
    public User $author;

    public function __construct(Note $note)
    {
        $this->note = $note;
        $this->author = $note->user;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notes'),
            // ou si tu veux cibler des utilisateurs spécifiques
            // new PrivateChannel('user.' . $userId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'note' => [
                'id' => $this->note->id,
                'title' => $this->note->title,
                'content' => $this->note->content,
                'created_at' => $this->note->created_at,
            ],
            'author' => [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'email' => $this->author->email,
            ],
            'message' => $this->author->name . ' a créé une nouvelle note: ' . $this->note->title
        ];
    }

    public function broadcastAs(): string
    {
        return 'note.created';
    }
}
