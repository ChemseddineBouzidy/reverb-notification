import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { Bell, Plus, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Configuration Echo
const setupEcho = () => {
  window.Pusher = Pusher;

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
  });
};

// Interface pour une note
interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Interface pour la notification
interface NotificationData {
  note: Note;
  author: {
    id: number;
    name: string;
    email: string;
  };
  message: string;
}

// Composant principal
const NotesPage = ({ notes: initialNotes, auth }: { notes: Note[], auth: { user: any } }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: 'welcome',
    content: '  Bienvenue sur la plateforme de notes collaboratives !',
  });

  useEffect(() => {
    const echo = setupEcho();

    // Écouter les nouvelles notes
    echo.channel('notes')
      .listen('.note.created', (e: NotificationData) => {
        console.log('Nouvelle note reçue:', e);

        // Ajouter la nouvelle note à la liste
        setNotes(prevNotes => [e.note, ...prevNotes]);

        // Ajouter la notification
        setNotifications(prev => [e, ...prev]);

        // Afficher une toast notification si ce n'est pas l'utilisateur actuel
        if (e.author.id !== auth.user.id) {
          toast.success(e.message, {
            description: `${e.note.content.substring(0, 100)}...`,
            action: {
              label: "Voir",
              onClick: () => {
                const element = document.getElementById(`note-${e.note.id}`);
                element?.scrollIntoView({ behavior: 'smooth' });
              },
            },
          });
        }
      });

    return () => {
      echo.disconnect();
    };
  }, [auth.user.id]);

  const handleSubmit = () => {
    post(route('note.store'), {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
        toast.success('Note créée avec succès!');
      },
      onError: () => {
        toast.error('Erreur lors de la création de la note');
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notes collaboratives</h1>
            <p className="text-slate-600 mt-2">Partagez vos idées en temps réel</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicateur de notifications */}
            <div className="relative">
              <Bell className="h-6 w-6 text-slate-600" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {notifications.length}
                </Badge>
              )}
            </div>

            {/* Bouton ajouter note */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">

                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle note</DialogTitle>
                    <DialogDescription>
                      Partagez vos idées avec l'équipe. La notification sera envoyée en temps réel.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Titre de votre note..."
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content">Contenu</Label>
                      <Textarea
                        id="content"
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Décrivez votre idée..."
                        rows={4}
                        className={errors.content ? 'border-red-500' : ''}
                      />
                      {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                      {processing ? 'Création...' : 'Créer la note'}
                    </Button>
                  </DialogFooter>

              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total des notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{notes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Notifications reçues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Utilisateur connecté</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">{auth.user.name}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des notes */}
        <div className="grid gap-6">
          {notes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-slate-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune note</h3>
                <p className="text-slate-600 mb-6">Créez votre première note pour commencer la collaboration</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Créer une note
                </Button>
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                id={`note-${note.id}`}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${note.user?.name || 'Unknown'}`} />
                        <AvatarFallback>{getInitials(note.user?.name || 'Unknown User')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl mb-1">{note.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <User className="h-4 w-4" />
                          <span>{note.user?.name || 'Utilisateur inconnu'}</span>
                          <Calendar className="h-4 w-4 ml-2" />
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {note.user?.id === auth.user?.id && (
                      <Badge variant="secondary">Vous</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
