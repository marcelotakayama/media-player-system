import api from "./http";
import type { Media, PlaylistItem } from "../types";

function inferKind(url: string, raw?: any): "image" | "video" | "audio" | "other" {
  const val = String(raw ?? "").toLowerCase();

  if (val.includes("image")) return "image";
  if (val.includes("video")) return "video";
  if (val.includes("audio")) return "audio";

  let ext = "";
  try {
    const u = new URL(url, window.location.origin);
    const p = u.pathname.toLowerCase();
    ext = p.split(".").pop() || "";
  } catch {
  }

  const imageExt = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]);
  const videoExt = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);
  const audioExt = new Set(["mp3", "wav", "aac", "ogg", "m4a", "flac"]);

  if (imageExt.has(ext)) return "image";
  if (videoExt.has(ext)) return "video";
  if (audioExt.has(ext)) return "audio";

  // Heurísticas simples por nomes em PT
  if (val.includes("imagem") || val.includes("foto")) return "image";
  if (val.includes("vídeo") || val.includes("video")) return "video";
  if (val.includes("áudio") || val.includes("audio")) return "audio";

  return "other";
}

export async function fetchMedias(): Promise<Media[]> {
  const { data } = await api.get("/Media");
  return (data || []).map((m: any) => {
    const kind = inferKind(m.urlArquivo, m.tipo);
    return {
      id: String(m.id),
      nome: m.nome,
      descricao: m.descricao,
      urlArquivo: m.urlArquivo,
      tipo: kind,
    } as Media;
  });
}

export async function getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  const { data } = await api.get(`/Playlists/${playlistId}/items`);
  return (data || []).map((it: any) => ({
    mediaId: String(it.mediaId),
    ordem: Number(it.ordem ?? 0),
  })) as PlaylistItem[];
}
