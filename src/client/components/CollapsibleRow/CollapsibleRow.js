import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Text from 'client/components/Text/Text';

class CollapsibleRow extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    collapsed: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      collapsed: props.collapsed || false,
    };
  }

  _onRowClick = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { title, children } = this.props;
    const { collapsed } = this.state;
    return (
      <div className={classnames('CollapsibleRow', collapsed && 'collapsed')}>
        <div onClick={this._onRowClick} className='collapsibleTitle'>
          <Text size='2xl' weight='bold' font='whitney-sc'>
            {title}
          </Text>
        </div>
        {!collapsed && (
          <div className='collapsibleContent'>
            {children}
          </div>
        )}
      </div>
    );
  }
}

export default CollapsibleRow;
