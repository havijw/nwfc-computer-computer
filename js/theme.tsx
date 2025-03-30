import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

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

export default function AppTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
