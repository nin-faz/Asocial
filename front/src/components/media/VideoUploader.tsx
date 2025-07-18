import React, { useState, useRef } from "react";
import { videoUpload } from "../utils/videoUpload";
import { X } from "lucide-react";

interface VideoUploaderProps {
  videoUrl: string | null;
  onVideoChange: (url: string | null) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl,
  onVideoChange,
}) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await videoUpload(file);
      if (url) onVideoChange(url);
      else alert("Échec de l'envoi de la vidéo.");
    } catch (error) {
      console.error("Erreur d'upload vidéo :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onVideoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-4 mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />

      {videoUrl ? (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className="max-h-80 rounded-lg mx-auto my-2 w-full"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 text-gray-400 hover:text-purple-400 z-10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-purple-600 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-800 cursor-pointer"
        >
          {loading ? (
            <p className="text-purple-400">Chargement vidéo...</p>
          ) : (
            <p className="text-purple-500">Ajouter une vidéo</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
