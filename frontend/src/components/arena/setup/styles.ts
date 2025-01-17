import { MantineTheme } from '@mantine/core';

export const containerStyles = (theme: MantineTheme) => ({
  root: {
    borderRadius: theme.radius.xl,
    background: `linear-gradient(165deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[9]} 100%)`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`,
    border: `1px solid ${theme.colors.dark[4]}`,
    position: 'relative' as const,
    overflow: 'hidden'
  }
});

export const paperStyles = (theme: MantineTheme) => ({
  root: {
    background: `linear-gradient(165deg, rgba(25, 26, 30, 0.8) 0%, rgba(15, 16, 20, 0.9) 100%)`,
    backdropFilter: 'blur(16px)',
    border: `1px solid rgba(149, 97, 255, 0.2)`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)`,
    position: 'relative' as const,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at top right, rgba(120, 100, 255, 0.1), transparent 70%)',
      pointerEvents: 'none'
    }
  }
});

export const inputStyles = (theme: MantineTheme) => ({
  label: {
    color: theme.white,
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
    marginBottom: theme.spacing.xs
  },
  input: {
    fontSize: theme.fontSizes.md,
    background: theme.colors.dark[7],
    border: `1px solid ${theme.colors.dark[4]}`,
    color: theme.white,
    '&:focus': {
      borderColor: theme.colors.violet[5]
    }
  },
  item: {
    '&[data-selected]': {
      '&, &:hover': {
        backgroundColor: theme.colors.violet[9],
        color: theme.white
      }
    }
  }
});

export const buttonStyles = (theme: MantineTheme) => ({
  root: {
    height: 56,
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    boxShadow: theme.shadows.md,
    '&:hover': {
      boxShadow: theme.shadows.lg
    }
  }
});

export const playerCardStyles = (theme: MantineTheme, isSelected: boolean) => ({
  root: {
    backgroundColor: isSelected ? theme.colors.dark[6] : theme.colors.dark[7],
    borderColor: isSelected ? theme.colors.violet[5] : theme.colors.dark[4],
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows.lg
    }
  }
});