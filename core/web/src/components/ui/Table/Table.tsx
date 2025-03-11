import { Table as FlowbiteTable } from 'flowbite-react';
import classnames from 'classnames';

interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  striped?: boolean;
  onRowClick?: (rowIndex: number) => void;
}

const Table = ({ headers, rows, striped, onRowClick }: TableProps) => {
  return (
    <div className="overflow-hidden border border-[#F0F0F0] [box-shadow:0px_4px_10px_0px_#0000000D]">
      <FlowbiteTable className="min-w-full text-[#132630]">
        <FlowbiteTable.Head
          className="bg-gray-100"
          theme={{
            cell: {
              base: 'py-2 px-3 text-left text-[14px] font-bold text-[#132630]',
            },
            base: 'rounded-none',
          }}
        >
          {headers.map((header, index) => (
            <FlowbiteTable.HeadCell key={index}>{header}</FlowbiteTable.HeadCell>
          ))}
        </FlowbiteTable.Head>
        <FlowbiteTable.Body className="bg-white">
          {rows.map((row, rowIndex) => (
            <FlowbiteTable.Row
              key={rowIndex}
              className={classnames(
                'hover:bg-[#EBF4FF]',
                {
                  'bg-[#EBF4FF]': striped && rowIndex % 2 !== 0,
                },
                { 'cursor-pointer': !!onRowClick },
              )}
              onClick={() => onRowClick?.(rowIndex)}
            >
              {row.map((cell, cellIndex) => (
                <FlowbiteTable.Cell
                  key={cellIndex}
                  className="whitespace-nowrap p-4 text-[16px] font-normal text-[#132630]"
                >
                  {cell}
                </FlowbiteTable.Cell>
              ))}
            </FlowbiteTable.Row>
          ))}
        </FlowbiteTable.Body>
      </FlowbiteTable>
    </div>
  );
};

export default Table;
