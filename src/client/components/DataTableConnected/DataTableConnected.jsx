import { Component } from 'react';
import PropTypes from 'prop-types';
import {
  dataTableUIControls,
} from '#client/helpers/dataTables.js';

const DEFAULT_COUNT = 10;

@dataTableUIControls((props) => {
  return {
    itemsPropName: props.itemPropsName,
    dataSource: props.dataSource,
    rootViewId: props.rootViewId || props.dataSource,
    initialViewSettings: props.initialViewSettings,
    resetOnUnmount: props.resetOnUnmount,
    count: props.count || DEFAULT_COUNT,
  };
})
class DataTableConnected extends Component {
  static propTypes = {
    viewSettings: PropTypes.object,
    reloadItems: PropTypes.func.isRequired,
    itemsPropName: PropTypes.string,
    children: PropTypes.func.isRequired,
    dataTableApiState: PropTypes.object.isRequired,
  }
s
  static defaultProps = {
    itemsPropName: 'items',
  }

  render() {
    const {
      dataTableApiState,
      itemsPropName,
      viewSettings,
      reloadItems,
      loadNextPage,
      onInfiniteScrollWrapperRef,
      dataTableIsFullyLoaded,
      children,
    } = this.props;
    return (
      children({
        [itemsPropName]: this.props[itemsPropName],
        [`${itemsPropName}Count`]: this.props[`${itemsPropName}Count`],
        dataTableApiState,
        viewSettings,
        reloadItems,
        loadNextPage,
        onInfiniteScrollWrapperRef,
        dataTableIsFullyLoaded,
      })
    );
  }
}

export default DataTableConnected;
