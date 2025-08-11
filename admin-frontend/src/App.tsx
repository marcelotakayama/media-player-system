//import React from "react";
import { Layout, Menu } from "antd";
import { VideoCameraOutlined, PictureOutlined, PlaySquareOutlined } from "@ant-design/icons";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import ThemeSwitch from "./components/ThemeSwitch";
import type { ThemeMode } from "./hooks/useTheme";

import PlaylistPage from "./pages/PlaylistPage";
import MediaPage from "./pages/MediaPage";

const { Header, Content } = Layout;

type Props = {
  themeMode: ThemeMode;
  onChangeTheme: (m: ThemeMode) => void;
};

function Shell({ themeMode, onChangeTheme }: Props) {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith("/medias") ? "medias" : "playlists";

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--ant-color-bg-base)" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 16,
          background: "var(--ant-color-bg-container)",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <PlaySquareOutlined style={{ fontSize: 18 }} />
          <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>🛠️ Admin</div>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            disabledOverflow
            style={{
              marginLeft: 16,
              background: "transparent",
              borderBottom: "none",
              flex: 1,
              minWidth: 0,
            }}
            items={[
              { key: "playlists", icon: <VideoCameraOutlined />, label: <Link to="/playlists">Playlists</Link> },
              { key: "medias", icon: <PictureOutlined />, label: <Link to="/medias">Mídias</Link> },
            ]}
          />
        </div>

        <ThemeSwitch mode={themeMode} onChange={onChangeTheme} />
      </Header>

      <Content style={{ padding: 16, background: "var(--ant-color-bg-base)" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/playlists" replace />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/medias" element={<MediaPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default function App(props: Props) {
  return (
    <BrowserRouter>
      <Shell {...props} />
    </BrowserRouter>
  );
}
