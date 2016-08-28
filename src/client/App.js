import React from 'react';
import classes from 'classnames';
import camelcase from 'camelcase';
import { map, isString } from 'lodash';
import { NavBar, Footer } from './components';
import branch from './core/branch';

/**
 * Main application container
 */
@branch({
  bodyClasses: ['pageMetadata', 'bodyClasses'],
  currentUser: ['currentUser'],
  experiments: ['experiments']
})
export default class App extends React.Component {
  render() {
    const { currentUser, bodyClasses, experiments } = this.props;
    const stateClasses = { 'logged-out' : currentUser.roles.anonymous };
    const experimentClasses = getExperimentClasses(experiments);

    return (
      <div className={classes(bodyClasses, experimentClasses, stateClasses)}>
        <NavBar/>
        <div id='main'>
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}

/**
 * Gets the CSS classes out of the running A/B experiments.
 *
 * @param  {Object} experiments Running A/B experiments
 * @return {Array} CSS Classes representing the running experiments
 */
function getExperimentClasses(experiments) {
  return map(experiments, (value, key) => {
    const experiment = isString(value)
      ? camelcase(value)
      : (value ? 'enabled' : 'disabled');

    return `variation-${key}-${experiment}`;
  });
}
