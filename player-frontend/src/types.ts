export type Media = {
  id: string;            
  nome: string;
  descricao?: string;
  urlArquivo: string;
  tipo: string;             
};

export type PlaylistItem = {
  mediaId: string;        
  ordem: number;
};
