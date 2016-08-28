import React from 'react';

const AboutPage = () => (
  <div>
    <h1>About My App</h1>
    <p>This is the about page.</p>
  </div>
);

AboutPage.getPageMetadata = ({
  pageTitle: 'About Boilerplate',
  section: 'About',
  bodyClasses: 'page-about',
  canonical: `${process.env.APP_HOST}/about`,
  keywords: 'about',
  description: 'Boilerplate about page description.'
});

export default AboutPage;
