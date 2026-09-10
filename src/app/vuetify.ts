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
          background: '#07111F',
          surface: '#0D1929',
          primary: '#5B9DF8',
          'primary-darken-1': '#3183ED',
          secondary: '#54D59A',
          info: '#5B9DF8',
          success: '#54D59A',
          warning: '#F2BE55',
          error: '#FF7180',
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
