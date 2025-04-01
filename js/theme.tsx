import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

/** Theme for the app. */
const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  typography: {
    button: {
      textTransform: "none",
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },
});

/** Theme provider that uses the app's theme. */
export default function AppTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
