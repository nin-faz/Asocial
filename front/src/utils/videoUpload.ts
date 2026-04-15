export async function videoUpload(file: File): Promise<string | null> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.error("Missing Cloudinary cloud name");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "asocial_videos"); // ← Change-moi dans Cloudinary si c'est différent

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("Cloudinary upload failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Video upload error:", error);
    return null;
  }
}
