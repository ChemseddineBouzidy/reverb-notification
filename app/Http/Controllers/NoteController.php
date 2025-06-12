<?php

namespace App\Http\Controllers;

use App\Events\NoteCreated;
use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note = Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'user_id' => auth()->id(),
        ]);

        // Déclencher l'event pour la notification temps réel
        broadcast(new NoteCreated($note))->toOthers();

        // return response()->json([
        //     'message' => 'Note créée avec succès',
        //     'note' => $note->load('user')
        // ]);
        return redirect()->route('note.index')->with('success', 'Note créée avec succès');
    }

    public function index()
    {
        $notes = Note::with('user')->latest()->get();

        return Inertia::render('Notes/Index', [
            'notes' => $notes
        ]);
    }
}



