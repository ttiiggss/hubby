import { useState } from 'react';
import { Plus, Palette, Users, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
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

const SUGGESTED_TAGS = ['social', 'gaming', 'work', 'education', 'music', 'art', 'tech', 'nostr'];

export function CreateRoomDialog() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [roomType, setRoomType] = useState('social');
  const [maxUsers, setMaxUsers] = useState(20);
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = (tag: string) => {
    if (tags.includes(tag)) return;
    if (tags.length >= 5) {
      toast({ title: 'Maximum 5 tags allowed', variant: 'destructive' });
      return;
    }
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
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

    const roomTags = [...tags];

    toast({ title: 'Room created successfully!', variant: 'default' });
    setOpen(false);
    setTitle('');
    setDescription('');
    setImage('');
    setBackgroundColor('#1a1a2e');
    setRoomType('social');
    setMaxUsers(20);
    setTags([]);

    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-5 w-5" />
          Create Room
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Create Your Space</DialogTitle>
          <DialogDescription className="text-gray-400">
            Design a virtual room where people can gather, chat, and share experiences on decentralized web.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-white block mb-2">Room Name</label>
              <Input
                placeholder="My Awesome Space"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white block mb-2">Description</label>
              <Textarea
                placeholder="Describe what this space is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white block mb-2">Room Type</label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.description}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white block mb-2">Background Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROOM_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBackgroundColor(color.value)}
                      className={`h-12 w-full rounded-lg border-2 transition-all hover:scale-105 ${
                        backgroundColor === color.value
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-white block mb-2">Tags (optional)</label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      tags.includes(tag)
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
