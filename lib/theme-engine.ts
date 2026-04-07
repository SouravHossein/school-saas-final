export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  foreground: string
  muted: string
  gradientFrom: string
  gradientTo: string
  primaryFont: string
  headingFont: string
  borderRadius: string
}

function resolveFontFamily(fontName: string): string {
  switch (fontName) {
    case 'Space Grotesk':
      return 'var(--font-space-grotesk), sans-serif'
    case 'Fraunces':
      return 'var(--font-fraunces), serif'
    case 'Manrope':
      return 'var(--font-manrope), sans-serif'
    case 'Plus Jakarta Sans':
    default:
      return 'var(--font-plus-jakarta), sans-serif'
  }
}

export function generateThemeCSS(config: ThemeConfig): string {
  return `
:root {
  --primary: ${config.primary};
  --secondary: ${config.secondary};
  --accent: ${config.accent};
  --background: ${config.background};
  --surface: ${config.surface};
  --foreground: ${config.foreground};
  --muted: ${config.muted};
  --gradient-from: ${config.gradientFrom};
  --gradient-to: ${config.gradientTo};
  --primary-font: ${resolveFontFamily(config.primaryFont)};
  --heading-font: ${resolveFontFamily(config.headingFont)};
  --border-radius: ${config.borderRadius}rem;
}

body {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--gradient-from) 38%, transparent), transparent 36%),
    radial-gradient(circle at top right, color-mix(in srgb, var(--gradient-to) 28%, transparent), transparent 32%),
    linear-gradient(180deg, color-mix(in srgb, var(--background) 86%, white), var(--background));
  color: ${config.foreground};
  font-family: var(--primary-font);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  color: ${config.foreground};
  letter-spacing: -0.03em;
}

.public-shell-card {
  background: color-mix(in srgb, var(--surface) 88%, white 12%);
  border: 1px solid color-mix(in srgb, var(--primary) 12%, white 88%);
  border-radius: calc(var(--border-radius) * 1.6);
  box-shadow: 0 24px 70px -40px rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
}

a {
  color: ${config.primary};
}

a:hover {
  opacity: 0.9;
}

button, [role="button"] {
  border-radius: calc(var(--border-radius) * 0.8);
}

.public-hero {
  background: linear-gradient(135deg, color-mix(in srgb, var(--gradient-from) 80%, white 20%), color-mix(in srgb, var(--gradient-to) 78%, white 22%));
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

.bg-surface {
  background-color: ${config.surface};
}

.text-muted {
  color: ${config.muted};
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
    typeof config.surface === 'string' &&
    typeof config.foreground === 'string' &&
    typeof config.muted === 'string' &&
    typeof config.gradientFrom === 'string' &&
    typeof config.gradientTo === 'string' &&
    typeof config.primaryFont === 'string' &&
    typeof config.headingFont === 'string' &&
    typeof config.borderRadius === 'string'
  )
}

export function parseThemeConfig(themeJson: any): ThemeConfig {
  const defaults: ThemeConfig = {
    primary: '#0066cc',
    secondary: '#22a58d',
    accent: '#f2c96d',
    background: '#f4f6fb',
    surface: '#ffffff',
    foreground: '#1f2940',
    muted: '#60708f',
    gradientFrom: '#d6e4ff',
    gradientTo: '#dff7ec',
    primaryFont: 'Plus Jakarta Sans',
    headingFont: 'Space Grotesk',
    borderRadius: '1',
  }

  if (!themeJson) return defaults

  return {
    primary: themeJson.primary || defaults.primary,
    secondary: themeJson.secondary || defaults.secondary,
    accent: themeJson.accent || defaults.accent,
    background: themeJson.background || defaults.background,
    surface: themeJson.surface || defaults.surface,
    foreground: themeJson.foreground || defaults.foreground,
    muted: themeJson.muted || defaults.muted,
    gradientFrom: themeJson.gradientFrom || defaults.gradientFrom,
    gradientTo: themeJson.gradientTo || defaults.gradientTo,
    primaryFont: themeJson.primaryFont || defaults.primaryFont,
    headingFont: themeJson.headingFont || defaults.headingFont,
    borderRadius: themeJson.borderRadius || defaults.borderRadius,
  }
}
