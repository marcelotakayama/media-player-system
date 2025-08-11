import axios from "axios";

export type Playlist = {
  id: string;                
  nome: string;
  descricao?: string | null; 
  exibirNoPlayer?: boolean;
  totalItens?: number;
};

const API = "/api/Playlists";

export async function getPlaylists(): Promise<Playlist[] | { items?: Playlist[]; data?: Playlist[] }> {
  const { data } = await axios.get(API);
  return data;
}

export async function createPlaylist(payload: { nome: string; descricao?: string; exibirNoPlayer?: boolean }): Promise<Playlist> {
  const { data } = await axios.post(API, payload);
  return data;
}

export async function updatePlaylist(id: string, payload: { nome: string; descricao?: string; exibirNoPlayer?: boolean }): Promise<void> {
  await axios.put(`${API}/${id}`, payload);
}

export async function deletePlaylist(id: string): Promise<void> {
  await axios.delete(`${API}/${id}`);
}

export async function getPlaylistItems(id: string): Promise<Array<{ mediaId: string; ordem: number }>> {
  const { data } = await axios.get(`${API}/${id}/items`);
  return data;
}

export async function updatePlaylistItems(id: string, mediaIds: string[]): Promise<void> {
  await axios.put(`${API}/${id}/items`, { mediaIds });
}
