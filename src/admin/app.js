const config = {
  auth: {
    logo: undefined,
  },
  head: {
    favicon: undefined,
    title: 'Admin Portal',
  },
  menu: {
    logo: undefined,
  },
  translations: {
    en: {
      'Auth.form.welcome.title': 'Admin Portal',
      'Auth.form.welcome.subtitle': 'Log in to your Account',
      'app.components.LeftMenu.navbrand.title': 'Admin Portal',
    },
  },
  theme: {
    colors: {
      primary100: '#f0f4ff',
      primary200: '#d9e8ff',
      primary500: '#004eeb',
      primary600: '#004ce0',
      primary700: '#0040c4',
      danger700: '#b72b1a',
    },
  },
  tutorials: false,
  notifications: {
    releases: false,
  },
};

const bootstrap = (app) => {};

export default {
  config,
  bootstrap,
};
