import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'sglLight',
    themes: {
      sglLight: {
        dark: false,
        colors: {
          background: '#F5F7FA',
          surface: '#FFFFFF',
          primary: '#1A4DA1',
          'primary-darken-1': '#0D2B5E',
          secondary: '#007A3D',
          info: '#2D6BC4',
          success: '#007A3D',
          warning: '#F59E0B',
          error: '#DC2626',
        },
      },
      sglDark: {
        dark: true,
        colors: {
          background: '#08111F',
          surface: '#101B30',
          primary: '#5B8DE0',
          'primary-darken-1': '#173D78',
          secondary: '#38A169',
          info: '#78A4EB',
          success: '#38A169',
          warning: '#F6C343',
          error: '#F87171',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 6,
      height: 40,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
