const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function imageUpload(file: File): Promise<string | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    console.error("Upload failed", await response.text());
    return null;
  }

  const data = await response.json();
  return data.url;
}
