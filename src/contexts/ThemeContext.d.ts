declare module "@/contexts/ThemeContext" {
  export interface ThemeContextType {
    theme: string;
    toggleTheme: () => void;
  }

  export function useTheme(): ThemeContextType;
}
