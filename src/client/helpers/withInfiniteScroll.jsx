import React, { Component } from 'react';

import configureDecoratedComponent from '#whiteroom/client/helpers/configureDecoratedComponent.js';

const CHECK_INTERVAL = 250;

export default function withInfiniteScroll(params = {}) {
  return function withInfiniteScrollDecorator(ComponentToDecorate) {
    class DecoratedComponent extends Component {
      constructor(props) {
        super();

        this.id = typeof params.savePositionWithId === 'function'
          ? params.savePositionWithId(props)
          : params.savePositionWithId;
      }

      componentDidMount() {
        const infiniteScrollCallback = this._infiniteScrollCallback;
        const infiniteScrollWrapperEl = this._infiniteScrollWrapperEl;

        if (typeof infiniteScrollCallback !== 'function') {
          return;
        }

        if (!infiniteScrollWrapperEl) {
          return;
        }

        this._interval = setInterval(this._checkScrolled, CHECK_INTERVAL);
      }

      componentWillUnmount() {
        clearInterval(this._interval);
        this._infiniteScrollCallback = null;
        this._infiniteScrollWrapperEl = null;
      }

      _onInfiniteScrollCallbackReady = (infiniteScrollCallback) => {
        this._infiniteScrollCallback = infiniteScrollCallback;
      }

      _onInfiniteScrollWrapperRef = (infiniteScrollWrapperEl) => {
        this._infiniteScrollWrapperEl = infiniteScrollWrapperEl;
      }

      _checkScrolled = () => {
        const infiniteScrollCallback = this._infiniteScrollCallback;
        const infiniteScrollWrapperEl = this._infiniteScrollWrapperEl;
        if (!infiniteScrollCallback || !infiniteScrollWrapperEl) {
          return;
        }

        const windowHeight = (global.innerHeight || global.document.documentElement.clientHeight);
        const rect = infiniteScrollWrapperEl.getBoundingClientRect();
        const offset = params.offset || 0;

        if (rect.bottom - offset <= windowHeight) {
          infiniteScrollCallback();
        }
      }

      render() {
        return (
          <ComponentToDecorate
            {...this.props}
            onInfiniteScrollCallbackReady={this._onInfiniteScrollCallbackReady}
            onInfiniteScrollWrapperRef={this._onInfiniteScrollWrapperRef}
          />
        );
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: DecoratedComponent,
      OriginalComponent: ComponentToDecorate,
    });

    return DecoratedComponent;
  };
}
