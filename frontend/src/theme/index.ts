import { createTheme, MantineTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',

  colors: {
    indigo: [
      '#EEF2FF',
      '#E0E7FF',
      '#C7D2FE',
      '#A5B4FC',
      '#818CF8',
      '#6366F1',
      '#4F46E5',
      '#4338CA',
      '#3730A3',
      '#312E81',
    ],
    purple: [
      '#FAF5FF',
      '#F3E8FF',
      '#E9D5FF',
      '#D8B4FE',
      '#C084FC',
      '#A855F7',
      '#9333EA',
      '#7E22CE',
      '#6B21A8',
      '#581C87',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },

  white: '#FFFFFF',
  black: '#1A1B1E',
  
  defaultGradient: {
    from: 'indigo.6',
    to: 'purple.6',
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
        header: {
          background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[9]} 100%)`,
          borderBottom: 'none',
        },
        navbar: {
          backgroundColor: theme.white,
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
