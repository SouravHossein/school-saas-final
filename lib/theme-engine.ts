export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  primaryFont: string
  headingFont: string
  borderRadius: string
}

export function generateThemeCSS(config: ThemeConfig): string {
  return `
:root {
  --primary: ${config.primary};
  --secondary: ${config.secondary};
  --accent: ${config.accent};
  --background: ${config.background};
  --foreground: ${config.foreground};
  --primary-font: '${config.primaryFont}', sans-serif;
  --heading-font: '${config.headingFont}', sans-serif;
  --border-radius: ${config.borderRadius}rem;
}

* {
  --tw-ring-color: ${config.primary};
}

html {
  color-scheme: light;
}

body {
  background-color: ${config.background};
  color: ${config.foreground};
  font-family: var(--primary-font);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  color: ${config.foreground};
}

a {
  color: ${config.primary};
}

a:hover {
  opacity: 0.9;
}

button, [role="button"] {
  border-radius: calc(var(--border-radius) * 0.5);
  background-color: ${config.primary};
  color: white;
}

button:hover, [role="button"]:hover {
  opacity: 0.9;
}

.bg-primary {
  background-color: ${config.primary};
}

.text-primary {
  color: ${config.primary};
}

.border-primary {
  border-color: ${config.primary};
}

.bg-secondary {
  background-color: ${config.secondary};
}

.text-secondary {
  color: ${config.secondary};
}

.bg-accent {
  background-color: ${config.accent};
}

.text-accent {
  color: ${config.accent};
}

.rounded {
  border-radius: var(--border-radius);
}
  `
}

export function validateThemeConfig(config: any): config is ThemeConfig {
  return (
    config &&
    typeof config.primary === 'string' &&
    typeof config.secondary === 'string' &&
    typeof config.accent === 'string' &&
    typeof config.background === 'string' &&
    typeof config.foreground === 'string' &&
    typeof config.primaryFont === 'string' &&
    typeof config.headingFont === 'string' &&
    typeof config.borderRadius === 'string'
  )
}

export function parseThemeConfig(themeJson: any): ThemeConfig {
  const defaults: ThemeConfig = {
    primary: '#0066cc',
    secondary: '#0066cc',
    accent: '#0066cc',
    background: '#ffffff',
    foreground: '#1a1a1a',
    primaryFont: 'Inter',
    headingFont: 'Inter',
    borderRadius: '0.5',
  }

  if (!themeJson) return defaults

  return {
    primary: themeJson.primary || defaults.primary,
    secondary: themeJson.secondary || defaults.secondary,
    accent: themeJson.accent || defaults.accent,
    background: themeJson.background || defaults.background,
    foreground: themeJson.foreground || defaults.foreground,
    primaryFont: themeJson.primaryFont || defaults.primaryFont,
    headingFont: themeJson.headingFont || defaults.headingFont,
    borderRadius: themeJson.borderRadius || defaults.borderRadius,
  }
}
