import React from 'react';

export default class About extends React.Component {
  static getPageMetadata() {
    return {
      pageTitle: 'About Boilerplate',
      section: 'About',
      bodyClasses: 'page-about',
      canonical: `${process.env.APP_HOST}/about`,
      keywords: 'about',
      description: 'Boilerplate about page description.'
    };
  }

  render() {
    return (
      <div>
        <h1>About Boilerplate</h1>
        <p>This is the about page.</p>
      </div>
    );
  }
}
