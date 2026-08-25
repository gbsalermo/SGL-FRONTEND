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
