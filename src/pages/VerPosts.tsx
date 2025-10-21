import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export default function VerPosts() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // TODO: Fetch posts from API - GET /api/social/posts
  const mockPosts = [
    { id: 1, user: 'María García', username: '@mariafit', content: '¡Nuevo PR en sentadilla! 120kg x 5 💪', likes: 45, comments: 12 },
    { id: 2, user: 'Carlos López', username: '@carlosfit', content: 'Completada mi rutina de hoy. ¡8 semanas de consistencia! 🔥', likes: 32, comments: 8 },
    { id: 3, user: 'Ana Martínez', username: '@anafit', content: 'Mi transformación de 6 meses 💯', likes: 89, comments: 24 },
  ];

  const handleLike = (postId: number) => {
    // TODO: Like post via API - POST /api/social/posts/:postId/like
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-white mb-2">Feed de Publicaciones</h1>
          <p className="text-slate-400">Explora el contenido de la comunidad</p>
        </div>

        <div className="space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-pink-500 text-white">{post.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white">{post.user}</p>
                    <p className="text-slate-400 text-sm">{post.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">{post.content}</p>
                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLike(post.id)}
                    className={likedPosts.includes(post.id) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${likedPosts.includes(post.id) ? 'fill-pink-500' : ''}`} />
                    {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
