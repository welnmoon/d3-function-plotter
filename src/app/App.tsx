import { useEffect, useState } from "react";
import ChartSin from "../features/chart/ui/chart-sin";
import {
  applyTheme,
  getSavedTheme,
  type Theme,
} from "../shared/config/theme/theme";
import ChartTan from "../features/chart/ui/chart-tan";

export function App() {
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme() ?? "system");

  useEffect(() => {
    const cleanup = applyTheme(theme);
    return cleanup;
  }, [theme]);

  return (
    <div>
      <div style={{ position: "absolute" }}>
        <button onClick={() => setTheme("light")}>Light</button>
        <button onClick={() => setTheme("dark")}>Dark</button>
        <button onClick={() => setTheme("system")}>System</button>

        <p>current: {theme}</p>
      </div>

      <ChartSin />
      <ChartTan />
    </div>
  );
}
