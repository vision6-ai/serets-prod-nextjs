'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Share2, Facebook, Twitter, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PublicProfileHeaderProps {
  avatarUrl?: string | null;
  displayName: string;
  username: string;
  isOwner: boolean;
  locale: string;
}

export function PublicProfileHeader({
  avatarUrl,
  displayName,
  username,
  isOwner,
  locale,
}: PublicProfileHeaderProps) {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>(`/${locale}/profile/${username}`);
  
  // Set up URL only on client-side to prevent hydration errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileUrl(`${window.location.origin}/${locale}/profile/${username}`);
    }
  }, [locale, username]);
  
  const handleCopyLink = async () => {
    if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: 'קישור הועתק',
        description: 'קישור הפרופיל הועתק ללוח',
      });
    }
  };
  
  const handleShare = () => {
    setShareDialogOpen(true);
  };
  
  const handleSocialShare = (platform: string) => {
    if (typeof window === 'undefined') return;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Check out ${displayName}'s movie profile on Serets!`)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${displayName}'s movie profile on Serets! ${profileUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShareDialogOpen(false);
  };
  
  return (
    <div className="flex flex-col items-center gap-4 py-8 border-b mb-6">
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-4xl font-bold text-gray-700 shadow-lg border-4 border-white">
            {displayName?.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{displayName}</div>
        <div className="text-gray-500 text-sm">@{username}</div>
      </div>
      
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={handleCopyLink} size="sm" className="flex items-center gap-1">
          <Copy className="w-4 h-4" />
          העתק קישור
        </Button>
        
        <Button variant="outline" onClick={handleShare} size="sm" className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          שתף
        </Button>
        
        {isOwner && (
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Pencil className="w-4 h-4" />
            ערוך פרופיל
          </Button>
        )}
      </div>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שתף פרופיל</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleSocialShare('facebook')}
            >
              <Facebook className="h-8 w-8 text-blue-600" />
              <span>Facebook</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleSocialShare('twitter')}
            >
              <Twitter className="h-8 w-8 text-blue-400" />
              <span>Twitter</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleSocialShare('whatsapp')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.096 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.196-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>WhatsApp</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                readOnly
                value={profileUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <Button variant="secondary" size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 