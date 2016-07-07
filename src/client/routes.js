/* eslint-disable no-multi-spaces */
import App from './App';
import pages from './pages';

const routes = {
  path: '/',
  component: App,
  indexRoute: {
    component: pages.Home
  },
  childRoutes: [
    { path: '/login',          component: pages.Login },
    { path: '/signup',         component: pages.Signup },
    { path: '/about',          component: pages.About },
    { path: '/user/:userPath', component: pages.User }
  ]
};

export default routes;
