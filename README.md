# Media Player – Teste Técnico

Este repositório contém **3 projetos** que compõem uma aplicação de gerenciamento e reprodução de mídias (áudio/vídeo/imagem):

1. **MediaPlayer.API** – Backend em .NET + EF Core + SQLite  
2. **admin-frontend** – Painel administrativo em React + Ant Design  
3. **player-frontend** – Player em React para exibição e reprodução das mídias

---

## Tecnologias

### **MediaPlayer.API**
- .NET 6 (C#)
- ASP.NET Core
- Entity Framework Core
- **SQLite** (`Data Source=media.db`)
- Swagger

### **admin-frontend**
- React **19.1.1**
- TypeScript **5.8.3**
- Vite **7.1.0**
- Ant Design **5.26.7**
- Axios

### **player-frontend**
- React **19.1.1**
- TypeScript **5.8.3**
- Vite **7.1.0**
- Axios

---

## Banco de dados

O backend utiliza **SQLite**, armazenando os dados no arquivo `media.db`.

- Configuração no `Program.cs`:
  ```csharp
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseSqlite("Data Source=media.db"));
O arquivo é criado automaticamente na primeira execução da API, caso não exista.

Não é necessário instalar servidor de banco de dados para desenvolvimento.

Rodando o projeto (modo desenvolvimento)
Pré-requisitos
.NET 6 SDK

Node.js 20+ e npm

(Opcional) dotnet dev-certs https --trust para habilitar HTTPS local no Windows/Mac

## 1 - Subir a API

- cd MediaPlayer.API
- dotnet restore
- dotnet run --launch-profile https
- Swagger: https://localhost:7282/swagger

A API já está com CORS liberado para http://localhost:5173 (admin).
Se for usar o player localmente, libere também http://localhost:5174 no CORS.

## 2 - Rodar o Admin

cd admin-frontend
- npm install
- npm run dev
- Abre em: http://localhost:5173

## 3 - Rodar o Player

- cd player-frontend
- npm install
- npm run dev
- Abre em: http://localhost:5174

# Como usar o projeto

## 1 - Acesse a tela de Admin

<img width="1882" height="842" alt="image" src="https://github.com/user-attachments/assets/391fe573-d8b9-47f5-849d-bac376a368e0" />

## 2 - Faça o upload das mídias selecionando ou arrastando para a box de upload

<img width="1865" height="450" alt="image" src="https://github.com/user-attachments/assets/4bd8f669-cc18-4f58-9097-5d1429caa90b" />

## 3 - Acesse a página de playlists

<img width="1868" height="371" alt="image" src="https://github.com/user-attachments/assets/cbffd399-65ef-42cb-9d89-dcb37bb1c195" />

## 4 - Crie uma nova playlist com nome e descrição

<img width="1893" height="479" alt="image" src="https://github.com/user-attachments/assets/eaaae8c6-fa25-458a-929d-29dad57ab5b5" />

## 5 - Clique em Gerenciar Itens e adicione as mídias disponíveis que quiser na playlist

<img width="1868" height="722" alt="image" src="https://github.com/user-attachments/assets/cfacdef3-840b-4e67-b718-97ccf649f671" />

## 6 - Com a playlist salva, clique em Reproduzir para ser redirecionado a página do player, já reproduzindo os itens da playlist

<img width="1495" height="846" alt="image" src="https://github.com/user-attachments/assets/f2c0d4b5-2702-476d-8e86-97fd47951893" />

# Quais fases foram concluídas

- Fase 1 – CRUD de Mídias (Mínimo necessário)
- Fase 2 – Playlists e associação com mídias (Relacional) 
- Fase 3 – Player Preview com React (Visualização) 

# O que faria com mais tempo disponível

- Testes técnicos automatizados
- Criação de um sistema de usuários com autenticação
- Utilização de Docker para facilitar de rodar os projetos
- Melhorias no Frontend com relação a usabilidade
