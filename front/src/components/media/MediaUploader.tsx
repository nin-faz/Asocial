import React, { useState, useRef, useCallback } from "react";
import { X, Video, Image } from "lucide-react";
import { imageUpload } from "../../utils/imageUpload";
import { videoUpload } from "../../utils/videoUpload";
import imageCompression from "browser-image-compression";

interface MediaUploaderProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  videoUrl: string | null;
  onVideoChange: (url: string | null) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  imageUrl,
  onImageChange,
  videoUrl,
  onVideoChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const processImageFile = useCallback(
    async (file: File) => {
      // Vérifiez si le fichier est une image
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide.");
        return;
      }

      // Vérifiez la taille du fichier (limite à 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          "L'image est trop grande. Veuillez sélectionner une image de moins de 5 MB."
        );
        return;
      }

      setLoading(true);
      try {
        // Redimensionnement et compression côté client
        const options = {
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.9,
          maxSizeMB: 1,
          fileType: undefined,
        };
        const compressedFile = await imageCompression(file, options);

        const webpFile = new File(
          [compressedFile],
          compressedFile.name.replace(/\.(jpe?g|png|gif)$/i, ".webp"),
          { type: "image/webp" }
        );
        const uploadedUrl = await imageUpload(webpFile);

        if (uploadedUrl) {
          onImageChange(uploadedUrl);
          // Reset video when image is added
          if (videoUrl) onVideoChange(null);
        } else {
          alert("Échec de l'envoi de l'image.");
        }
      } catch (error) {
        console.error("Erreur d'upload image:", error);
      } finally {
        setLoading(false);
      }
    },
    [onImageChange, onVideoChange, videoUrl]
  );

  const processVideoFile = useCallback(
    async (file: File) => {
      // Vérifiez si le fichier est une vidéo
      if (!file.type.startsWith("video/")) {
        alert("Veuillez sélectionner une vidéo valide.");
        return;
      }

      // Vérifiez la taille du fichier (limite à 50 MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(
          "La vidéo est trop grande. Veuillez sélectionner une vidéo de moins de 50 MB."
        );
        return;
      }

      setLoading(true);
      try {
        const uploadedUrl = await videoUpload(file);

        if (uploadedUrl) {
          onVideoChange(uploadedUrl);
          // Reset image when video is added
          if (imageUrl) onImageChange(null);
        } else {
          alert("Échec de l'envoi de la vidéo.");
        }
      } catch (error) {
        console.error("Erreur d'upload vidéo:", error);
      } finally {
        setLoading(false);
      }
    },
    [onVideoChange, onImageChange, imageUrl]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeTab === "image") {
      processImageFile(file);
    } else {
      processVideoFile(file);
    }
  };

  const handleRemoveMedia = () => {
    if (imageUrl) onImageChange(null);
    if (videoUrl) onVideoChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Gestion des événements de glisser-déposer
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];

        // Detect file type and set appropriate tab
        if (file.type.startsWith("image/")) {
          setActiveTab("image");
          processImageFile(file);
        } else if (file.type.startsWith("video/")) {
          setActiveTab("video");
          processVideoFile(file);
        }
      }
    },
    [processImageFile, processVideoFile]
  );

  // Support pour le presse-papier (coller)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab("image");
            processImageFile(file);
            break;
          }
        }
      }
    },
    [processImageFile]
  );

  return (
    <div className="mt-4 mb-4" onPaste={handlePaste}>
      <input
        type="file"
        accept={activeTab === "image" ? "image/*" : "video/*"}
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Tabs switcher */}
      {!imageUrl && !videoUrl && (
        <div className="flex mb-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center px-4 py-2 ${
              activeTab === "image"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Image className="w-4 h-4 mr-2" />
            <span>Image</span>
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center px-4 py-2 ${
              activeTab === "video"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Video className="w-4 h-4 mr-2" />
            <span>Vidéo</span>
          </button>
        </div>
      )}

      {/* Media display or upload area */}
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Article"
            className="max-h-80 rounded-lg mx-auto my-2 w-full object-contain"
          />
          <button
            onClick={handleRemoveMedia}
            className="absolute top-4 right-4 text-gray-400 hover:text-purple-400 z-10 bg-gray-900 bg-opacity-50 rounded-full p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : videoUrl ? (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className="max-h-80 rounded-lg mx-auto my-2 w-full"
            controlsList="nodownload"
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={handleRemoveMedia}
            className="absolute top-4 right-4 text-gray-400 hover:text-purple-400 z-10 bg-gray-900 bg-opacity-50 rounded-full p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div
          ref={dropAreaRef}
          onClick={handleButtonClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          tabIndex={0}
          className={`w-full border-2 border-dashed ${
            isDragging
              ? "border-purple-400 bg-gray-800 ring-2 ring-purple-500"
              : "border-purple-600"
          } rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-purple-600 animate-spin mb-2"></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : (
            <>
              {activeTab === "image" ? (
                <Image
                  className={`h-10 w-10 ${
                    isDragging ? "text-purple-400" : "text-purple-500"
                  } mb-2`}
                />
              ) : (
                <Video
                  className={`h-10 w-10 ${
                    isDragging ? "text-purple-400" : "text-purple-500"
                  } mb-2`}
                />
              )}

              <p
                className={`${
                  isDragging ? "text-purple-300" : "text-purple-500"
                } mb-2 font-medium`}
              >
                {isDragging
                  ? `Déposez ${
                      activeTab === "image" ? "l'image" : "la vidéo"
                    } ici`
                  : `Ajouter ${
                      activeTab === "image" ? "une image" : "une vidéo"
                    }`}
              </p>

              {/* Le reste du contenu n'est affiché que si on n'est pas en train de glisser */}
              {!isDragging && (
                <>
                  <p className="hidden sm:block text-gray-500 text-sm">
                    Glissez-déposez{" "}
                    {activeTab === "image" ? "une image" : "une vidéo"} ou
                    cliquez pour la sélectionner
                  </p>
                  {activeTab === "image" && (
                    <p className="hidden sm:block text-gray-500 text-xs mt-1">
                      Vous pouvez aussi copier une image ailleurs puis appuyer
                      sur Ctrl+V ici
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {activeTab === "image"
                      ? "JPG, PNG, GIF jusqu'à 5MB"
                      : "MP4, WebM jusqu'à 50MB"}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
