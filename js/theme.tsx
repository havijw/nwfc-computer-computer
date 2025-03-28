import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

declare module "@mui/material/styles" {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

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
