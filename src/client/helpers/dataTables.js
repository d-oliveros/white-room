import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { monkey } from 'baobab';
import assert from 'assert';
import lodashSortBy from 'lodash/fp/sortBy';
import lodashCompact from 'lodash/fp/compact';
import lodashPickBy from 'lodash/fp/pickBy';
import { setIn } from 'formik';

import typeCheck from 'common/util/typeCheck';
import objectDiff from 'common/util/objectDiff';

import branch from 'client/core/branch';
import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';
import withApiState from 'client/helpers/withApiState';
import withInfiniteScroll from 'client/helpers/withInfiniteScroll';
import log from 'client/lib/log';

import {
  API_ACTION_DATATABLE_GET,
} from 'api/actionTypes';

import updateSettings from 'client/actions/User/updateSettings';

const debug = log.debug('dataTables');
const ALL_ITEMS_COUNT = 500000;
const withoutEmptyValues = lodashPickBy((item) => {
  if (
    typeof item === 'boolean'
    || typeof item === 'number'
    || typeof item === 'object'
  ) {
    return true;
  }
  return !!item;
});

function makeSortIdString(sort) {
  const sortIds = Object.keys(withoutEmptyValues(sort || {})).sort();
  return sortIds.length > 0
    ? sortIds.map((sortId) => `sort_${sortId}_${sort[sortId]}`).join('_')
    : 'sort_none';
}

function makeFuzzyIdString(fuzzy) {
  if (!fuzzy?.queryString || (fuzzy?.columns || []).length === 0) {
    return '';
  }
  return `fuzzy_${fuzzy.queryString}_cols_${fuzzy.columns.map((column) => column).join('_')}`;
}

function makeFilterIdString(filter) {
  const filterIds = Object.keys(withoutEmptyValues(filter || {})).sort();
  return filterIds.length > 0
    ? filterIds.map((filterId) => `filter_${filterId}_${JSON.stringify(filter[filterId])}`).join('_')
    : 'filter_none';
}

function makeCustomParamIdString(customParams) {
  const customParamIds = Object.keys(withoutEmptyValues(customParams || {})).sort();
  return customParamIds.length > 0
    ? customParamIds.map((customParamId) => `custom_param_${customParamId}_${JSON.stringify(customParams[customParamId])}`).join('_') // eslint-disable-line max-len
    : 'custom_param_none';
}

function getViewIdWithState({ rootViewId, viewSettings = {} }) {
  typeCheck('rootViewId::NonEmptyString', rootViewId);
  typeCheck('viewSettings::NonEmptyObject', viewSettings);

  const viewSettingsSortString = makeSortIdString(viewSettings.sort);
  const viewSettingsFuzzyString = makeFuzzyIdString(viewSettings.fuzzy);
  const viewSettingsFilterString = makeFilterIdString(viewSettings.filter);
  const viewSettingsCustomParamsString = makeCustomParamIdString(viewSettings.customParams);

  return lodashCompact([
    rootViewId,
    viewSettingsSortString,
    viewSettingsFuzzyString,
    viewSettingsFilterString,
    viewSettingsCustomParamsString,
  ]).join('_');
}

/**
 * Initializes a datable within a state object.
 *
 * @param  {Object} state                Baobab state object.
 * @param  {string} options.dataSource   Data source.
 * @param  {string} options.viewId       View ID (optional).
 * @param  {Object} options.filter       Filter object (optional).
 * @param  {Object} options.sort         Sort object (optional).
 * @param  {Object} options.fuzzy        Fuzzy object (optional).
 * @param  {Object} options.customParams Custom properties sent to the data table handler query generator.
 * @return {undefined}
 */
export function actionInitializeDataTableState({ state }, {
  dataSource,
  viewId,
  filter,
  sort,
  fuzzy,
  customParams,
  loadAllData,
}) {
  sort = withoutEmptyValues(sort);
  fuzzy = withoutEmptyValues(fuzzy);
  filter = withoutEmptyValues(filter);
  const sortId = makeSortIdString(sort);
  if (!state.exists(['dataTables', dataSource, 'items'])) {
    state.set(['dataTables', dataSource, 'items'], []);
  }

  if (!state.exists(['dataTables', dataSource, 'itemIdsBySort', sortId])) {
    state.set(['dataTables', dataSource, 'itemIdsBySort', sortId], []);
  }

  if (!state.exists(['dataTables', dataSource, 'views'])) {
    state.set(['dataTables', dataSource, 'views'], {});
  }

  if (!state.exists(['dataTables', dataSource, 'viewSettings'])) {
    state.set(['dataTables', dataSource, 'viewSettings'], {});
  }
  if (viewId && !state.exists(['dataTables', dataSource, 'views', viewId])) {
    state.set(['dataTables', dataSource, 'views', viewId], {
      filter,
      sort,
      fuzzy,
      customParams,
      loadedCount: 0,
      totalItemsCount: null,
    });
  }

  if (viewId && !state.exists(['dataTables', dataSource, 'views', viewId, '$items'])) {
    state.set(['dataTables', dataSource, 'views', viewId, '$items'], monkey({
      cursors: {
        items: ['dataTables', dataSource, 'items'],
        itemIdsInSortGroup: ['dataTables', dataSource, 'itemIdsBySort', sortId],
      },
      get({ items, itemIdsInSortGroup }) {
        if (!items) {
          return [];
        }
        const itemIdsExistInSortGroup = loadAllData
          ? {}
          : itemIdsInSortGroup.reduce((memo, id) => ({
            ...memo,
            [id]: true,
          }), {});

        let selectedItems = loadAllData
          ? items
          : items.filter(({ id }) => itemIdsExistInSortGroup[id]);

        const filterKeys = Object.keys(filter || {});

        if (filterKeys.length > 0) {
          selectedItems = selectedItems.filter((item) => {
            return filterKeys.every((filterField) => {
              // Ensure we're filtering by field without join table references.
              const filterFieldName = filterField.split('.').pop();
              if (Array.isArray(filter[filterField])) {
                return filter[filterField].some((filterValue) => item[filterFieldName] === filterValue);
              }
              return item[filterFieldName] === filter[filterField];
            });
          });
        }

        if (sort) {
          assert(Object.keys(sort).length <= 1, 'Sorting by multiple values is not yet supported.');
          const supportedSortValues = [
            'asc',
            'desc',
          ];
          assert(
            Object.keys(sort).every((sortFieldName) => supportedSortValues.includes(sort[sortFieldName])),
            `Sorting value in ${JSON.stringify(sort)} not supported. Available values: ${supportedSortValues}`
          );

          const sortByGroups = Object.keys(sort).reduce((acc, sortFieldName) => [
            ...acc,
            {
              fieldPath: sortFieldName,
              fieldName: sortFieldName.split('.').pop(),
              direction: sort[sortFieldName],
            },
          ], []);

          selectedItems = lodashSortBy(sortByGroups.map(({ fieldName }) => fieldName), selectedItems);

          if (sortByGroups[0]?.direction === 'desc') {
            const firstNull = selectedItems.findIndex((element) => {
              return element[sortByGroups[0]?.fieldName] === null;
            });
            if (firstNull > -1) {
              const nullsArray = selectedItems.slice(firstNull);
              const valuesArray = selectedItems.slice(0, firstNull);
              valuesArray.reverse();
              selectedItems = [...valuesArray, ...nullsArray];
            }
            else {
              selectedItems.reverse();
            }
          }
        }

        if (fuzzy?.queryString && (fuzzy?.columns || []).length > 0) {
          const fuzzyQueryStringLowerCase = fuzzy.queryString.toLowerCase();

          selectedItems = selectedItems.filter((item) => {
            return fuzzy.columns.some((column) => {
              return typeof item[column] === 'string'
                ? item[column].toLowerCase().includes(fuzzyQueryStringLowerCase)
                : false;
            });
          });
        }

        return selectedItems;
      },
    }));

    // HACK(@d-oliveros):
    //  baobab-react is not emitting an update event after creating a new monkey.
    //  Faking a value update to trigger a baobab-react component update.
    const currentItems = state.get(['dataTables', dataSource, 'items']);
    state.set(['dataTables', dataSource, 'items'], [...(currentItems || [])]);

    // NOTE(@d-oliveros): Only commit if a view object has been created, as it may already have listeners waiting for data.
    state.commit();
  }
}

/**
 * Initializes the settings for a datable view.
 *
 * @param  {Object}  state                Baobab state object.
 * @param  {string}  options.dataSource   Data source.
 * @param  {string}  options.rootViewId   View ID.
 * @param  {Object}  options.viewSettings Filter, sort and other view settings.
 * @param  {boolean} options.loadAllData  If true, the data will not be segmented by child view IDs as all the data would be initially loaded.
 * @return {undefined}
 */
export function actionInitializeDataTableUIControlsState({ state }, {
  dataSource,
  rootViewId,
  viewSettings: _viewSettings,
}) {
  rootViewId = rootViewId || dataSource;
  const viewSettings = { ...(_viewSettings || {}) };

  viewSettings.sort = withoutEmptyValues(viewSettings.sort || {});
  viewSettings.fuzzy = withoutEmptyValues(viewSettings.fuzzy || {});
  viewSettings.filter = withoutEmptyValues(viewSettings.filter || {});
  viewSettings.customParams = withoutEmptyValues(viewSettings.customParams || {});
  viewSettings.dataSource = dataSource;
  viewSettings.rootViewId = rootViewId;
  viewSettings.viewId = getViewIdWithState({
    rootViewId,
    viewSettings,
  });
  viewSettings.loadAllData = !!viewSettings.loadAllData;
  viewSettings.includeItemsCount = viewSettings.includeItemsCount || false;

  state.set(['dataTables', dataSource, 'viewSettings', rootViewId], viewSettings);

  return actionInitializeDataTableState({ state }, {
    dataSource,
    filter: viewSettings.filter,
    sort: viewSettings.sort,
    fuzzy: viewSettings.fuzzy,
    customParams: viewSettings.customParams,
    viewId: viewSettings.viewId,
    loadAllData: viewSettings.loadAllData,
  });
}

/**
 * Loads the next page of a data table.
 *
 * @param  {Object}   options.state      Baobab state object.
 * @param  {Object}   options.apiClient  API client created via `/api/createApiClient`.
 * @param  {string}   options.dataSource Data source.
 * @param  {string}   options.viewId     View ID (optional).
 * @param  {number}   options.count      Number of items to load.
 * @param  {Function} options.onSuccess  Function to run after the items are loaded.
 * @return {undefined}
 */
export function actionDataTableLoadNextPage({ state, apiClient }, {
  dataSource,
  viewId,
  count,
  onSuccess,
  includeItemsCount,
}) {
  typeCheck('dataSource::NonEmptyString', dataSource);
  typeCheck('viewId::NonEmptyString', viewId);
  typeCheck('count::PositiveNumber', count);
  typeCheck('onSuccess::Maybe Function', onSuccess);

  const dataTableViewConfig = state.get(['dataTables', dataSource, 'views', viewId]);
  if (!dataTableViewConfig) {
    const error = new Error(`DataTable "${dataSource}" view ID "${viewId}" hasn't been configured yet.`);
    error.name = 'DataTableViewNotConfiguredError';
    error.details = {
      dataSource,
      viewId,
      count,
    };
    throw error;
  }

  const {
    filter,
    sort,
    fuzzy,
    customParams,
    loadedCount,
  } = dataTableViewConfig;

  const skip = loadedCount;

  if (!dataTableViewConfig.isFullyLoaded) {
    return actionDataTableLoadItems({ state, apiClient }, {
      dataSource,
      viewId,
      count,
      onSuccess,
      filter,
      sort,
      fuzzy,
      skip,
      customParams,
      // Only including the items count on the first data load
      // TODO: helper/action to reload the counts only (or force a count reload on getItems
      includeItemsCount: includeItemsCount && !loadedCount,
    });
  }
}

/**
 * Load data table items and store them in the provided state object.
 *
 * @param  {Object} options.state        Baobab state object.
 * @param  {Object} options.apiClient    API client created via `/api/createApiClient`.
 * @param  {string} options.dataSource   Data source.
 * @param  {string} options.viewId       View ID (optional).
 * @param  {Object} options.filter       Filter object (optional).
 * @param  {Object} options.sort         Sort object (optional).
 * @param  {Object} options.fuzzy        Fuzzy object (optional).
 * @param  {number} options.skip         Number of items to skip.
 * @param  {Object} options.customParams Custom parameters to be sent to the data table's handler query generator.
 * @param  {number} options.count        Number of items to load.
 * @return {undefined}
 */
export async function actionDataTableLoadItems({ state, apiClient }, args) {
  const {
    dataSource,
    viewId,
    filter,
    sort,
    fuzzy,
    skip,
    count,
    customParams,
    onSuccess,
    includeItemsCount,
  } = args;
  typeCheck('dataSource::NonEmptyString', dataSource);
  typeCheck('viewId::Maybe NonEmptyString', viewId);
  typeCheck('filter::Maybe Object', filter);
  typeCheck('sort::Maybe Object', sort);
  typeCheck('fuzzy::Maybe Object', fuzzy);
  typeCheck('skip::Maybe Number', skip);
  typeCheck('count::PositiveNumber', count);
  typeCheck('onSuccess::Maybe Function', onSuccess);
  typeCheck('includeItemsCount::Maybe Boolean', includeItemsCount);
  const sortId = makeSortIdString(sort);

  const result = await apiClient.postWithState({
    action: API_ACTION_DATATABLE_GET,
    queryId: lodashCompact([dataSource, viewId]).join('-'),
    state: state,
    payload: {
      dataSource,
      filter,
      sort,
      fuzzy,
      skip,
      count,
      customParams,
      includeItemsCount,
    },
    onSuccess({ items, totalItemsCount, isFullyLoaded }) {
      const itemsById = items.reduce((acc, item) => ({
        ...acc,
        [item.id]: item,
      }), {});

      const updatedItemIds = [];

      // Update existing items.
      state.get(['dataTables', dataSource, 'items']).forEach((currItem) => {
        const newItem = itemsById[currItem.id];
        if (newItem) {
          state.set(['dataTables', dataSource, 'items', { id: newItem.id }], newItem);
          updatedItemIds.push(newItem.id);
        }
      });

      // Add new items to sort group.
      const itemIdsInSortGroup = state.get(['dataTables', dataSource, 'itemIdsBySort', sortId]) || [];
      const itemIdsExistInSortGroup = itemIdsInSortGroup
        .reduce((memo, id) => ({
          ...memo,
          [id]: true,
        }), {});
      for (const item of items) {
        if (!itemIdsExistInSortGroup[item.id]) {
          state.push(['dataTables', dataSource, 'itemIdsBySort', sortId], item.id);
        }
      }

      // Add new items.
      const itemsToAdd = items.filter(({ id }) => {
        return !updatedItemIds.includes(id);
      });
      state.concat(['dataTables', dataSource, 'items'], itemsToAdd);
      if (viewId) {
        state.set(['dataTables', dataSource, 'views', viewId, 'isFullyLoaded'], isFullyLoaded || false);
        if (typeof totalItemsCount === 'number') {
          state.set(['dataTables', dataSource, 'views', viewId, 'totalItemsCount'], totalItemsCount);
        }
      }

      // Update the view's loaded items count.
      state.apply(
        ['dataTables', dataSource, 'views', viewId, 'loadedCount'],
        (loadedCount) => loadedCount + count,
      );

      debug('actionDataTableLoadItems onSuccess', {
        itemsById,
        updatedItemIds,
        itemsToAdd,
        viewId,
        isFullyLoaded,
      });

      if (onSuccess) {
        onSuccess({ items, isFullyLoaded });
      }
    },
  });

  return result;
}

/**
 * Load data table items and store them in the provided state object,
 * only if the data table's view is not fully loaded.
 *
 * @param  {Object} options.state        Baobab state object.
 * @param  {Object} options.apiClient    API client created via `/api/createApiClient`.
 * @param  {string} options.dataSource   Data source.
 * @param  {string} options.viewId       View ID (optional).
 * @param  {Object} ...options.args      Remaining args for actionDataTableLoadItems.
 * @return {undefined}
 */
export function actionDataTableLoadItemsIfNotFullyLoaded({ state, apiClient }, {
  dataSource,
  viewId,
  ...args
}) {
  typeCheck('dataSource::NonEmptyString', dataSource);
  typeCheck('viewId::Maybe NonEmptyString', viewId);

  const dataTableIsFullyLoaded = state.get([
    'dataTables',
    dataSource,
    'views',
    viewId,
    'isFullyLoaded',
  ]);

  if (!dataTableIsFullyLoaded) {
    return actionDataTableLoadItems({ state, apiClient }, {
      dataSource,
      viewId,
      ...args,
    });
  }
}

export async function actionDataTableReset({ state }, { dataSource }) {
  typeCheck('dataSource::NonEmptyString', dataSource);
  state.unset(['dataTables', dataSource]);
  state.commit();
}

export async function actionDataTableRemoveItem({ state }, { dataSource, entityId }) {
  typeCheck('dataSource::NonEmptyString', dataSource);
  typeCheck('entityId::PositiveNumber|NonEmptyString', entityId);

  const dataTableItems = state.get(['dataTables', dataSource, 'items']);

  if (Array.isArray(dataTableItems)) {
    state.set(['dataTables', dataSource, 'items'], dataTableItems.filter((item) => {
      return item.id !== entityId;
    }));
  }
}

/**
 * Gets a data table's settings from a getter function and a props object.
 *
 * @param  {Function|Object} dataTableParamsOrGetter Decorator params object, or getter function.
 * @param  {Object}          props                   React component's props.
 * @return {Object}          Data table settings object.
 */
function _dataTableGetParamsFromProps(dataTableParamsOrGetter, props) {
  const params = typeof dataTableParamsOrGetter === 'function'
    ? dataTableParamsOrGetter(props)
    : dataTableParamsOrGetter;

  if (!params) {
    return {
      skipInitialize: true,
    };
  }

  typeCheck('params::NonEmptyObject', params);
  typeCheck('dataSource::NonEmptyString', params.dataSource);
  typeCheck('viewId::NonEmptyString', params.viewId);
  return params;
}

/**
 * Gets the data table cursors required by the state manager.
 *
 * @param   {Function/Object} dataTableParamsOrGetter Decorator params object, or getter function.
 * @returns {Object}          Data table cursors.
 */
export function dataTableGetBranchParams(dataTableParamsOrGetter) {
  return (props) => {
    const params = _dataTableGetParamsFromProps(dataTableParamsOrGetter, props);

    if (!params.dataSource || !params.viewId) {
      return {};
    }
    return {
      items: ['dataTables', params.dataSource, 'views', params.viewId, '$items'],
      totalItemsCount: ['dataTables', params.dataSource, 'views', params.viewId, 'totalItemsCount'],
      dataTableIsFullyLoaded: ['dataTables', params.dataSource, 'views', params.viewId, 'isFullyLoaded'],
    };
  };
}

/**
 * Data table React HOC decorator.
 *
 * @param  {Function|Object} dataTableParamsOrGetter Decorator params object, or getter function.
 * @return {Function} React HOC decorator.
 */
export function dataTable(dataTableParamsOrGetter) {
  typeCheck(
    'dataTableParamsOrGetter::Function | NonEmptyObject',
    dataTableParamsOrGetter,
  );

  return function dataTableDecorator(ComponentToDecorate) {
    @withApiState((props) => {
      const params = _dataTableGetParamsFromProps(dataTableParamsOrGetter, props);
      if (!params.dataSource || !params.viewId) {
        return {};
      }
      return {
        dataTableApiState: {
          action: API_ACTION_DATATABLE_GET,
          queryId: lodashCompact([params.dataSource, params.viewId]).join('-'),
        },
      };
    })
    @branch(dataTableGetBranchParams(dataTableParamsOrGetter))
    class WithDataTable extends Component {
      static propTypes = {
        dispatch: PropTypes.func.isRequired,
      }

      UNSAFE_componentWillMount() {
        const { dispatch } = this.props;
        const params = _dataTableGetParamsFromProps(dataTableParamsOrGetter, this.props);
        if (!params.skipInitialize) {
          dispatch(actionInitializeDataTableState, params);
        }
      }

      UNSAFE_componentWillReceiveProps(props) {
        const { dispatch } = this.props;
        const params = _dataTableGetParamsFromProps(dataTableParamsOrGetter, props);
        if (!params.skipInitialize) {
          dispatch(actionInitializeDataTableState, params);
        }
      }

      render() {
        const { items, totalItemsCount, dataTableApiState, dataTableIsFullyLoaded } = this.props;
        const params = _dataTableGetParamsFromProps(dataTableParamsOrGetter, this.props);
        const itemsPropName = params.itemsPropName || 'items';
        const itemsToInject = params.injectSingleItem
          ? (items || [])[0]
          : items || [];

        const childProps = {
          ...this.props,
          [itemsPropName]: itemsToInject,
          [`${itemsPropName}Count`]: totalItemsCount,
          dataTableIsFullyLoaded: dataTableIsFullyLoaded || false,
          dataTableApiState: dataTableApiState || {},
        };

        if (params.dataSource) {
          childProps.dataSource = params.dataSource;
        }
        if (params.viewId) {
          childProps.viewId = params.viewId;
        }

        return (
          <ComponentToDecorate {...childProps} />
        );
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: WithDataTable,
      OriginalComponent: ComponentToDecorate,
    });

    return WithDataTable;
  };
}

/**
 * Data table controller with automated filtering/sorting/loading behaviors.
 *
 * @param  {Function|Object} dataTableParamsOrGetter Decorator params object, or getter function.
 * @return {Function} React HOC decorator.
 */
export function dataTableUIControls(dataTableParamsOrGetter) {
  dataTableParamsOrGetter = typeof dataTableParamsOrGetter === 'function'
    ? dataTableParamsOrGetter
    : () => dataTableParamsOrGetter;
  return function dataTableUIControlsDecorator(ComponentToDecorate) {
    @branch({
      currentUser: ['currentUser'],
    })
    @branch((props) => {
      const params = dataTableParamsOrGetter(props);
      if (!params.dataSource || !params.rootViewId) {
        return {};
      }
      return {
        viewSettings: ['dataTables', params.dataSource, 'viewSettings', params.rootViewId],
      };
    })
    @dataTable((props) => {
      const {
        viewSettings,
      } = props;
      const {
        dataSource,
        itemsPropName,
        count,
        resetOnUnmount,
      } = dataTableParamsOrGetter(props);
      if (!viewSettings) {
        return null;
      }
      return {
        viewId: viewSettings.viewId,
        sort: viewSettings.sort,
        fuzzy: viewSettings.fuzzy,
        filter: viewSettings.filter,
        count: viewSettings.loadAllData ? ALL_ITEMS_COUNT : count,
        loadAllData: viewSettings.loadAllData,
        customParams: viewSettings.customParams,
        itemsPropName,
        dataSource,
        resetOnUnmount,
      };
    })
    @withInfiniteScroll({
      offset: 420,
    })
    class WithDataTableUIControls extends Component {
      static propTypes = {
        dispatch: PropTypes.func.isRequired,
        itemsPropName: PropTypes.string,
        dataSource: PropTypes.string.isRequired,
        rootViewId: PropTypes.string.isRequired,
        viewSettings: PropTypes.object,
        initialViewSettings: PropTypes.object.isRequired,
        resetOnUnmount: PropTypes.bool,
      }

      static defaultProps = {
        itemsPropName: 'items',
      }

      constructor(props) {
        super(props);
        props.onInfiniteScrollCallbackReady(this._loadNextPage);
      }

      componentDidMount() {
        const { viewSettings } = this.props;
        if (viewSettings) {
          this._loadNextPage();
        }
      }

      UNSAFE_componentWillMount() {
        const { initialViewSettings } = this.props;
        this._updateViewSettings(initialViewSettings);
      }

      UNSAFE_componentWillReceiveProps(nextProps) {
        const { initialViewSettings } = this.props;

        const newViewSettings = nextProps.initialViewSettings || initialViewSettings;
        const diff = objectDiff(initialViewSettings || {}, nextProps.initialViewSettings || {});

        if (diff.changed !== 'equal' && newViewSettings) {
          this._updateViewSettings(newViewSettings);
        }

        if (
          nextProps.items?.length === 0
          && nextProps.dataTableApiState?.inProgress === false
          && nextProps.initialViewSettings
        ) {
          this._loadNextPage({
            ...nextProps,
            initialViewSettings: nextProps.initialViewSettings,
          });
        }
      }

      componentWillUnmount() {
        const { resetOnUnmount, dataSource, dispatch } = this.props;
        if (resetOnUnmount) {
          dispatch(actionDataTableReset, {
            dataSource,
          });
        }
      }

      _loadNextPage = (nextProps) => {
        const {
          viewSettings,
          dataTableIsFullyLoaded,
          dispatch,
        } = (nextProps || this.props);

        const { count } = dataTableParamsOrGetter(this.props);
        if (!dataTableIsFullyLoaded && viewSettings) {
          dispatch(actionDataTableLoadNextPage, {
            dataSource: viewSettings.dataSource,
            viewId: viewSettings.viewId,
            count: viewSettings.loadAllData ? ALL_ITEMS_COUNT : count,
            includeItemsCount: viewSettings.includeItemsCount,
          });
        }
      }

      _updateViewSettings = (viewSettings = {}) => {
        const {
          initialViewSettings,
          dataSource,
          rootViewId,
          dispatch,
        } = this.props;

        dispatch(actionInitializeDataTableUIControlsState, {
          dataSource,
          rootViewId,
          viewSettings: {
            ...viewSettings,
            loadAllData: initialViewSettings.loadAllData,
          },
        });
      }

      _toggleSort = (fieldId) => {
        const {
          initialViewSettings,
          viewSettings,
          sortUserSettingsFieldId,
          currentUser,
          dispatch,
        } = this.props;
        let newSortDirection;
        switch (viewSettings.sort[fieldId]) {
          case 'desc': newSortDirection = 'asc'; break;
          case 'asc': newSortDirection = null; break;
          default: newSortDirection = 'desc';
        }
        if (!newSortDirection) {
          this._updateViewSettings({
            ...initialViewSettings,
          });
        }
        else {
          this._updateViewSettings({
            ...initialViewSettings,
            sort: {
              [fieldId]: newSortDirection,
            },
          });
        }
        if (sortUserSettingsFieldId) {
          // eslint-disable-next-line max-len
          const newUserSettings = setIn({ ...currentUser.settings }, sortUserSettingsFieldId,
            newSortDirection ? { [fieldId]: newSortDirection } : undefined,
          );
          dispatch(updateSettings, newUserSettings);
        }
      }

      _reloadItems = ({ count, filter, customParams }) => {
        const {
          dispatch,
          dataSource,
          rootViewId,
          viewSettings,
        } = this.props;
        return dispatch(actionDataTableLoadItems, {
          dataSource: dataSource,
          viewId: rootViewId,
          count,
          customParams: customParams,
          filter: {
            ...(viewSettings.filter || {}),
            ...filter,
          },
          sort: viewSettings.sort,
        });
      }

      render() {
        const {
          items,
          totalItemsCount,
          itemsPropName,
          viewSettings,
          dispatch,
          dataTableIsFullyLoaded,
          onInfiniteScrollWrapperRef,
        } = this.props;

        return (
          <ComponentToDecorate
            {...this.props}
            {...{ [itemsPropName]: items }}
            {...{ [`${itemsPropName}Count`]: totalItemsCount }}
            dispatch={dispatch}
            reloadItems={this._reloadItems}
            loadNextPage={this._loadNextPage}
            dataTableIsFullyLoaded={dataTableIsFullyLoaded || false}
            viewSettings={viewSettings && {
              update: this._updateViewSettings,
              toggleSort: this._toggleSort,
              ...viewSettings,
            }}
            onInfiniteScrollWrapperRef={onInfiniteScrollWrapperRef}
          />
        );
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: WithDataTableUIControls,
      OriginalComponent: ComponentToDecorate,
    });

    return WithDataTableUIControls;
  };
}
