import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";

const uploadResponseSchema = z.object({
  url: z.string().min(1),
});

/** Uploads a file to the backend (Cloudinary). Returns the public `url` for use as payment proof. */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const raw = await apiClient.postFormData("/upload", formData);
  const parsed = uploadResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid upload response from server", raw);
  }
  return parsed.data.url;
}
