// src/services/playlistService.ts
import axios from "axios";

export type Playlist = {
  id: number;
  nome: string;
  descricao?: string | null;
  totalItens?: number; // opcional: retornado pelo backend na lista
  createdAt?: string;
  updatedAt?: string;
};

export type PlaylistItem = {
  mediaId: number;
  ordem: number; // 0-based ou 1-based, trate no backend; aqui usamos 0-based
};

const API = "/api/Playlists";

export async function getPlaylists(): Promise<Playlist[]> {
  const { data } = await axios.get(API);
  return data;
}

export async function createPlaylist(payload: { nome: string; descricao?: string }) {
  const { data } = await axios.post(API, payload)
  return data
}

export async function updatePlaylist(id: number, payload: { nome: string; descricao?: string }): Promise<void> {
  await axios.put(`${API}/${id}`, payload);
}

export async function deletePlaylist(id: number): Promise<void> {
  await axios.delete(`${API}/${id}`);
}

export async function getPlaylistItems(id: number): Promise<PlaylistItem[]> {
  const { data } = await axios.get(`${API}/${id}/items`);
  return data;
}

export async function updatePlaylistItems(id: number, mediaIds: number[]): Promise<void> {
  await axios.put(`${API}/${id}/items`, { mediaIds });
}