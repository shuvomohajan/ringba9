import React from "react";
import {
  Checkbox,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
} from "@material-ui/core";
import MaUTable from "@material-ui/core/Table";
import { makeStyles } from "@material-ui/core/styles";
import TablePaginationActions from "./TablePaginationActions";
import TableToolbar from "./TableToolbar";
import PropTypes from "prop-types";

import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  useResizeColumns,
} from "react-table";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <Checkbox ref={resolvedRef} {...rest} />
      </>
    );
  }
);

const tableStyles = makeStyles((theme) => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    width: 130,
    textTransform: "capitalize!important",
  },
  importForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}));


// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed externall, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    // <input
    //   style={inputStyle}
    //   value={value}
    //   onChange={onChange}
    //   onBlur={onBlur}
    // />
    <p>{value}</p>
  );
};

EditableCell.propTypes = {
  cell: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }),
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }),
  column: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  updateMyData: PropTypes.func.isRequired,
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

const EnhancedTable = ({
  columns,
  data,
  setData,
  updateMyData,
  skipPageReset,
  inboundIds,
  TableTitle,
  children,
}) => {
  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, selectedRowIds, globalFilter },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useResizeColumns,
    
    (hooks) => {
      hooks.allColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox.  Pagination is a problem since this will select all
          // rows even though not all rows are on the current page.  The solution should
          // be server side pagination.  For one, the clients should not download all
          // rows in most cases.  The client should only download data for the current page.
          // In that case, getToggleAllRowsSelectedProps works fine.
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
  };

  const removeByIndexs = (array, indexs) =>
    array.filter((_, i) => !indexs.includes(i));

  const deleteHandler = (event) => {
    const newData = removeByIndexs(
      data,
      Object.keys(selectedRowIds).map((x) => parseInt(x, 10))
    );
    setData(newData);
  };


  const addUserHandler = (user) => {
    const newData = data.concat([user]);
    setData(newData);
  };

  const classes = tableStyles();
  const storeSelectedData = (e, row) => {
    const data = row.values.Inbound_Id;
    if (!inboundIds.includes(data)) {
      inboundIds.push(data);
    } else {
      let itemIndx = inboundIds.indexOf(data);
      inboundIds.splice(itemIndx, 1);
    }
  };

 
  return (
    <Paper>
      <TableContainer>
        <TableToolbar
          numSelected={Object.keys(selectedRowIds).length}
          deleteHandler={deleteHandler}
          addUserHandler={addUserHandler}
          preGlobalFilteredRows={preGlobalFilteredRows}
          setGlobalFilter={setGlobalFilter}
          globalFilter={globalFilter}
          TableTitle={TableTitle}
          deleteHandler={deleteHandler}
        >
          {children}
        </TableToolbar>
        <MaUTable {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell
                    {...(column.id === "selection"
                      ? column.getHeaderProps()
                      : column.getHeaderProps(column.getSortByToggleProps()))}
                  >
                    {column.render("Header")}
                    {column.id !== "selection" ? (
                      <TableSortLabel
                        active={column.isSorted}
                        // react-table has a unsorted state which is not treated here
                        direction={column.isSortedDesc ? "desc" : "asc"}
                      />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <TableCell
                        {...cell.getCellProps({
                          onClick: (e) => storeSelectedData(e, row),
                        })}
                      >
                        {cell.render("Cell")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow className={classes.TableFooterRow}>
              <TablePagination
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  { label: "All", value: data.length },
                ]}
                colSpan={3}
                count={data.length}
                rowsPerPage={pageSize}
                page={pageIndex}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </MaUTable>
      </TableContainer>
  
    </Paper>
  );
};

EnhancedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  updateMyData: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  skipPageReset: PropTypes.bool.isRequired,
};

export default EnhancedTable;
