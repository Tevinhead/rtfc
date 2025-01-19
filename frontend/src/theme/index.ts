import { createTheme, MantineTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'custom',

  colors: {
    custom: [
      '#EEEEEE', // 0 - Lightest
      '#DDDDDD', // 1
      '#CCCCCC', // 2
      '#66C3C8', // 3
      '#33B6BC', // 4
      '#00ADB5', // 5 - Primary accent
      '#009199', // 6
      '#393E46', // 7 - Secondary dark
      '#2C3238', // 8
      '#222831', // 9 - Primary dark
    ],
    dark: [
      '#EEEEEE', // 0 - Light text
      '#DDDDDD', // 1
      '#CCCCCC', // 2
      '#BBBBBB', // 3
      '#393E46', // 4
      '#2C3238', // 5
      '#272B33', // 6
      '#22262D', // 7
      '#1D2026', // 8
      '#222831', // 9 - Darkest background
    ],
  },

  white: '#EEEEEE',
  black: '#222831',
  
  defaultGradient: {
    from: 'custom.5',
    to: 'custom.7',
    deg: 45,
  },

  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' },
      h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
    },
  },

  defaultRadius: 'lg',

  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'lg',
      },
      styles: (theme: MantineTheme) => ({
        root: {
          fontWeight: '600',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      }),
    },
    Card: {
      defaultProps: {
        p: 'xl',
        shadow: 'md',
        radius: 'lg',
      },
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.colors.custom[7],
          color: theme.colors.custom[0],
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows.lg,
          },
        },
      }),
    },
    AppShell: {
      styles: (theme: MantineTheme) => ({
        main: {
          backgroundColor: theme.colors.custom[9],
        },
        header: {
          background: theme.colors.custom[7],
          borderBottom: 'none',
        },
        navbar: {
          backgroundColor: theme.colors.custom[7],
          border: 'none',
          boxShadow: theme.shadows.sm,
        },
      }),
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
