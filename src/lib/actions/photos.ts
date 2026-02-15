"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "trip-photos";
const MAX_PHOTOS_PER_TRIP = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isAllowedType(type: string) {
  return ALLOWED_TYPES.includes(type);
}

/** Server action: upload one or more photos. Enforces 20/trip limit and 5MB/type server-side. */
export async function uploadTripPhotos(
  tripId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Необходимо войти в аккаунт" };

  // 1. Check current photo count (server-side limit)
  const { count: existingCount, error: countError } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("user_id", user.id);

  if (countError) return { error: countError.message };
  const current = existingCount ?? 0;

  const files = formData.getAll("files") as File[];
  if (!files.length) return { error: "Нет файлов для загрузки" }

  if (current + files.length > MAX_PHOTOS_PER_TRIP) {
    return {
      error: `Максимум ${MAX_PHOTOS_PER_TRIP} фото на поездку. Сейчас ${current}, вы пытаетесь добавить ${files.length}.`,
    };
  }

  const timestamp = Date.now();
  const prefix = `${user.id}/${tripId}`;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!(file instanceof File)) continue;

    if (file.size > MAX_FILE_SIZE) {
      return { error: `Файл «${file.name}» больше 5 МБ.` };
    }
    if (!isAllowedType(file.type)) {
      return { error: `Формат не поддерживается: ${file.name}. Разрешены JPG, PNG, WebP.` };
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${prefix}/${timestamp}_${i}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Ошибка загрузки «${file.name}»: ${uploadError.message}` };
    }

    const { error: insertError } = await supabase.from("photos").insert({
      trip_id: tripId,
      user_id: user.id,
      storage_path: storagePath,
      caption: null,
      sort_order: current + i,
    });

    if (insertError) {
      // Attempt to remove uploaded file if DB insert failed
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return { error: `Ошибка сохранения: ${insertError.message}` };
    }
  }

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
  return {};
}

/** Server action: delete one photo (Storage + DB). */
export async function deleteTripPhoto(
  photoId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Необходимо войти в аккаунт" };

  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("storage_path, trip_id")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !photo) {
    return { error: fetchError?.message ?? "Фото не найдено" };
  }

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([photo.storage_path]);

  if (removeError) {
    return { error: `Ошибка удаления файла: ${removeError.message}` };
  }

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath(`/trips/${photo.trip_id}`);
  revalidatePath("/dashboard");
  return {};
}
