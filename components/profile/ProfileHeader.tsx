import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface ProfileHeaderProps {
  avatarUrl?: string;
  displayName: string;
  username: string;
  isOwner?: boolean;
  onEdit?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  displayName,
  username,
  isOwner = false,
  onEdit,
}) => {
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `/u/${username}`;

  const handleShare = async () => {
    await navigator.clipboard.writeText(profileUrl);
    // Optionally show a toast/snackbar here
    alert('קישור לפרופיל הועתק!');
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
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
        <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 rounded-full px-4 py-2">
          <Copy className="w-4 h-4" />
          שתף פרופיל
        </Button>
        {isOwner && (
          <Button onClick={onEdit} className="rounded-full px-4 py-2 font-medium bg-black text-white hover:bg-gray-900">
            ערוך פרופיל
          </Button>
        )}
      </div>
    </div>
  );
}; 