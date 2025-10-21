import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Eye, Plus, Heart, UserPlus, Save, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';

export default function Social() {
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Fetch social feed from API - GET /api/social/feed
  const mockPosts = [
    {
      id: 1,
      user: { id: 1, name: 'María García', avatar: null, username: '@mariafit' },
      content: '¡Nuevo PR en sentadilla! 120kg x 5 💪',
      likes: 45,
      comments: 12,
      timestamp: 'Hace 2 horas',
    },
    {
      id: 2,
      user: { id: 2, name: 'Carlos López', avatar: null, username: '@carlosfit' },
      content: 'Completada mi rutina de hoy. ¡8 semanas de consistencia! 🔥',
      likes: 32,
      comments: 8,
      timestamp: 'Hace 4 horas',
    },
  ];

  const handlePublishPost = () => {
    // TODO: Create post via API - POST /api/social/posts
    console.log('Publishing post:', postContent);
    setPostContent('');
    setPublishModalOpen(false);
  };

  const handleLike = (postId: number) => {
    // TODO: Like post via API - POST /api/social/posts/:postId/like
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const handleFollow = (userId: number) => {
    // TODO: Follow user via API - POST /api/social/users/:userId/follow
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter(id => id !== userId));
    } else {
      setFollowedUsers([...followedUsers, userId]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Red Social Interna</h1>
            <p className="text-slate-600 dark:text-slate-400">Conecta con la comunidad GymPal</p>
          </div>
          <Button 
            onClick={() => setPublishModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar publicaciones, usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-md"
          />
        </div>

        {/* Feed */}
        <div>
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <Card key={post.id} className="glass-card border-pink-200 dark:border-pink-500/30 card-gradient-pink hover-lift shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.user.avatar || undefined} />
                        <AvatarFallback className="bg-pink-500 text-white">
                          {post.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-slate-900 dark:text-white text-base">{post.user.name}</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">{post.user.username} • {post.timestamp}</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFollow(post.user.id)}
                      className={followedUsers.includes(post.user.id) ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-500'}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {followedUsers.includes(post.user.id) ? 'Siguiendo' : 'Seguir'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900 dark:text-white mb-4">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLike(post.id)}
                      className={likedPosts.includes(post.id) ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${likedPosts.includes(post.id) ? 'fill-pink-500' : ''}`} />
                      {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                      {post.comments} comentarios
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Publish Post Modal */}
        <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Crear Publicación</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Comparte tu progreso con la comunidad
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="¿Qué quieres compartir?"
                className="min-h-[200px] bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Añadir Imagen
                </Button>
                <Button 
                  onClick={handlePublishPost} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!postContent.trim()}
                >
                  Publicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
