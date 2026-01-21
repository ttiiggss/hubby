import { Sparkles, Zap, Globe, Users } from 'lucide-react';
import { useSeoMeta } from '@unhead/react';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { useRooms } from '@/hooks/useRooms';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const Index = () => {
  const { user } = useCurrentUser();
  const { data: rooms = [], isLoading } = useRooms();

  console.log('Index render:', { user: user?.pubkey, roomsCount: rooms.length, isLoading });

  useSeoMeta({
    title: 'Nostr-Space - 3D Social Rooms on Nostr',
    description: 'Explore and create virtual spaces where people gather, chat, and share experiences on decentralized web.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-purple-500/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-blue-600/10 blur-3xl" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-600/20 px-4 py-2 text-sm text-purple-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Decentralized 3D Spaces</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Connect in{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                3D Spaces
              </span>
            </h1>

            <p className="mb-8 text-xl text-gray-300 sm:text-2xl">
              Create immersive rooms where people gather, chat, and share experiences on decentralized web.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <CreateRoomDialog />
              ) : (
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap className="h-5 w-5" />
                  Get Started
                </Button>
              )}

              <LoginArea className="min-w-[200px]" />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20">
                  <Globe className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Decentralized</h3>
                <p className="text-sm text-gray-400">
                  Built on Nostr, ensuring your data and connections remain in your control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Social</h3>
                <p className="text-sm text-gray-400">
                  Join public rooms, meet new people, and build communities together.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600/20">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Immersive</h3>
                <p className="text-sm text-gray-400">
                  Experience social interactions in beautiful 3D environments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Browse Rooms Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Explore Rooms</h2>
            <p className="mt-2 text-gray-400">
              Discover spaces created by Nostr community
            </p>
          </div>

          {user && <CreateRoomDialog />}
        </div>

        <RoomGrid rooms={rooms} isLoading={isLoading} />
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="border-t border-purple-500/20">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to Create?</h2>
            <p className="mb-8 text-xl text-gray-300">
              Join Nostr-Space community and start building your own virtual rooms.
            </p>
            <div className="flex justify-center gap-4">
              <LoginArea />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-gray-400">
            Built with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Shakespeare
            </a>
            {' '}and powered by Nostr
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
