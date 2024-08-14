import HomePage from './pages/HomePage.jsx';
import SandboxPage from './pages/SandboxPage.jsx';
import PdfGeneratorPage from './pages/PdfGeneratorPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const routes = [
  { path: '/', exact: true, Component: HomePage },
  { path: '/sandbox', exact: true, Component: SandboxPage },
  { path: '/pdf-generator/:pdfComponentId', Component: PdfGeneratorPage },
  { path: '*', Component: NotFoundPage },
];

export default routes;
