import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "./hooks/useTheme";

function Root() {
  const [mode, setMode] = useTheme();
  const isDark = mode === "dark";

  return (
    <ConfigProvider
      theme={{
        cssVar: true,
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          borderRadius: 10,
          colorBgBase: isDark ? "#1e1e1e" : "#ffffff", 
          colorBgContainer: isDark ? "#2a2a2a" : "#ffffff", 
          colorTextBase: isDark ? "#e4e4e4" : "#000000",
          colorBorder: isDark ? "#3a3a3a" : "#d9d9d9",
        },
      }}
    >

      <App themeMode={mode} onChangeTheme={setMode} />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
