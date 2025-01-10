import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Custom color palette for the app
    blue: [
      '#E6F7FF', // 0
      '#BAE7FF', // 1
      '#91D5FF', // 2
      '#69C0FF', // 3
      '#40A9FF', // 4
      '#1890FF', // 5 - Primary
      '#096DD9', // 6
      '#0050B3', // 7
      '#003A8C', // 8
      '#002766', // 9
    ],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '2.5rem' },
      h2: { fontSize: '2rem' },
      h3: { fontSize: '1.75rem' },
      h4: { fontSize: '1.5rem' },
      h5: { fontSize: '1.25rem' },
      h6: { fontSize: '1rem' },
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'lg',
      },
    },
  },
  defaultRadius: 'md',
  // Custom theme properties for the battle arena
  other: {
    battleArena: {
      cardElevation: 3,
      animationDuration: 300,
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
    },
  },
});

// Type for custom theme to be used with useTheme hook
declare module '@mantine/core' {
  export interface MantineThemeOther {
    battleArena: {
      cardElevation: number;
      animationDuration: number;
      spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
    };
  }
}
