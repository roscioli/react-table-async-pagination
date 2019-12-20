import React from "react";
import styled from "styled-components";
import { useTable, usePagination } from "react-table";

import makeData from "./makeData";

let totalNumResults = 99;
let listingRelations = makeData(totalNumResults);
let currentSearchQuery = "";

const getResultsForPage = (start, resultsPerPage, searchQuery) => {
  if (currentSearchQuery !== searchQuery) {
    totalNumResults = Math.ceil(Math.random() * 100);
    listingRelations = makeData(totalNumResults);

    currentSearchQuery = searchQuery;
  }

  return new Promise(resolve => {
    setTimeout(
      () =>
        resolve({
          listingRelations: listingRelations.slice(
            start,
            start + resultsPerPage
          ),
          totalNumResults
        }),
      200
    );
  });
};

function Table({ columns }) {
  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(3);
  const [pageCount, setPageCount] = React.useState(0);
  // const [pageIndex, setPageIndex] = React.useState(0);

  React.useEffect(() => setQuery(Date.now()), []);

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex }
  } = useTable(
    {
      columns,
      data,
      pageCount,
      manualPagination: true,
      initialState: { pageSize }
    },
    usePagination
  );

  React.useEffect(() => {
    const offset = pageIndex * pageSize;
    getResultsForPage(offset, pageSize, query).then(result => {
      const { listingRelations, totalNumResults } = result;
      setCurrentTableData(listingRelations);
      const pageCt = Math.ceil(totalNumResults / pageSize);
      setPageCount(pageCt);
    });
  }, [pageIndex, pageSize, query]);

  // Render the UI for your table
  return (
    <>
      <button
        onClick={() => {
          setQuery(String(Date.now()));
          gotoPage(0);
        }}
      >
        New query
      </button>
      <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage
            },
            null,
            2
          )}
        </code>
      </pre>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[3, 5, 10].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        columns: [
          {
            Header: "First Name",
            accessor: "firstName"
          },
          {
            Header: "Last Name",
            accessor: "lastName"
          }
        ]
      },
      {
        Header: "Info",
        columns: [
          {
            Header: "Age",
            accessor: "age"
          },
          {
            Header: "Visits",
            accessor: "visits"
          },
          {
            Header: "Status",
            accessor: "status"
          },
          {
            Header: "Profile Progress",
            accessor: "progress"
          }
        ]
      }
    ],
    []
  );

  return (
    <Styles>
      <Table columns={columns} />
    </Styles>
  );
}

export default App;
