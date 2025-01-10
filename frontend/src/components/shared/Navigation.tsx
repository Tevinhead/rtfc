import React, { useState, useCallback, useMemo } from 'react';
import { 
  AppShell,
  Text,
  Burger,
  Group,
  UnstyledButton,
  ThemeIcon,
  Box
} from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

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
      padding: '8px',
      borderRadius: '4px',
      backgroundColor: active ? 'var(--mantine-color-blue-light)' : 'transparent',
      '&:hover': {
        backgroundColor: active 
          ? 'var(--mantine-color-blue-light)' 
          : 'var(--mantine-color-gray-0)',
      },
    }}
  >
    <Group>
      <ThemeIcon 
        variant={active ? "filled" : "light"} 
        size={30}
        color={active ? "blue" : "gray"}
      >
        {icon}
      </ThemeIcon>
      <Text 
        size="sm" 
        c={active ? "blue" : "dark"}
        fw={active ? 600 : 400}
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
    { label: 'Students', icon: '👥', path: '/students' },
    { label: 'Flashcards', icon: '🃏', path: '/flashcards' },
    { label: 'Battle Arena', icon: '⚔️', path: '/arena' },
  ], []);

  return (
    <AppShell
      header={{ height: { base: 50, md: 70 } }}
      navbar={{
        width: { sm: 200, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggleOpened}
            hiddenFrom="sm"
            size="sm"
          />
          <Text 
            component={Link} 
            to="/" 
            size="lg" 
            fw={700}
            style={{ 
              textDecoration: 'none', 
              color: 'inherit' 
            }}
          >
            Flashcard Battle Arena
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={<Text>{item.icon}</Text>}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              onClick={handleNavItemClick}
            />
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
