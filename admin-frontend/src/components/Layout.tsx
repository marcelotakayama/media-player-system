import { Layout as AntLayout, Menu, Button, Drawer, Grid } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  VideoCameraOutlined,
  OrderedListOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Header, Content } = AntLayout;

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const screens = Grid.useBreakpoint();

  // “mobile” = menor que md
  const isMobile = !screens.md;

  const items = [
    { key: "/", icon: <VideoCameraOutlined />, label: "Mídias" },
    { key: "/playlists", icon: <OrderedListOutlined />, label: "Playlists" },
  ];

  const selectedKeys = items
    .map((i) => i.key)
    .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)));

  const onMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setOpen(false);
  };

  return (
    <AntLayout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#0b3a5a",
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
            onClick={() => setOpen(true)}
          />
        )}

        <div style={{ color: "#fff", fontWeight: 700 }}>Media Player Admin</div>

        {!isMobile && (
          <Menu
            onClick={onMenuClick}
            selectedKeys={selectedKeys}
            mode="horizontal"
            theme="dark"
            items={items}
            style={{ marginLeft: "auto", background: "transparent" }}
          />
        )}
      </Header>

      <Drawer
        title="Navegação"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          onClick={onMenuClick}
          selectedKeys={selectedKeys}
          mode="inline"
          items={items}
        />
      </Drawer>

      <Content
        style={{
          margin: screens.md ? 16 : 12,
          padding: screens.md ? 24 : 16,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Outlet />
      </Content>
    </AntLayout>
  );
}
