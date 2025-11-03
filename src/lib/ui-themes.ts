/**
 * UI Theme System
 * Comprehensive theme configurations for the entire application
 */

export type UITheme = 
  | 'modern-dark-slate'
  | 'modern-dark-midnight'
  | 'modern-dark-carbon'
  | 'modern-dark-obsidian'
  | 'classic-light-pure'
  | 'classic-light-warm'
  | 'classic-light-cool'
  | 'classic-light-soft'
  | 'ultra-modern-neon'
  | 'ultra-modern-glass'
  | 'ultra-modern-vibrant'
  | 'ultra-modern-minimal'
  | 'hybrid-sunset'
  | 'hybrid-ocean'
  | 'hybrid-forest'
  | 'hybrid-lavender'
  | 'pro-motu-dark'
  | 'pro-motu-light'
  | 'pro-synth-green';

export interface UIThemeConfig {
  name: string;
  description: string;
  category: 'Modern Dark' | 'Classic Light' | 'Ultra Modern' | 'Hybrid' | 'Professional';
  preview: {
    background: string;
    primary: string;
    secondary: string;
  };
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export const UI_THEMES: Record<UITheme, UIThemeConfig> = {
  // ==================== MODERN DARK THEMES ====================
  'modern-dark-slate': {
    name: 'Modern Dark - Slate',
    description: 'Deep slate with cool undertones',
    category: 'Modern Dark',
    preview: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      primary: '#60a5fa',
      secondary: '#94a3b8'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0 0)',
        '--foreground': 'oklch(0.145 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.145 0 0)',
        '--primary': 'oklch(0.488 0.243 264.376)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--secondary': 'oklch(0.95 0.006 264.53)',
        '--secondary-foreground': 'oklch(0.205 0 0)',
        '--muted': 'oklch(0.96 0.006 264.53)',
        '--muted-foreground': 'oklch(0.508 0 0)',
        '--accent': 'oklch(0.94 0.006 264.53)',
        '--accent-foreground': 'oklch(0.205 0 0)',
        '--border': 'oklch(0.88 0.006 264.53)',
        '--input': 'oklch(0.88 0.006 264.53)',
        '--ring': 'oklch(0.488 0.243 264.376)'
      },
      dark: {
        '--background': 'oklch(0.145 0.012 264.376)',
        '--foreground': 'oklch(0.94 0.006 264.53)',
        '--card': 'oklch(0.165 0.012 264.376)',
        '--card-foreground': 'oklch(0.94 0.006 264.53)',
        '--primary': 'oklch(0.696 0.17 264.376)',
        '--primary-foreground': 'oklch(0.145 0.012 264.376)',
        '--secondary': 'oklch(0.269 0.012 264.376)',
        '--secondary-foreground': 'oklch(0.94 0.006 264.53)',
        '--muted': 'oklch(0.235 0.012 264.376)',
        '--muted-foreground': 'oklch(0.658 0.006 264.53)',
        '--accent': 'oklch(0.288 0.012 264.376)',
        '--accent-foreground': 'oklch(0.94 0.006 264.53)',
        '--border': 'oklch(0.269 0.012 264.376)',
        '--input': 'oklch(0.269 0.012 264.376)',
        '--ring': 'oklch(0.696 0.17 264.376)'
      }
    }
  },

  'modern-dark-midnight': {
    name: 'Modern Dark - Midnight',
    description: 'Deep midnight blue atmosphere',
    category: 'Modern Dark',
    preview: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #0c0a2e 100%)',
      primary: '#818cf8',
      secondary: '#a5b4fc'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.002 264.376)',
        '--foreground': 'oklch(0.145 0.02 264.376)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.145 0.02 264.376)',
        '--primary': 'oklch(0.569 0.243 264.376)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--secondary': 'oklch(0.85 0.08 264.376)',
        '--secondary-foreground': 'oklch(0.145 0.02 264.376)',
        '--muted': 'oklch(0.95 0.02 264.376)',
        '--muted-foreground': 'oklch(0.508 0.02 264.376)',
        '--accent': 'oklch(0.92 0.04 264.376)',
        '--accent-foreground': 'oklch(0.145 0.02 264.376)',
        '--border': 'oklch(0.88 0.02 264.376)',
        '--input': 'oklch(0.88 0.02 264.376)',
        '--ring': 'oklch(0.569 0.243 264.376)'
      },
      dark: {
        '--background': 'oklch(0.125 0.04 264.376)',
        '--foreground': 'oklch(0.92 0.02 264.376)',
        '--card': 'oklch(0.155 0.04 264.376)',
        '--card-foreground': 'oklch(0.92 0.02 264.376)',
        '--primary': 'oklch(0.7 0.2 264.376)',
        '--primary-foreground': 'oklch(0.125 0.04 264.376)',
        '--secondary': 'oklch(0.25 0.04 264.376)',
        '--secondary-foreground': 'oklch(0.92 0.02 264.376)',
        '--muted': 'oklch(0.22 0.04 264.376)',
        '--muted-foreground': 'oklch(0.64 0.02 264.376)',
        '--accent': 'oklch(0.27 0.06 264.376)',
        '--accent-foreground': 'oklch(0.92 0.02 264.376)',
        '--border': 'oklch(0.25 0.04 264.376)',
        '--input': 'oklch(0.25 0.04 264.376)',
        '--ring': 'oklch(0.7 0.2 264.376)'
      }
    }
  },

  'modern-dark-carbon': {
    name: 'Modern Dark - Carbon',
    description: 'Professional carbon black',
    category: 'Modern Dark',
    preview: {
      background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
      primary: '#a1a1aa',
      secondary: '#71717a'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.99 0 0)',
        '--foreground': 'oklch(0.09 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.09 0 0)',
        '--primary': 'oklch(0.09 0 0)',
        '--primary-foreground': 'oklch(0.99 0 0)',
        '--secondary': 'oklch(0.96 0 0)',
        '--secondary-foreground': 'oklch(0.09 0 0)',
        '--muted': 'oklch(0.96 0 0)',
        '--muted-foreground': 'oklch(0.46 0 0)',
        '--accent': 'oklch(0.96 0 0)',
        '--accent-foreground': 'oklch(0.09 0 0)',
        '--border': 'oklch(0.90 0 0)',
        '--input': 'oklch(0.90 0 0)',
        '--ring': 'oklch(0.24 0 0)'
      },
      dark: {
        '--background': 'oklch(0.09 0 0)',
        '--foreground': 'oklch(0.98 0 0)',
        '--card': 'oklch(0.11 0 0)',
        '--card-foreground': 'oklch(0.98 0 0)',
        '--primary': 'oklch(0.98 0 0)',
        '--primary-foreground': 'oklch(0.09 0 0)',
        '--secondary': 'oklch(0.27 0 0)',
        '--secondary-foreground': 'oklch(0.98 0 0)',
        '--muted': 'oklch(0.27 0 0)',
        '--muted-foreground': 'oklch(0.66 0 0)',
        '--accent': 'oklch(0.27 0 0)',
        '--accent-foreground': 'oklch(0.98 0 0)',
        '--border': 'oklch(0.27 0 0)',
        '--input': 'oklch(0.27 0 0)',
        '--ring': 'oklch(0.51 0 0)'
      }
    }
  },

  'modern-dark-obsidian': {
    name: 'Modern Dark - Obsidian',
    description: 'Rich obsidian with purple hints',
    category: 'Modern Dark',
    preview: {
      background: 'linear-gradient(135deg, #2d1b69 0%, #1a0f3d 100%)',
      primary: '#c084fc',
      secondary: '#a78bfa'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.01 300)',
        '--foreground': 'oklch(0.145 0.03 300)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.145 0.03 300)',
        '--primary': 'oklch(0.539 0.243 303.9)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--secondary': 'oklch(0.92 0.04 303.9)',
        '--secondary-foreground': 'oklch(0.145 0.03 300)',
        '--muted': 'oklch(0.95 0.02 300)',
        '--muted-foreground': 'oklch(0.508 0.02 300)',
        '--accent': 'oklch(0.92 0.04 303.9)',
        '--accent-foreground': 'oklch(0.145 0.03 300)',
        '--border': 'oklch(0.88 0.02 300)',
        '--input': 'oklch(0.88 0.02 300)',
        '--ring': 'oklch(0.539 0.243 303.9)'
      },
      dark: {
        '--background': 'oklch(0.13 0.04 303.9)',
        '--foreground': 'oklch(0.92 0.02 303.9)',
        '--card': 'oklch(0.16 0.04 303.9)',
        '--card-foreground': 'oklch(0.92 0.02 303.9)',
        '--primary': 'oklch(0.75 0.2 303.9)',
        '--primary-foreground': 'oklch(0.13 0.04 303.9)',
        '--secondary': 'oklch(0.26 0.04 303.9)',
        '--secondary-foreground': 'oklch(0.92 0.02 303.9)',
        '--muted': 'oklch(0.23 0.04 303.9)',
        '--muted-foreground': 'oklch(0.65 0.02 303.9)',
        '--accent': 'oklch(0.28 0.06 303.9)',
        '--accent-foreground': 'oklch(0.92 0.02 303.9)',
        '--border': 'oklch(0.26 0.04 303.9)',
        '--input': 'oklch(0.26 0.04 303.9)',
        '--ring': 'oklch(0.75 0.2 303.9)'
      }
    }
  },

  // ==================== CLASSIC LIGHT THEMES ====================
  'classic-light-pure': {
    name: 'Classic Light - Pure',
    description: 'Clean pure white with subtle grays',
    category: 'Classic Light',
    preview: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      primary: '#0f172a',
      secondary: '#64748b'
    },
    cssVars: {
      light: {
        '--background': 'oklch(1 0 0)',
        '--foreground': 'oklch(0.09 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.09 0 0)',
        '--primary': 'oklch(0.145 0.015 264.376)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--secondary': 'oklch(0.97 0.005 264.376)',
        '--secondary-foreground': 'oklch(0.145 0.015 264.376)',
        '--muted': 'oklch(0.97 0.005 264.376)',
        '--muted-foreground': 'oklch(0.458 0.01 264.376)',
        '--accent': 'oklch(0.96 0.005 264.376)',
        '--accent-foreground': 'oklch(0.145 0.015 264.376)',
        '--border': 'oklch(0.92 0.005 264.376)',
        '--input': 'oklch(0.92 0.005 264.376)',
        '--ring': 'oklch(0.145 0.015 264.376)'
      },
      dark: {
        '--background': 'oklch(0.145 0 0)',
        '--foreground': 'oklch(0.985 0 0)',
        '--card': 'oklch(0.145 0 0)',
        '--card-foreground': 'oklch(0.985 0 0)',
        '--primary': 'oklch(0.985 0 0)',
        '--primary-foreground': 'oklch(0.205 0 0)',
        '--secondary': 'oklch(0.269 0 0)',
        '--secondary-foreground': 'oklch(0.985 0 0)',
        '--muted': 'oklch(0.269 0 0)',
        '--muted-foreground': 'oklch(0.708 0 0)',
        '--accent': 'oklch(0.269 0 0)',
        '--accent-foreground': 'oklch(0.985 0 0)',
        '--border': 'oklch(0.269 0 0)',
        '--input': 'oklch(0.269 0 0)',
        '--ring': 'oklch(0.439 0 0)'
      }
    }
  },

  'classic-light-warm': {
    name: 'Classic Light - Warm',
    description: 'Warm beige tones for comfort',
    category: 'Classic Light',
    preview: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
      primary: '#92400e',
      secondary: '#d97706'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.975 0.015 85)',
        '--foreground': 'oklch(0.25 0.05 60)',
        '--card': 'oklch(0.99 0.01 85)',
        '--card-foreground': 'oklch(0.25 0.05 60)',
        '--primary': 'oklch(0.45 0.15 60)',
        '--primary-foreground': 'oklch(0.99 0.01 85)',
        '--secondary': 'oklch(0.94 0.025 85)',
        '--secondary-foreground': 'oklch(0.25 0.05 60)',
        '--muted': 'oklch(0.94 0.025 85)',
        '--muted-foreground': 'oklch(0.50 0.03 60)',
        '--accent': 'oklch(0.92 0.04 70)',
        '--accent-foreground': 'oklch(0.25 0.05 60)',
        '--border': 'oklch(0.88 0.03 80)',
        '--input': 'oklch(0.88 0.03 80)',
        '--ring': 'oklch(0.646 0.222 60)'
      },
      dark: {
        '--background': 'oklch(0.18 0.02 60)',
        '--foreground': 'oklch(0.95 0.015 85)',
        '--card': 'oklch(0.20 0.02 60)',
        '--card-foreground': 'oklch(0.95 0.015 85)',
        '--primary': 'oklch(0.75 0.15 70)',
        '--primary-foreground': 'oklch(0.18 0.02 60)',
        '--secondary': 'oklch(0.30 0.025 60)',
        '--secondary-foreground': 'oklch(0.95 0.015 85)',
        '--muted': 'oklch(0.28 0.02 60)',
        '--muted-foreground': 'oklch(0.68 0.015 85)',
        '--accent': 'oklch(0.32 0.04 70)',
        '--accent-foreground': 'oklch(0.95 0.015 85)',
        '--border': 'oklch(0.30 0.025 60)',
        '--input': 'oklch(0.30 0.025 60)',
        '--ring': 'oklch(0.75 0.15 70)'
      }
    }
  },

  'classic-light-cool': {
    name: 'Classic Light - Cool',
    description: 'Cool blue-gray palette',
    category: 'Classic Light',
    preview: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)',
      primary: '#1e40af',
      secondary: '#3b82f6'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.97 0.01 240)',
        '--foreground': 'oklch(0.20 0.03 240)',
        '--card': 'oklch(0.99 0.005 240)',
        '--card-foreground': 'oklch(0.20 0.03 240)',
        '--primary': 'oklch(0.42 0.18 264.376)',
        '--primary-foreground': 'oklch(0.99 0.005 240)',
        '--secondary': 'oklch(0.94 0.015 240)',
        '--secondary-foreground': 'oklch(0.20 0.03 240)',
        '--muted': 'oklch(0.94 0.015 240)',
        '--muted-foreground': 'oklch(0.48 0.02 240)',
        '--accent': 'oklch(0.92 0.025 240)',
        '--accent-foreground': 'oklch(0.20 0.03 240)',
        '--border': 'oklch(0.88 0.02 240)',
        '--input': 'oklch(0.88 0.02 240)',
        '--ring': 'oklch(0.55 0.243 264.376)'
      },
      dark: {
        '--background': 'oklch(0.16 0.015 240)',
        '--foreground': 'oklch(0.94 0.01 240)',
        '--card': 'oklch(0.18 0.015 240)',
        '--card-foreground': 'oklch(0.94 0.01 240)',
        '--primary': 'oklch(0.65 0.22 264.376)',
        '--primary-foreground': 'oklch(0.16 0.015 240)',
        '--secondary': 'oklch(0.28 0.02 240)',
        '--secondary-foreground': 'oklch(0.94 0.01 240)',
        '--muted': 'oklch(0.26 0.015 240)',
        '--muted-foreground': 'oklch(0.66 0.01 240)',
        '--accent': 'oklch(0.30 0.03 240)',
        '--accent-foreground': 'oklch(0.94 0.01 240)',
        '--border': 'oklch(0.28 0.02 240)',
        '--input': 'oklch(0.28 0.02 240)',
        '--ring': 'oklch(0.65 0.22 264.376)'
      }
    }
  },

  'classic-light-soft': {
    name: 'Classic Light - Soft',
    description: 'Gentle pastels for easy viewing',
    category: 'Classic Light',
    preview: {
      background: 'linear-gradient(135deg, #fce7f3 0%, #fdf4ff 100%)',
      primary: '#9333ea',
      secondary: '#c084fc'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.97 0.015 320)',
        '--foreground': 'oklch(0.22 0.04 320)',
        '--card': 'oklch(0.99 0.01 320)',
        '--card-foreground': 'oklch(0.22 0.04 320)',
        '--primary': 'oklch(0.50 0.24 303.9)',
        '--primary-foreground': 'oklch(0.99 0.01 320)',
        '--secondary': 'oklch(0.94 0.02 320)',
        '--secondary-foreground': 'oklch(0.22 0.04 320)',
        '--muted': 'oklch(0.94 0.02 320)',
        '--muted-foreground': 'oklch(0.50 0.025 320)',
        '--accent': 'oklch(0.92 0.04 320)',
        '--accent-foreground': 'oklch(0.22 0.04 320)',
        '--border': 'oklch(0.88 0.03 320)',
        '--input': 'oklch(0.88 0.03 320)',
        '--ring': 'oklch(0.627 0.265 303.9)'
      },
      dark: {
        '--background': 'oklch(0.17 0.02 320)',
        '--foreground': 'oklch(0.94 0.015 320)',
        '--card': 'oklch(0.19 0.02 320)',
        '--card-foreground': 'oklch(0.94 0.015 320)',
        '--primary': 'oklch(0.72 0.22 303.9)',
        '--primary-foreground': 'oklch(0.17 0.02 320)',
        '--secondary': 'oklch(0.29 0.025 320)',
        '--secondary-foreground': 'oklch(0.94 0.015 320)',
        '--muted': 'oklch(0.27 0.02 320)',
        '--muted-foreground': 'oklch(0.67 0.015 320)',
        '--accent': 'oklch(0.31 0.04 320)',
        '--accent-foreground': 'oklch(0.94 0.015 320)',
        '--border': 'oklch(0.29 0.025 320)',
        '--input': 'oklch(0.29 0.025 320)',
        '--ring': 'oklch(0.72 0.22 303.9)'
      }
    }
  },

  // ==================== ULTRA MODERN THEMES ====================
  'ultra-modern-neon': {
    name: 'Ultra Modern - Neon',
    description: 'Bold neon accents on dark',
    category: 'Ultra Modern',
    preview: {
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      primary: '#00ff88',
      secondary: '#00d4ff'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.01 180)',
        '--foreground': 'oklch(0.10 0.02 180)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.10 0.02 180)',
        '--primary': 'oklch(0.75 0.25 162.48)',
        '--primary-foreground': 'oklch(0.10 0.02 180)',
        '--secondary': 'oklch(0.70 0.20 195)',
        '--secondary-foreground': 'oklch(0.10 0.02 180)',
        '--muted': 'oklch(0.95 0.01 180)',
        '--muted-foreground': 'oklch(0.48 0.02 180)',
        '--accent': 'oklch(0.92 0.15 162.48)',
        '--accent-foreground': 'oklch(0.10 0.02 180)',
        '--border': 'oklch(0.88 0.02 180)',
        '--input': 'oklch(0.88 0.02 180)',
        '--ring': 'oklch(0.75 0.25 162.48)'
      },
      dark: {
        '--background': 'oklch(0.08 0.01 240)',
        '--foreground': 'oklch(0.95 0.01 180)',
        '--card': 'oklch(0.10 0.01 240)',
        '--card-foreground': 'oklch(0.95 0.01 180)',
        '--primary': 'oklch(0.82 0.28 162.48)',
        '--primary-foreground': 'oklch(0.08 0.01 240)',
        '--secondary': 'oklch(0.75 0.22 195)',
        '--secondary-foreground': 'oklch(0.08 0.01 240)',
        '--muted': 'oklch(0.20 0.01 240)',
        '--muted-foreground': 'oklch(0.68 0.01 180)',
        '--accent': 'oklch(0.25 0.05 162.48)',
        '--accent-foreground': 'oklch(0.95 0.01 180)',
        '--border': 'oklch(0.22 0.02 240)',
        '--input': 'oklch(0.22 0.02 240)',
        '--ring': 'oklch(0.82 0.28 162.48)'
      }
    }
  },

  'ultra-modern-glass': {
    name: 'Ultra Modern - Glass',
    description: 'Translucent glassmorphism effect',
    category: 'Ultra Modern',
    preview: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      primary: '#6366f1',
      secondary: '#8b5cf6'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.985 0.002 264.376)',
        '--foreground': 'oklch(0.20 0.01 264.376)',
        '--card': 'oklch(0.995 0.001 264.376)',
        '--card-foreground': 'oklch(0.20 0.01 264.376)',
        '--primary': 'oklch(0.55 0.24 264.376)',
        '--primary-foreground': 'oklch(0.995 0.001 264.376)',
        '--secondary': 'oklch(0.55 0.24 303.9)',
        '--secondary-foreground': 'oklch(0.995 0.001 264.376)',
        '--muted': 'oklch(0.965 0.005 264.376)',
        '--muted-foreground': 'oklch(0.50 0.01 264.376)',
        '--accent': 'oklch(0.95 0.01 264.376)',
        '--accent-foreground': 'oklch(0.20 0.01 264.376)',
        '--border': 'oklch(0.90 0.01 264.376)',
        '--input': 'oklch(0.90 0.01 264.376)',
        '--ring': 'oklch(0.55 0.24 264.376)'
      },
      dark: {
        '--background': 'oklch(0.12 0.015 264.376)',
        '--foreground': 'oklch(0.95 0.005 264.376)',
        '--card': 'oklch(0.14 0.015 264.376)',
        '--card-foreground': 'oklch(0.95 0.005 264.376)',
        '--primary': 'oklch(0.65 0.24 264.376)',
        '--primary-foreground': 'oklch(0.12 0.015 264.376)',
        '--secondary': 'oklch(0.65 0.24 303.9)',
        '--secondary-foreground': 'oklch(0.12 0.015 264.376)',
        '--muted': 'oklch(0.24 0.015 264.376)',
        '--muted-foreground': 'oklch(0.68 0.005 264.376)',
        '--accent': 'oklch(0.28 0.02 264.376)',
        '--accent-foreground': 'oklch(0.95 0.005 264.376)',
        '--border': 'oklch(0.26 0.015 264.376)',
        '--input': 'oklch(0.26 0.015 264.376)',
        '--ring': 'oklch(0.65 0.24 264.376)'
      }
    }
  },

  'ultra-modern-vibrant': {
    name: 'Ultra Modern - Vibrant',
    description: 'High contrast vibrant colors',
    category: 'Ultra Modern',
    preview: {
      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      primary: '#f43f5e',
      secondary: '#06b6d4'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.99 0 0)',
        '--foreground': 'oklch(0.10 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.10 0 0)',
        '--primary': 'oklch(0.58 0.24 355)',
        '--primary-foreground': 'oklch(1 0 0)',
        '--secondary': 'oklch(0.68 0.18 200)',
        '--secondary-foreground': 'oklch(0.10 0 0)',
        '--muted': 'oklch(0.96 0.01 355)',
        '--muted-foreground': 'oklch(0.48 0.02 355)',
        '--accent': 'oklch(0.92 0.08 330)',
        '--accent-foreground': 'oklch(0.10 0 0)',
        '--border': 'oklch(0.88 0.04 355)',
        '--input': 'oklch(0.88 0.04 355)',
        '--ring': 'oklch(0.58 0.24 355)'
      },
      dark: {
        '--background': 'oklch(0.10 0.02 355)',
        '--foreground': 'oklch(0.96 0.01 355)',
        '--card': 'oklch(0.13 0.02 355)',
        '--card-foreground': 'oklch(0.96 0.01 355)',
        '--primary': 'oklch(0.68 0.26 355)',
        '--primary-foreground': 'oklch(0.10 0.02 355)',
        '--secondary': 'oklch(0.72 0.20 200)',
        '--secondary-foreground': 'oklch(0.10 0.02 355)',
        '--muted': 'oklch(0.24 0.03 355)',
        '--muted-foreground': 'oklch(0.68 0.01 355)',
        '--accent': 'oklch(0.30 0.10 330)',
        '--accent-foreground': 'oklch(0.96 0.01 355)',
        '--border': 'oklch(0.26 0.04 355)',
        '--input': 'oklch(0.26 0.04 355)',
        '--ring': 'oklch(0.68 0.26 355)'
      }
    }
  },

  'ultra-modern-minimal': {
    name: 'Ultra Modern - Minimal',
    description: 'Pure minimal black and white',
    category: 'Ultra Modern',
    preview: {
      background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
      primary: '#000000',
      secondary: '#737373'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.995 0 0)',
        '--foreground': 'oklch(0.05 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.05 0 0)',
        '--primary': 'oklch(0.05 0 0)',
        '--primary-foreground': 'oklch(1 0 0)',
        '--secondary': 'oklch(0.975 0 0)',
        '--secondary-foreground': 'oklch(0.05 0 0)',
        '--muted': 'oklch(0.97 0 0)',
        '--muted-foreground': 'oklch(0.45 0 0)',
        '--accent': 'oklch(0.96 0 0)',
        '--accent-foreground': 'oklch(0.05 0 0)',
        '--border': 'oklch(0.92 0 0)',
        '--input': 'oklch(0.92 0 0)',
        '--ring': 'oklch(0.20 0 0)'
      },
      dark: {
        '--background': 'oklch(0.05 0 0)',
        '--foreground': 'oklch(0.995 0 0)',
        '--card': 'oklch(0.07 0 0)',
        '--card-foreground': 'oklch(0.995 0 0)',
        '--primary': 'oklch(0.995 0 0)',
        '--primary-foreground': 'oklch(0.05 0 0)',
        '--secondary': 'oklch(0.25 0 0)',
        '--secondary-foreground': 'oklch(0.995 0 0)',
        '--muted': 'oklch(0.25 0 0)',
        '--muted-foreground': 'oklch(0.65 0 0)',
        '--accent': 'oklch(0.28 0 0)',
        '--accent-foreground': 'oklch(0.995 0 0)',
        '--border': 'oklch(0.25 0 0)',
        '--input': 'oklch(0.25 0 0)',
        '--ring': 'oklch(0.50 0 0)'
      }
    }
  },

  // ==================== HYBRID THEMES ====================
  'hybrid-sunset': {
    name: 'Hybrid - Sunset',
    description: 'Warm sunset gradient theme',
    category: 'Hybrid',
    preview: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #dc2626 100%)',
      primary: '#ea580c',
      secondary: '#fbbf24'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.02 50)',
        '--foreground': 'oklch(0.20 0.04 30)',
        '--card': 'oklch(0.995 0.01 50)',
        '--card-foreground': 'oklch(0.20 0.04 30)',
        '--primary': 'oklch(0.62 0.24 30)',
        '--primary-foreground': 'oklch(0.995 0.01 50)',
        '--secondary': 'oklch(0.82 0.18 80)',
        '--secondary-foreground': 'oklch(0.20 0.04 30)',
        '--muted': 'oklch(0.95 0.03 60)',
        '--muted-foreground': 'oklch(0.48 0.04 40)',
        '--accent': 'oklch(0.92 0.08 70)',
        '--accent-foreground': 'oklch(0.20 0.04 30)',
        '--border': 'oklch(0.88 0.05 60)',
        '--input': 'oklch(0.88 0.05 60)',
        '--ring': 'oklch(0.62 0.24 30)'
      },
      dark: {
        '--background': 'oklch(0.15 0.03 30)',
        '--foreground': 'oklch(0.95 0.02 50)',
        '--card': 'oklch(0.18 0.03 30)',
        '--card-foreground': 'oklch(0.95 0.02 50)',
        '--primary': 'oklch(0.72 0.26 40)',
        '--primary-foreground': 'oklch(0.15 0.03 30)',
        '--secondary': 'oklch(0.85 0.20 80)',
        '--secondary-foreground': 'oklch(0.15 0.03 30)',
        '--muted': 'oklch(0.28 0.04 35)',
        '--muted-foreground': 'oklch(0.68 0.02 50)',
        '--accent': 'oklch(0.32 0.10 60)',
        '--accent-foreground': 'oklch(0.95 0.02 50)',
        '--border': 'oklch(0.28 0.05 35)',
        '--input': 'oklch(0.28 0.05 35)',
        '--ring': 'oklch(0.72 0.26 40)'
      }
    }
  },

  'hybrid-ocean': {
    name: 'Hybrid - Ocean',
    description: 'Deep ocean blues and teals',
    category: 'Hybrid',
    preview: {
      background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)',
      primary: '#0891b2',
      secondary: '#06b6d4'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.97 0.015 220)',
        '--foreground': 'oklch(0.18 0.04 220)',
        '--card': 'oklch(0.99 0.01 220)',
        '--card-foreground': 'oklch(0.18 0.04 220)',
        '--primary': 'oklch(0.56 0.14 220)',
        '--primary-foreground': 'oklch(0.99 0.01 220)',
        '--secondary': 'oklch(0.70 0.12 200)',
        '--secondary-foreground': 'oklch(0.18 0.04 220)',
        '--muted': 'oklch(0.94 0.02 220)',
        '--muted-foreground': 'oklch(0.46 0.03 220)',
        '--accent': 'oklch(0.90 0.06 210)',
        '--accent-foreground': 'oklch(0.18 0.04 220)',
        '--border': 'oklch(0.86 0.04 220)',
        '--input': 'oklch(0.86 0.04 220)',
        '--ring': 'oklch(0.56 0.14 220)'
      },
      dark: {
        '--background': 'oklch(0.16 0.03 220)',
        '--foreground': 'oklch(0.94 0.015 220)',
        '--card': 'oklch(0.19 0.03 220)',
        '--card-foreground': 'oklch(0.94 0.015 220)',
        '--primary': 'oklch(0.68 0.16 220)',
        '--primary-foreground': 'oklch(0.16 0.03 220)',
        '--secondary': 'oklch(0.75 0.14 200)',
        '--secondary-foreground': 'oklch(0.16 0.03 220)',
        '--muted': 'oklch(0.28 0.04 220)',
        '--muted-foreground': 'oklch(0.66 0.015 220)',
        '--accent': 'oklch(0.32 0.08 210)',
        '--accent-foreground': 'oklch(0.94 0.015 220)',
        '--border': 'oklch(0.28 0.05 220)',
        '--input': 'oklch(0.28 0.05 220)',
        '--ring': 'oklch(0.68 0.16 220)'
      }
    }
  },

  'hybrid-forest': {
    name: 'Hybrid - Forest',
    description: 'Natural forest greens',
    category: 'Hybrid',
    preview: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
      primary: '#059669',
      secondary: '#10b981'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.97 0.02 150)',
        '--foreground': 'oklch(0.19 0.04 150)',
        '--card': 'oklch(0.99 0.01 150)',
        '--card-foreground': 'oklch(0.19 0.04 150)',
        '--primary': 'oklch(0.54 0.15 160)',
        '--primary-foreground': 'oklch(0.99 0.01 150)',
        '--secondary': 'oklch(0.68 0.16 155)',
        '--secondary-foreground': 'oklch(0.19 0.04 150)',
        '--muted': 'oklch(0.94 0.025 150)',
        '--muted-foreground': 'oklch(0.46 0.03 150)',
        '--accent': 'oklch(0.90 0.08 155)',
        '--accent-foreground': 'oklch(0.19 0.04 150)',
        '--border': 'oklch(0.86 0.05 150)',
        '--input': 'oklch(0.86 0.05 150)',
        '--ring': 'oklch(0.54 0.15 160)'
      },
      dark: {
        '--background': 'oklch(0.17 0.03 150)',
        '--foreground': 'oklch(0.94 0.02 150)',
        '--card': 'oklch(0.20 0.03 150)',
        '--card-foreground': 'oklch(0.94 0.02 150)',
        '--primary': 'oklch(0.66 0.17 160)',
        '--primary-foreground': 'oklch(0.17 0.03 150)',
        '--secondary': 'oklch(0.72 0.18 155)',
        '--secondary-foreground': 'oklch(0.17 0.03 150)',
        '--muted': 'oklch(0.29 0.04 150)',
        '--muted-foreground': 'oklch(0.66 0.02 150)',
        '--accent': 'oklch(0.33 0.10 155)',
        '--accent-foreground': 'oklch(0.94 0.02 150)',
        '--border': 'oklch(0.29 0.05 150)',
        '--input': 'oklch(0.29 0.05 150)',
        '--ring': 'oklch(0.66 0.17 160)'
      }
    }
  },

  'hybrid-lavender': {
    name: 'Hybrid - Lavender',
    description: 'Soft lavender and purple mix',
    category: 'Hybrid',
    preview: {
      background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
      primary: '#8b5cf6',
      secondary: '#a78bfa'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.975 0.02 290)',
        '--foreground': 'oklch(0.20 0.04 290)',
        '--card': 'oklch(0.995 0.01 290)',
        '--card-foreground': 'oklch(0.20 0.04 290)',
        '--primary': 'oklch(0.55 0.24 290)',
        '--primary-foreground': 'oklch(0.995 0.01 290)',
        '--secondary': 'oklch(0.70 0.18 295)',
        '--secondary-foreground': 'oklch(0.20 0.04 290)',
        '--muted': 'oklch(0.945 0.025 290)',
        '--muted-foreground': 'oklch(0.48 0.03 290)',
        '--accent': 'oklch(0.92 0.08 292)',
        '--accent-foreground': 'oklch(0.20 0.04 290)',
        '--border': 'oklch(0.87 0.05 290)',
        '--input': 'oklch(0.87 0.05 290)',
        '--ring': 'oklch(0.55 0.24 290)'
      },
      dark: {
        '--background': 'oklch(0.16 0.03 290)',
        '--foreground': 'oklch(0.945 0.02 290)',
        '--card': 'oklch(0.19 0.03 290)',
        '--card-foreground': 'oklch(0.945 0.02 290)',
        '--primary': 'oklch(0.70 0.26 290)',
        '--primary-foreground': 'oklch(0.16 0.03 290)',
        '--secondary': 'oklch(0.76 0.20 295)',
        '--secondary-foreground': 'oklch(0.16 0.03 290)',
        '--muted': 'oklch(0.28 0.04 290)',
        '--muted-foreground': 'oklch(0.67 0.02 290)',
        '--accent': 'oklch(0.32 0.10 292)',
        '--accent-foreground': 'oklch(0.945 0.02 290)',
        '--border': 'oklch(0.28 0.05 290)',
        '--input': 'oklch(0.28 0.05 290)',
        '--ring': 'oklch(0.70 0.26 290)'
      }
    }
  },

  // ==================== PROFESSIONAL THEMES (MOTU-Inspired) ====================
  'pro-motu-dark': {
    name: 'Professional - MOTU Dark',
    description: 'Black with cyan accents (MOTU Model12 style)',
    category: 'Professional',
    preview: {
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      primary: '#00d4ff',
      secondary: '#00ff88'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.005 200)',
        '--foreground': 'oklch(0.10 0.01 200)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.10 0.01 200)',
        '--primary': 'oklch(0.70 0.18 200)',
        '--primary-foreground': 'oklch(0.98 0.005 200)',
        '--secondary': 'oklch(0.75 0.16 162)',
        '--secondary-foreground': 'oklch(0.10 0.01 200)',
        '--muted': 'oklch(0.95 0.01 200)',
        '--muted-foreground': 'oklch(0.48 0.01 200)',
        '--accent': 'oklch(0.92 0.08 200)',
        '--accent-foreground': 'oklch(0.10 0.01 200)',
        '--border': 'oklch(0.88 0.02 200)',
        '--input': 'oklch(0.88 0.02 200)',
        '--ring': 'oklch(0.70 0.18 200)'
      },
      dark: {
        '--background': 'oklch(0.08 0.01 240)',
        '--foreground': 'oklch(0.95 0.01 200)',
        '--card': 'oklch(0.12 0.01 240)',
        '--card-foreground': 'oklch(0.95 0.01 200)',
        '--primary': 'oklch(0.75 0.20 200)',
        '--primary-foreground': 'oklch(0.08 0.01 240)',
        '--secondary': 'oklch(0.80 0.18 162)',
        '--secondary-foreground': 'oklch(0.08 0.01 240)',
        '--muted': 'oklch(0.20 0.01 240)',
        '--muted-foreground': 'oklch(0.68 0.01 200)',
        '--accent': 'oklch(0.25 0.05 200)',
        '--accent-foreground': 'oklch(0.95 0.01 200)',
        '--border': 'oklch(0.22 0.02 240)',
        '--input': 'oklch(0.22 0.02 240)',
        '--ring': 'oklch(0.75 0.20 200)'
      }
    }
  },

  'pro-motu-light': {
    name: 'Professional - MOTU Light',
    description: 'Silver/gray with blue accents (MOTU Proton style)',
    category: 'Professional',
    preview: {
      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
      primary: '#4a9eff',
      secondary: '#60a5fa'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.93 0.01 240)',
        '--foreground': 'oklch(0.18 0.02 240)',
        '--card': 'oklch(0.97 0.005 240)',
        '--card-foreground': 'oklch(0.18 0.02 240)',
        '--primary': 'oklch(0.60 0.20 240)',
        '--primary-foreground': 'oklch(0.97 0.005 240)',
        '--secondary': 'oklch(0.65 0.18 250)',
        '--secondary-foreground': 'oklch(0.18 0.02 240)',
        '--muted': 'oklch(0.88 0.015 240)',
        '--muted-foreground': 'oklch(0.44 0.02 240)',
        '--accent': 'oklch(0.84 0.06 240)',
        '--accent-foreground': 'oklch(0.18 0.02 240)',
        '--border': 'oklch(0.80 0.03 240)',
        '--input': 'oklch(0.80 0.03 240)',
        '--ring': 'oklch(0.60 0.20 240)'
      },
      dark: {
        '--background': 'oklch(0.22 0.015 240)',
        '--foreground': 'oklch(0.93 0.01 240)',
        '--card': 'oklch(0.26 0.015 240)',
        '--card-foreground': 'oklch(0.93 0.01 240)',
        '--primary': 'oklch(0.68 0.22 240)',
        '--primary-foreground': 'oklch(0.22 0.015 240)',
        '--secondary': 'oklch(0.72 0.20 250)',
        '--secondary-foreground': 'oklch(0.22 0.015 240)',
        '--muted': 'oklch(0.34 0.02 240)',
        '--muted-foreground': 'oklch(0.70 0.01 240)',
        '--accent': 'oklch(0.38 0.08 240)',
        '--accent-foreground': 'oklch(0.93 0.01 240)',
        '--border': 'oklch(0.34 0.03 240)',
        '--input': 'oklch(0.34 0.03 240)',
        '--ring': 'oklch(0.68 0.22 240)'
      }
    }
  },

  'pro-synth-green': {
    name: 'Professional - Synth Green',
    description: 'Dark with green LEDs (MOTU MX4 style)',
    category: 'Professional',
    preview: {
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      primary: '#00ff88',
      secondary: '#00d4ff'
    },
    cssVars: {
      light: {
        '--background': 'oklch(0.98 0.005 150)',
        '--foreground': 'oklch(0.10 0.01 150)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.10 0.01 150)',
        '--primary': 'oklch(0.75 0.20 162)',
        '--primary-foreground': 'oklch(0.98 0.005 150)',
        '--secondary': 'oklch(0.70 0.18 200)',
        '--secondary-foreground': 'oklch(0.10 0.01 150)',
        '--muted': 'oklch(0.95 0.01 150)',
        '--muted-foreground': 'oklch(0.48 0.01 150)',
        '--accent': 'oklch(0.92 0.08 162)',
        '--accent-foreground': 'oklch(0.10 0.01 150)',
        '--border': 'oklch(0.88 0.02 150)',
        '--input': 'oklch(0.88 0.02 150)',
        '--ring': 'oklch(0.75 0.20 162)'
      },
      dark: {
        '--background': 'oklch(0.09 0.005 150)',
        '--foreground': 'oklch(0.95 0.01 150)',
        '--card': 'oklch(0.13 0.005 150)',
        '--card-foreground': 'oklch(0.95 0.01 150)',
        '--primary': 'oklch(0.80 0.22 162)',
        '--primary-foreground': 'oklch(0.09 0.005 150)',
        '--secondary': 'oklch(0.75 0.20 200)',
        '--secondary-foreground': 'oklch(0.09 0.005 150)',
        '--muted': 'oklch(0.21 0.01 150)',
        '--muted-foreground': 'oklch(0.68 0.01 150)',
        '--accent': 'oklch(0.26 0.06 162)',
        '--accent-foreground': 'oklch(0.95 0.01 150)',
        '--border': 'oklch(0.23 0.02 150)',
        '--input': 'oklch(0.23 0.02 150)',
        '--ring': 'oklch(0.80 0.22 162)'
      }
    }
  }
};

/**
 * Apply a UI theme to the document
 */
export function applyUITheme(theme: UITheme, isDarkMode: boolean = false): void {
  try {
    const config = UI_THEMES[theme];
    if (!config) {
      console.error(`Theme "${theme}" not found`);
      return;
    }

    const vars = isDarkMode ? config.cssVars.dark : config.cssVars.light;
    const root = document.documentElement;

    // Apply each CSS variable
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    console.log(`✅ Applied UI theme: ${config.name} (${isDarkMode ? 'dark' : 'light'} mode)`);
  } catch (error) {
    console.error('Error applying UI theme:', error);
    throw error;
  }
}

/**
 * Get theme by category
 */
export function getThemesByCategory(category: UIThemeConfig['category']): UITheme[] {
  return Object.entries(UI_THEMES)
    .filter(([_, config]) => config.category === category)
    .map(([key, _]) => key as UITheme);
}

/**
 * Get all theme categories
 */
export function getThemeCategories(): UIThemeConfig['category'][] {
  return ['Modern Dark', 'Classic Light', 'Ultra Modern', 'Hybrid', 'Professional'];
}