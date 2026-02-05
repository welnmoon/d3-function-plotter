import { useEffect, useState } from "react";
import Chart from "../features/chart/ui/chart";
import {
  applyTheme,
  getSavedTheme,
  type Theme,
} from "../shared/config/theme/theme";

export function App() {
  const [theme, setTheme] = useState<Theme>(
    () => getSavedTheme() ?? "system",
  );

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
      <Chart />
    </div>
  );
}
