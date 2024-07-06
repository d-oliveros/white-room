import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const TABLE_THEME_DEFAULT = 'TABLE_THEME_DEFAULT';
export const TABLE_THEME_EXAMPLE = 'TABLE_THEME_EXAMPLE';
export const TABLE_THEME_SMALL = 'TABLE_THEME_SMALL';
export const TABLE_THEME_CLEAR = 'TABLE_THEME_CLEAR';
export const TABLE_THEME_HISTORICAL = 'TABLE_THEME_HISTORICAL';
export const TABLE_THEME_PARTNER = 'TABLE_THEME_PARTNER';
export const TABLE_THEME_PARTNER_CLEAR = 'TABLE_THEME_PARTNER_CLEAR';

const TABLE_THEME_TO_CLASSNAME_MAPPING = {
  [TABLE_THEME_DEFAULT]: null,
  [TABLE_THEME_EXAMPLE]: 'themeExample',
  [TABLE_THEME_SMALL]: 'themeSmall',
  [TABLE_THEME_CLEAR]: 'themeClear',
  [TABLE_THEME_HISTORICAL]: 'themeHistorical',
  [TABLE_THEME_PARTNER]: 'themePartner',
  [TABLE_THEME_PARTNER_CLEAR]: 'themePartnerClear',
};

export const TABLE_THEMES = Object.keys(TABLE_THEME_TO_CLASSNAME_MAPPING);

/**
 * Wraps a table row with expander columns.
 *
 * @param  {Array}   row   Row to wrap with expander columns.
 * @param  {String}  size  The width of the expander columns.
 * @param  {String}  theme One of TABLE_THEMES.
 * @return {Array}         New row with expander columns.
 */
function addExpanderColumns(row, size, theme) {
  if (!size) {
    return row;
  }

  const expanderCellClassName = classnames(
    'expanderCell',
    TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
  );

  return [
    { className: expanderCellClassName, style: { width: size } },
    ...row,
    { className: expanderCellClassName, style: { width: size } },
  ];
}

const TableHeaderCell = ({
  content,
  dataTableFieldId,
  onClick,
  className,
  noPadding,
  colSpan,
  theme,
  sort,
  sortPosition = 'left',
  style,
}) => {

  const sortDOM = (sort || dataTableFieldId) && (
    <div
      className={
        classnames('tableHeadCellSort', sort && `tableHeadCellSort-${sort}`)
      }
    />
  );

  return (
    <th
      onClick={onClick}
      style={style}
      className={classnames(
        'tableHeadCell',
        className,
        noPadding && 'noPadding',
        onClick && 'cursor-pointer',
        TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
      )}
      colSpan={colSpan}
    >
      {sortPosition === 'left' && sortDOM}
      {content}
      {sortPosition === 'right' && sortDOM}
    </th>
  );
};

TableHeaderCell.propTypes = {
  content: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
  colSpan: PropTypes.number,
  theme: PropTypes.oneOf(TABLE_THEMES).isRequired,
  style: PropTypes.object,
  sortPosition: PropTypes.string,
};

const TableContentCell = ({
  content,
  onClick,
  className,
  colSpan,
  noPadding,
  overflowVisible,
  style,
  theme,
}) => {
  return (
    <td
      onClick={onClick}
      style={style}
      className={classnames(
        'tableBodyCell',
        className,
        TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
        noPadding && 'noPadding',
        overflowVisible && 'overflowVisible',
      )}
      colSpan={colSpan}
    >
      {content}
    </td>
  );
};

TableContentCell.propTypes = {
  content: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  colSpan: PropTypes.number,
  noPadding: PropTypes.bool,
  overflowVisible: PropTypes.bool,
  style: PropTypes.object,
  theme: PropTypes.oneOf(TABLE_THEMES).isRequired,
};

const TableContentRow = ({
  onClick,
  className,
  cells,
  theme,
  sidePadding,
  rowIndex,
  hideRow = false,
  dataset,
}) => {
  const isZebra = (rowIndex % 2 === 1);

  return (hideRow
    ? <div className='hiddenRow' />
    : (
      <tr
        className={classnames(
          'tableBodyRow',
          className,
          TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
          isZebra && 'tableBodyRowZebra',
          rowIndex === 0 && 'tableFirstRow',
          onClick && 'tableRowClickable',
        )}
        onClick={onClick}
        {...dataset}
      >
        {addExpanderColumns(cells, sidePadding, theme)
          .map((contentCellProps, cellIndex) => (
            <TableContentCell
              {...contentCellProps}
              key={`cell-${cellIndex}`} // eslint-disable-line react/no-array-index-key
              theme={theme}
            />
          ))
        }
      </tr>
    )
  );
};

TableContentRow.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  colSpan: PropTypes.number,
  cells: PropTypes.arrayOf(PropTypes.shape({
    content: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
    colSpan: PropTypes.number,
    style: PropTypes.object,
  })).isRequired,
  theme: PropTypes.oneOf(TABLE_THEMES).isRequired,
  sidePadding: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  rowIndex: PropTypes.number.isRequired,
  hideRow: PropTypes.bool,
  dataset: PropTypes.object,
};

const getColgroup = (headers) => {
  return (
    (headers.length > 0)
      ? (
        <colgroup>
          {headers.map((header, index) => (
            <col
              key={`table-col-${(
                (typeof header.content === 'string' && header.content)
                  ? header.content.replace(/\s/g, '-')
                  : index
              )}`}
              style={{ width: (header.width > 0 ? `${header.width.toFixed(3)}%` : undefined) }}
            />
          ))}
        </colgroup>
      )
      : null
  );
};

const Table = ({
  headers = [],
  rows = [],
  className,
  theme = TABLE_THEME_DEFAULT,
  sidePadding,
  minWidth,
  sticky,
}) => (
  <table
    className={classnames(
      'Table',
      className,
      TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
    )}
    style={minWidth ? { minWidth } : null}
  >
    {getColgroup(headers)}
    {!headers.length ? null : (
      <thead className={!sticky ? 'tableHead' : 'tableHead stickyTableHead'}>
        <tr className='tableHeadRow'>
          {addExpanderColumns(headers, sidePadding, theme)
            .map((headerCellProps, index) => (
              <TableHeaderCell
                {...headerCellProps}
                key={`header-${index}`} // eslint-disable-line react/no-array-index-key
                theme={theme}
              />
            ))
          }
        </tr>
      </thead>
    )}
    {!rows.length ? null : (
      <tbody
        className={
          classnames(!sticky ? 'tableBody' : 'tableBody stickyTableBody',
            TABLE_THEME_TO_CLASSNAME_MAPPING[theme],
          )
        }
      >
        {rows.map((contentRowProps, rowIndex) => (
          <TableContentRow
            {...contentRowProps}
            key={`row-${rowIndex}`} // eslint-disable-line react/no-array-index-key
            theme={theme}
            sidePadding={sidePadding}
            rowIndex={rowIndex}
          />
        ))}
      </tbody>
    )}
  </table>
);

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    content: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    sort: PropTypes.string,
  })),
  rows: PropTypes.arrayOf(PropTypes.shape({
    onClick: PropTypes.func,
    className: PropTypes.string,
    cells: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.node,
      onClick: PropTypes.func,
      className: PropTypes.string,
      noPadding: PropTypes.bool,
      overflowVisible: PropTypes.bool,
      style: PropTypes.object,
    })).isRequired,
  })),
  theme: PropTypes.oneOf(TABLE_THEMES),
  sidePadding: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  className: PropTypes.string,
  minWidth: PropTypes.string,
  sticky: PropTypes.bool,
};

export default Table;
