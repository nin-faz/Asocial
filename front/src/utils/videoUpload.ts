import { supabase } from "./supabaseClient";

// Upload a video file to Supabase Storage and return its public URL
export async function videoUpload(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `videos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (uploadError) {
    console.error("Supabase video upload error:", uploadError.message);
    return null;
  }

  const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
  if (!data.publicUrl) {
    console.error("Supabase getPublicUrl returned no URL");
    return null;
  }
  return data.publicUrl;
}
