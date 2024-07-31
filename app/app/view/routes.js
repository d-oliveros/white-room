import HomePage from './pages/Homepage.jsx';
import PdfGeneratorPage from './pages/PdfGeneratorPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const routes = [
  { path: '/', exact: true, Component: HomePage },
  { path: '/pdf-generator/:pdfComponentId', Component: PdfGeneratorPage },
  { path: '*', Component: NotFoundPage },
];

export default routes;
