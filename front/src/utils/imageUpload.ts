const API_KEY = "f0b08049fc173fd14f6483b221f9f9e9";

export async function imageUpload(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    console.error("Upload failed", await response.text());
    return null;
  }

  const data = await response.json();

  return data.data.url;
}
