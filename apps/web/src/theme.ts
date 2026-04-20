const lightThemeHref = '/themes/light.css'
const darkThemeHref = '/themes/dark.css'

const primaryPalette = {
  '--primary-color': '#F97316',
  '--primary-color-text': '#FFFFFF',
  '--primary-50': '#FFF7ED',
  '--primary-100': '#FFEDD5',
  '--primary-200': '#FED7AA',
  '--primary-300': '#FDBA74',
  '--primary-400': '#FB923C',
  '--primary-500': '#F97316',
  '--primary-600': '#EA580C',
  '--primary-700': '#C2410C',
  '--primary-800': '#9A3412',
  '--primary-900': '#7C2D12',
} as const

const ensureThemeLink = () => {
  let themeLink = document.getElementById('primevue-theme') as HTMLLinkElement | null

  if (!themeLink) {
    themeLink = document.createElement('link')
    themeLink.id = 'primevue-theme'
    themeLink.rel = 'stylesheet'
    document.head.appendChild(themeLink)
  }

  return themeLink
}

const applyPrimaryPalette = () => {
  const rootStyle = document.documentElement.style

  Object.entries(primaryPalette).forEach(([name, value]) => {
    rootStyle.setProperty(name, value)
  })
}

const ensureBrandOverrideStyle = () => {
  let overrideStyle = document.getElementById('primevue-brand-overrides') as HTMLStyleElement | null

  if (!overrideStyle) {
    overrideStyle = document.createElement('style')
    overrideStyle.id = 'primevue-brand-overrides'
    document.head.appendChild(overrideStyle)
  }

  overrideStyle.textContent = `
    .p-button:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast) {
      color: var(--primary-color-text);
      background: var(--primary-500);
      border-color: var(--primary-500);
    }

    .p-button:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):hover {
      color: var(--primary-color-text);
      background: var(--primary-600);
      border-color: var(--primary-600);
    }

    .p-button:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):active {
      color: var(--primary-color-text);
      background: var(--primary-700);
      border-color: var(--primary-700);
    }

    .p-button.p-button-outlined:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast) {
      color: var(--primary-500);
      background: transparent;
      border-color: var(--primary-500);
    }

    .p-button.p-button-outlined:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):hover {
      color: var(--primary-600);
      background: color-mix(in srgb, var(--primary-500) 10%, transparent);
      border-color: var(--primary-600);
    }

    .p-button.p-button-outlined:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):active {
      color: var(--primary-700);
      background: color-mix(in srgb, var(--primary-500) 18%, transparent);
      border-color: var(--primary-700);
    }

    .p-button.p-button-text:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast) {
      color: var(--primary-500);
      background: transparent;
      border-color: transparent;
    }

    .p-button.p-button-text:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):hover {
      color: var(--primary-600);
      background: color-mix(in srgb, var(--primary-500) 10%, transparent);
      border-color: transparent;
    }

    .p-button.p-button-text:not(.p-button-secondary):not(.p-button-success):not(.p-button-info):not(.p-button-warning):not(.p-button-help):not(.p-button-danger):not(.p-button-contrast):not(:disabled):active {
      color: var(--primary-700);
      background: color-mix(in srgb, var(--primary-500) 18%, transparent);
      border-color: transparent;
    }
  `
}

export const syncTheme = (dark: boolean) => {
  const themeLink = ensureThemeLink()
  themeLink.href = dark ? darkThemeHref : lightThemeHref
  applyPrimaryPalette()
  ensureBrandOverrideStyle()
}

export const getInitialThemeState = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return savedTheme ? savedTheme === 'dark' : prefersDark
}