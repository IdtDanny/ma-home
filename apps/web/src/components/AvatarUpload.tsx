"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { useState } from "react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  currentImage: string | null;
  onUploadComplete: (url: string) => Promise<void>;
}

export default function AvatarUpload({ currentImage, onUploadComplete }: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview / fallback */}
      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-primary-100 dark:bg-gray-700 flex items-center justify-center">
        {image ? (
          <img src={image} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-primary-700 dark:text-gray-200">
            {/* You can pass a letter prop, but here we'll show a generic icon */}
            <UserIcon className="h-10 w-10" />
          </span>
        )}
      </div>

      <UploadButton<OurFileRouter, "avatarUploader">
        endpoint="avatarUploader"
        onClientUploadComplete={async (res) => {
          if (res?.[0]?.url) {
            setImage(res[0].url);
            setUploading(false);
            await onUploadComplete(res[0].url);
            toast.success("Profile picture updated");
          }
        }}
        onUploadError={(error) => {
          setUploading(false);
          toast.error("Upload failed");
        }}
        onUploadBegin={() => setUploading(true)}
        className="ut-button:bg-primary-600 ut-button:text-white ut-button:rounded-md ut-button:px-3 ut-button:py-1.5 ut-button:text-sm"
      />
      {uploading && <p className="text-xs text-gray-500">Uploading…</p>}
    </div>
  );
}

// Simple user icon (you can use lucide)
function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
  );
}