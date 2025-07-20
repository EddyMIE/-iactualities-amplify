import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryLight: string;
      secondary: string;
      secondaryLight: string;
      background: string;
      backgroundLight: string;
      white: string;
      text: string;
      textLight: string;
      border: string;
      success: string;
      warning: string;
      error: string;
      glass: string;
      glassBorder: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      background: string;
      glass: string;
    };
    shadows: {
      soft: string;
      medium: string;
      strong: string;
      glow: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      round: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
      };
      fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
      };
    };
    transitions: {
      fast: string;
      medium: string;
      slow: string;
      smooth: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
  }
} 