export const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

export const initTheme = () => {
  const stored = localStorage.getItem('theme_preference') as 'light' | 'dark' | 'system' | null;
  const theme = stored || 'system';
  applyTheme(theme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme === 'system') {
      applyTheme('system');
    }
  });
};
