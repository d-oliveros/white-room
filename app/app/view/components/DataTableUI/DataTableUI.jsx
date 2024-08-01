import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Table from '#app/view/components/Table/Table.jsx';

const DataTableUI = (props) => {
  const {
    dataTableViewSettings,
    headers,
    autoScrollFunction,
  } = props;

  useEffect(() => {
    if (autoScrollFunction) {
      autoScrollFunction();
    }
  }, [props.rows, autoScrollFunction]);

  const _onHeaderClick = useCallback((dataTableFieldId) => {
    if (dataTableViewSettings) {
      dataTableViewSettings.toggleSort(dataTableFieldId);
    }
  }, [dataTableViewSettings]);

  const connectedHeaders = (headers || []).map((header) => ({
    ...header,
    sort: dataTableViewSettings?.sort[header.dataTableFieldId],
    onClick: !header.dataTableFieldId
      ? header.onClick
      : (...args) => {
        _onHeaderClick(header.dataTableFieldId);
        if (header.onClick) {
          header.onClick(...args);
        }
      },
  }));
  return (
    <Table
      {...props}
      headers={connectedHeaders}
    />
  );
};

DataTableUI.propTypes = {
  ...Table.propTypes,
  dataTableViewSettings: PropTypes.object,
};

export default DataTableUI;
