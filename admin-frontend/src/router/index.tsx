import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MediaPage from '../pages/MediaPage';
import PlaylistPage from '../pages/PlaylistPage';
import Layout from '../components/Layout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MediaPage />} />
          <Route path="/playlists" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
