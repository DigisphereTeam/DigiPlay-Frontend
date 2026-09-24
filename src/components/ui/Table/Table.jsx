import { useMemo, useState } from "react";

import { Table as BootstrapTable } from "react-bootstrap";

import { FiChevronUp, FiChevronDown } from "react-icons/fi";

import noDataImage from "../../../assets/images/no-data-table.png";

import "./Table.css";

const Table = ({
  columns = [],
  data = [],
  actions,
  onRowClick,
  rowKey = "id",
}) => {
  const [sortKey, setSortKey] = useState("");

  const [sortDirection, setSortDirection] = useState("asc");

  const sortedData = useMemo(() => {
    let rows = [...data];

    if (sortKey) {
      rows.sort((a, b) => {
        const first = a[sortKey];

        const second = b[sortKey];

        if (typeof first === "number") {
          return sortDirection === "asc" ? first - second : second - first;
        }

        return sortDirection === "asc"
          ? String(first ?? "").localeCompare(String(second ?? ""))
          : String(second ?? "").localeCompare(String(first ?? ""));
      });
    }

    return rows;
  }, [data, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);

      setSortDirection("asc");
    }
  };

  return (
    <div className="table-wrapper-main">
      <div className="table-wrapper-responsive">
        <BootstrapTable className="table-custom-data-main mb-0">
          <thead className="table-wrapper-main-thread">
            <tr className="table-wrapper-main-tr">
              {columns.map((column) => (
                <th key={column.header} className="table-wrapper-main-th">
                  {column.accessor ? (
                    <button
                      type="button"
                      className="table-data-sort-btn"
                      onClick={() => handleSort(column.accessor)}
                    >
                      {column.header}

                      {sortKey === column.accessor &&
                        (sortDirection === "asc" ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        ))}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}

              {actions && <th className="table-wrapper-main-th">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => (
                <tr
                  key={row[rowKey] ?? index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "table-data-click-row" : ""}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className="table-custom-data-main-td"
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}

                  {actions && (
                    <td
                      className="table-custom-data-main-td"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="table-wrapper-main-empty"
                >
                  <img
                    src={noDataImage}
                    alt="No data"
                    className="table-no-data-image"
                  />

                  <h6>No Records Found</h6>
                </td>
              </tr>
            )}
          </tbody>
        </BootstrapTable>
      </div>
    </div>
  );
};

export default Table;
