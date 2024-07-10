import React, { Component } from 'react';
import load from 'little-loader';

import log from '#white-room/client/lib/log.js';
import configureDecoratedComponent from '#white-room/client/helpers/configureDecoratedComponent.js';

const isBrowser = process.browser;
const scriptsLoaded = [];

const debug = log.debug('helpers:withJsScript');

export default function withJsScriptDecoratorFactory(params = {}) {
  return function withJsScriptDecorator(ComponentToDecorate) {
    class DecoratedComponent extends Component {
      constructor(props) {
        super(props);

        this.state = {
          isJsScriptLoaded: false,
        };

        this._isUnmounting = false;
      }

      componentDidMount() {
        this._loadScript();
      }

      componentWillUnmount() {
        this._isUnmounting = true;
      }

      _loadScript() {
        if (!isBrowser || !params.scriptUrl) {
          return;
        }

        if (scriptsLoaded.includes(params.scriptUrl)) {
          this.setState({ isJsScriptLoaded: true });
          return;
        }

        debug(`Loading script "${params.scriptUrl}".`);
        load(params.scriptUrl, (err) => {
          if (err || this._isUnmounting) {
            return;
          }

          debug(`Script loaded: "${params.scriptUrl}"`);
          this.setState({ isJsScriptLoaded: true });
          scriptsLoaded.push(params.scriptUrl);
        });
      }

      render() {
        const { isJsScriptLoaded } = this.state;
        return params.preventRender && !isJsScriptLoaded
          ? null
          : <ComponentToDecorate {...this.props} isJsScriptLoaded={isJsScriptLoaded} />;
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: DecoratedComponent,
      OriginalComponent: ComponentToDecorate,
    });

    return DecoratedComponent;
  };
}
