import { useState } from 'react';
import { Plus, Palette, Users, Tag, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePublishRoom } from '@/hooks/useRoomPublish';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import type { RoomSceneConfig } from '@/types/rooms';

const ROOM_COLORS = [
  { name: 'Dark Purple', value: '#1a1a2e' },
  { name: 'Deep Blue', value: '#0f3460' },
  { name: 'Forest', value: '#1a3a1a' },
  { name: 'Sunset', value: '#4a1a3a' },
  { name: 'Ocean', value: '#1a2a4a' },
  { name: 'Midnight', value: '#0a0a0f' },
];

const ROOM_TYPES = [
  { value: 'lobby', label: 'Lobby', description: 'Open space for casual hangouts' },
  { value: 'meeting', label: 'Meeting', description: 'Formal meeting space' },
  { value: 'social', label: 'Social', description: 'Social gathering area' },
  { value: 'workspace', label: 'Workspace', description: 'Collaborative work area' },
];

const SUGGESTED_TAGS = [
  'social', 'gaming', 'work', 'education', 'music', 'art', 'tech', 'nostr',
];

export function CreateRoomDialog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { mutate: publishRoom, isPending: isPublishing } = usePublishRoom();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [roomType, setRoomType] = useState<'lobby' | 'meeting' | 'social' | 'workspace'>('social');
  const [maxUsers, setMaxUsers] = useState(20);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const handleAddTag = (tag: string) => {
    if (selectedTags.includes(tag)) return;
    if (selectedTags.length >= 5) {
      toast({ title: 'Maximum 5 tags allowed', variant: 'destructive' });
      return;
    }
    setSelectedTags([...selectedTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleCustomTagAdd = () => {
    if (!customTag.trim()) return;
    handleAddTag(customTag.trim());
    setCustomTag('');
  };

  const handleSubmit = () => {
    if (!user) {
      toast({ title: 'Please log in to create a room', variant: 'destructive' });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const scene: RoomSceneConfig = {
      backgroundColor,
      maxUsers,
      isPublic: true,
      roomType,
    };

    publishRoom(
      {
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        scene,
        tags: selectedTags,
      },
      {
        onSuccess: (data) => {
          toast({ title: 'Room created successfully! 🎉' });
          setOpen(false);
          navigate(`/room/${encodeURIComponent(data.roomId)}`);
        },
        onError: (error) => {
          toast({
            title: 'Failed to create room',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-5 w-5" />
          Create Room
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Create Your Space</DialogTitle>
          <DialogDescription className="text-gray-400">
            Design a virtual room where people can gather and connect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Room Name *</Label>
              <Input
                id="title"
                placeholder="My Awesome Space"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this space is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1.5 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-white">
                <Image className="mr-1 inline h-4 w-4" />
                Cover Image URL (optional)
              </Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1.5 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Scene Configuration */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-white">
              <Palette className="h-4 w-4" />
              Scene Settings
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType" className="text-white">Room Type</Label>
                <Select value={roomType} onValueChange={(v: any) => setRoomType(v)}>
                  <SelectTrigger id="roomType" className="mt-1.5 bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-400">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxUsers" className="text-white">
                  <Users className="mr-1 inline h-4 w-4" />
                  Max Users
                </Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="2"
                  max="100"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value) || 20)}
                  className="mt-1.5 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Background Color</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ROOM_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setBackgroundColor(color.value)}
                    className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      backgroundColor === color.value
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-white">
              <Tag className="h-4 w-4" />
              Tags (optional)
            </h4>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'hover:bg-purple-600/30'
                  }`}
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCustomTagAdd}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-600/20 text-purple-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPublishing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isPublishing ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
