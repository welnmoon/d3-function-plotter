import { useEffect, useState } from "react";

import SinPage from "../pages/sin/ui/sin";
import TanPage from "../pages/tan/ui/tan";
import {
  applyTheme,
  getSavedTheme,
  type Theme,
} from "../shared/lib/theme/theme";
import { Link, Navigate, Route, Routes } from "react-router-dom";

export function App() {
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme() ?? "system");

  useEffect(() => {
    const cleanup = applyTheme(theme);
    return cleanup;
  }, [theme]);

  return (
    <div className="container">
      <div className="nav">
        <div>
          <Link className="link" to="/sin">
            Sin
          </Link>{" "}
          | <Link to="/tan">Tan</Link>
        </div>
        <div className="themeButtons">
          <button onClick={() => setTheme("light")}>Light</button>
          <button onClick={() => setTheme("dark")}>Dark</button>
          <button onClick={() => setTheme("system")}>System</button>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/sin" replace />} />
        <Route path="/sin" element={<SinPage />} />
        <Route path="/tan" element={<TanPage />} />
        <Route path="*" element={<Navigate to="/sin" replace />} />
      </Routes>
    </div>
  );
}
