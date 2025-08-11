import { Switch, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import type { ThemeMode } from "../hooks/useTheme";

type Props = {
  mode: ThemeMode;
  onChange: (m: ThemeMode) => void;
};

export default function ThemeSwitch({ mode, onChange }: Props) {
  const isDark = mode === "dark";
  return (
    <Tooltip title={isDark ? "Tema escuro" : "Tema claro"} placement="bottom">
      <Switch
        checked={isDark}
        onChange={(val) => onChange(val ? "dark" : "light")}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
      />
    </Tooltip>
  );
}
