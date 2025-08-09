import axios from "axios";

export interface Media {
  id: string;
  nome: string;
  descricao: string;
  urlArquivo: string;
  tipo: string;
}

const API_URL = "https://localhost:7282/api/Media";

export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string };
};

/** Busca todas as mídias */
export const fetchMedias = async (): Promise<Media[]> => {
  const { data } = await axios.get(API_URL);
  return data as Media[];
};

/**
 * Atualiza uma mídia pelo ID.
 * O backend espera o OBJETO COMPLETO no PUT, então envie todos os campos.
 */
export const updateMedia = async (media: Media): Promise<Media> => {
  const { data } = await axios.put(`${API_URL}/${media.id}`, media);
  return data as Media;
};

/** (Opcional) Excluir mídia */
export const deleteMedia = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};