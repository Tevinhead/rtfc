import { createTheme, MantineTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',

  colors: {
    teal: [
      '#E6FCF5',
      '#C3FAE8',
      '#96F2D7',
      '#63E6BE',
      '#38D9A9',
      '#20C997', // primary teal
      '#12B886',
      '#0CA678',
      '#099268',
      '#087F5B',
    ],
  },

  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '2.25rem', fontWeight: '800' },
      h2: { fontSize: '1.75rem', fontWeight: '700' },
      h3: { fontSize: '1.5rem', fontWeight: '600' },
    },
  },

  defaultRadius: 'md',

  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: (theme: MantineTheme) => ({
        root: {
          fontWeight: 600,
        },
      }),
    },
    Card: {
      defaultProps: {
        p: 'lg',
        shadow: 'sm',
        radius: 'md',
      },
    },
  },
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
