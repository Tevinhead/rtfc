import React, { useState, useCallback, useMemo } from 'react';
import {
  AppShell,
  Text,
  Burger,
  Group,
  UnstyledButton,
  ThemeIcon,
  Box,
  rem
} from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import {
  IconUsers,
  IconCards,
  IconSwords,
  IconTrophy,
  IconSchool
} from '@tabler/icons-react';

interface NavItemProps {
  icon: JSX.Element;
  label: string;
  path: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, path, active, onClick }: NavItemProps) => (
  <UnstyledButton
    component={Link}
    to={path}
    onClick={onClick}
    style={{
      display: 'block',
      width: '100%',
      padding: rem(12),
      borderRadius: 'var(--mantine-radius-md)',
      backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: active
          ? 'rgba(99, 102, 241, 0.2)'
          : 'rgba(255, 255, 255, 0.05)',
        transform: 'translateX(4px)',
      },
    }}
  >
    <Group>
      <ThemeIcon
        variant={active ? "gradient" : "light"}
        size={36}
        gradient={active ? { from: 'indigo', to: 'purple' } : undefined}
        color={active ? undefined : "dark"}
        style={{
          transition: 'all 0.2s ease',
          backgroundColor: active ? undefined : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {icon}
      </ThemeIcon>
      <Text
        size="sm"
        c={active ? "indigo.3" : "gray.3"}
        fw={active ? 600 : 500}
        style={{
          transition: 'all 0.2s ease',
          textShadow: active ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
        }}
      >
        {label}
      </Text>
    </Group>
  </UnstyledButton>
);

export function Navigation({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const location = useLocation();

  const toggleOpened = useCallback(() => {
    setOpened(o => !o);
  }, []);

  const handleNavItemClick = useCallback(() => {
    setOpened(false);
  }, []);

  const navItems = useMemo(() => [
    { label: 'Students', icon: <IconUsers size={24} stroke={1.5} />, path: '/students' },
    { label: 'Flashcards', icon: <IconCards size={24} stroke={1.5} />, path: '/flashcards' },
    { label: 'Battle Arena', icon: <IconSwords size={24} stroke={1.5} />, path: '/arena' },
    { label: 'Leaderboard', icon: <IconTrophy size={24} stroke={1.5} />, path: '/leaderboard' },
  ], []);

  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      navbar={{
        width: { sm: 240, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header style={{
        background: 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-purple-6) 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}>
        <Group h="100%" px="xl">
          <Burger
            opened={opened}
            onClick={toggleOpened}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
          <Group gap="xs">
            <IconSchool size={30} stroke={1.5} style={{ color: 'white' }} />
            <Text
              component={Link}
              to="/"
              size="lg"
              fw={700}
              style={{
                textDecoration: 'none',
                color: 'white',
                letterSpacing: '0.5px'
              }}
            >
              Flashcard Battle Arena
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{
        background: 'linear-gradient(180deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-8) 100%)',
        borderRight: 'none',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.2)',
      }}>
        <Box py="md">
          {navItems.map((item, index) => (
            <Box key={item.label} mb={index !== navItems.length - 1 ? "xs" : 0}>
              <NavItem
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
                onClick={handleNavItemClick}
              />
            </Box>
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main style={{
        background: `
          linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-7) 100%),
          repeating-linear-gradient(45deg,
            rgba(99, 102, 241, 0.03) 0px,
            rgba(99, 102, 241, 0.03) 2px,
            transparent 2px,
            transparent 12px
          )
        `,
        color: 'var(--mantine-color-gray-0)',
      }}>
        <Box p="md" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--mantine-radius-lg)',
          backdropFilter: 'blur(8px)',
          minHeight: '100%'
        }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
