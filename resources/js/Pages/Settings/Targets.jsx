import Layout from "../Layout/Layout";
import React, { useEffect, useState, useRef } from "react";

import { kaReducer, Table } from "ka-table";
import {
  DataType,
  SortingMode,
  PagingPosition,
  EditingMode,
  ActionType,
} from "ka-table/enums";
import { kaPropsUtils } from "ka-table/utils";
import { usePage } from "@inertiajs/inertia-react";
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from "ka-table/actionCreators";
import FilterControl from "react-filter-control";
import { filterData } from "../filterData";
import "ka-table/style.scss";
import search from "../../../images/search.svg";
import eyeIcon from "../../../images/eyeIcon.svg";
import Edit from "../../../images/edit1.svg";
import closeNav from "../../../images/closeNav.svg";
import Cancel from "../../../images/cancel.svg";
import Switch from "@material-ui/core/Switch";
import {
  hideColumn,
  showColumn,
} from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import { Button, makeStyles } from "@material-ui/core";
import axios from "axios";
import { Helmet } from "react-helmet";
import NormalModal from "../../Shared/NormalModal";
import SnackBar from "../../Shared/SnackBar";
import ConfirmModal from "../../Shared/ConfirmModal";

const useStyles = makeStyles(() => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    width: "130",
    textTransform: "capitalize",
    fontSize: "14px",
  },
  editButton: {
    marginTop: "15px",
  },
}));


export const fields = [
  {
    caption: "customer",
    name: "customer",
    operators: [
      {
        caption: "Contains",
        name: "contains",
      },
      {
        caption: "Not Contains",
        name: "doesNotContain",
      },
      {
        caption: "Is Empty",
        name: "isEmpty",
      },
      {
        caption: "Is Not Empty",
        name: "isNotEmpty",
      },
      {
        caption: "Starts With",
        name: "startswith",
      },
      {
        caption: "Ends With",
        name: "endsWith",
      },
      {
        caption: "Is",
        name: "is",
      },
      {
        caption: "Is Not",
        name: "isnot",
      },
    ],
  },
  {
    caption: "Ringba Target Name",
    name: "Ringba_Target_Name",
    operators: [
      {
        caption: "Contains",
        name: "contains",
      },
      {
        caption: "Not Contains",
        name: "doesNotContain",
      },
      {
        caption: "Is Empty",
        name: "isEmpty",
      },
      {
        caption: "Is Not Empty",
        name: "isNotEmpty",
      },
      {
        caption: "Starts With",
        name: "startswith",
      },
      {
        caption: "Ends With",
        name: "endsWith",
      },
      {
        caption: "Is",
        name: "is",
      },
      {
        caption: "Is Not",
        name: "isnot",
      },
    ],
  },
  {
    caption: "Description",
    name: "Description",
    operators: [
      {
        caption: "Contains",
        name: "contains",
      },
      {
        caption: "Not Contains",
        name: "doesNotContain",
      },
      {
        caption: "Is Empty",
        name: "isEmpty",
      },
      {
        caption: "Is Not Empty",
        name: "isNotEmpty",
      },
      {
        caption: "Starts With",
        name: "startswith",
      },
      {
        caption: "Ends With",
        name: "endsWith",
      },
      {
        caption: "Is",
        name: "is",
      },
      {
        caption: "Is Not",
        name: "isnot",
      },
    ],
  },
];

export const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  },
];
export const filter = {
  groupName: "and",
  items: [
    {
      field: "customer",
      operator: "isNotEmpty",
    },
  ],
};

const Targets = () => {
  const classes = useStyles();
  const { allTargets } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [editData, setEditData] = useState();
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState({ open: false });
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const showColumnRef = useRef();

  const dataArray = allTargets.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    customer: item.Customer,
    Ringba_Target_Name: item.Ringba_Targets_Name,
    Description: item.Description,
    status: [item.status, item.id],
    id: item.id,
    key: index,
  }));
  const SelectionCell = ({
    rowKeyValue,
    dispatch,
    isSelectedRow,
    selectedRows,
  }) => {
    return (
      <Checkbox
        checked={isSelectedRow}
        color="primary"
        onChange={(event) => {
          if (event.nativeEvent.shiftKey) {
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()));
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue));
            setTableToolbar(true);
            const id = parseInt(rowKeyValue);
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id);
            }
          } else {
            dispatch(deselectRow(rowKeyValue));
            const id = parseInt(rowKeyValue);
            const itemIndx = selectedRowIds.indexOf(id);
            selectedRowIds.splice(itemIndx, 1);
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows());
            setTableToolbar(true);
            let i = 0;
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id);
                continue;
              }
              i++;
            }
          } else {
            dispatch(deselectAllFilteredRows());
            if (selectedRowIds) {
              selectedRowIds.splice(0, selectedRowIds.length);
            }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };


  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 20 },
      },
      {
        key: "selection-cell",
        style: { width: 80 },
      },
      {
        key: "sl",
        title: "SL",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 360 },
      },

      {
        key: "Description",
        title: "Description",
        dataType: DataType.String,
        style: { width: 400 },
      },
      {
        key: "Ringba_Target_Name",
        title: "Ringba Target Name",
        dataType: DataType.String,
        style: { width: 360 },
      },
      {
        key: "status",
        title: "Status",
        style: { width: 240 },
      },
    ],
    paging: {
      enabled: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,

    format: ({ column, value }) => {
      if (column.key === "edit") {
        return (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <img src={Edit} alt="edit-icon"></img>
          </div>
        );
      }
      if (column.key === "status") {
        return (
          <Switch
            checked={value[0] === 1 && true}
            color="primary"
            onChange={() => handleStatus(event, value[0], value[1])}
          />
        );
      }



    },
  };



  // console.table(tablePropsInit.columns)

  const OPTION_KEY = "target-report";
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  };
  const [tableProps, changeTableProps] = useState(stateStore);

  const handleStatus = (e, value, rowId) => {
    axios.post(route('target.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        let tmpData = { ...tableProps }
        tmpData.data.filter((item, indx) => {
          if (item.id === rowId) {
            if (tmpData.data[indx].status[0] == 1) {
              tmpData.data[indx].status = [0, rowId];
            } else {
              tmpData.data[indx].status = [1, rowId];
            }
          }
        });
        changeTableProps(tmpData)
      })
      .catch((err) => {
        console.log(err);
      })
  }

  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action);
      const { data, ...settingsWithoutData } = newState;
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
      return newState;
    });
  };

  const [filterValue, changeFilter] = useState(filter);
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue);
  };

  const [serachSidebar, setSearchSidebar] = useState(false);
  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState);
  };

  const handleColumns = () => {
    setShowColumns(true);
  };
  const closeSidebar = () => {
    setSearchSidebar(false);
  };
  const deleteHandler = () => {
    axios
      .post(route("target.delete"), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          );
          filteredData.data = newData;
          setselectedRowIds([]);
          changeTableProps(filteredData);
          setTableToolbar(false);
          setShowDeleteModal({ open: false });
          emptyCheckbox();
          setOpen(true);
          setResponse(res.data.msg);
        } else {
          setselectedRowIds([]);
          setTableToolbar(false);
          setShowDeleteModal({ open: false });
          emptyCheckbox();
          setOpen(true);
          setResponse(res.data.msg);
        }
      })
      .catch((err) => {
        setselectedRowIds([]);
        setTableToolbar(false);
        setShowDeleteModal({ open: false });
        emptyCheckbox();
      });
  };

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item);
      }
    });
    setShowEditModal({ open: true });
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = () => {
    axios
      .post(route("target.edit"), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].customer = editData.customer;
              filteredData.data[indx].Ringba_Target_Name =
                editData.Ringba_Target_Name;
              filteredData.data[indx].Description = editData.Description;
            }
          });
          setEditData();
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
          setselectedRowIds([])
        } else {
          setEditData();
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
          setselectedRowIds([])
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
    setTableToolbar(false);
    setselectedRowIds([]);
    emptyCheckbox();
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true });
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        setShowColumns(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showColumns]);

  const emptyCheckbox = () => {
    const storedData = JSON.parse(localStorage.getItem("target-report"));
    if (storedData?.selectedRows) storedData.selectedRows = [];
    localStorage.setItem("target-report", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    if (filteredData?.selectedRows) filteredData.selectedRows = [];
    changeTableProps(filteredData);
  };

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("target-report"));
      if (storedData != null) {
        emptyCheckbox();
      }
    };
  }, []);


  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">
          {selectedRowIds.length} Row Selected
        </div>
      </div>
    );
  };

  const ColumnSettings = (tableProps) => {
    const columnsSettingsProps = {
      data: tableProps.columns.map((c) => ({
        ...c,
        visible: c.visible !== false,
      })),
      rowKeyField: "key",
      columns: [
        {
          key: "visible",
          title: "Visible",
          isEditable: false,
          style: { textAlign: "center" },
          width: 80,
          dataType: DataType.Boolean,
        },
        {
          key: "title",
          isEditable: false,
          title: "Fields",
          dataType: DataType.String,
        },
      ],
      editingMode: EditingMode.None,
    };
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        );
      }
    };
    return (
      <Table
        {...columnsSettingsProps}
        childComponents={{
          rootDiv: {
            elementAttributes: () => ({
              style: { width: 400, marginBottom: 20 },
            }),
          },
          cell: {
            content: (props) => {
              switch (props.column.key) {
                case "visible":
                  return <CellEditorBoolean {...props} />;
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    );
  };

  return (
    <>
      <Helmet title="Targets Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search"></img>
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <img src={search} alt="search"></img>
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <img src={closeNav} alt="file not found"></img>
                  </a>
                </div>

                <div className="top-element">
                  <FilterControl
                    {...{
                      fields,
                      groups,
                      filterValue,
                      onFilterValueChanged: onFilterChanged,
                    }}
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <SelectionCell {...props} />;
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>;
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(
                        tableProps
                      )}
                    // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                    />
                  );
                }
              },
            },
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case "drag":
                    return (
                      <img
                        style={{ cursor: "move" }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    );
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />
      </div>


      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={"600px"}
        title={"Edit Targets"}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <span>Customer:</span>
            <TextField
              value={editData ? editData.customer : ""}
              fullWidth
              margin="normal"
              name="customer"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Description:</span>
            <TextField
              value={editData ? editData.Description : ""}
              fullWidth
              margin="normal"
              name="Description"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Ringba Target Name:</span>
            <TextField
              value={editData ? editData.Ringba_Target_Name : ""}
              fullWidth
              margin="normal"
              name="Ringba_Target_Name"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
            >
              Edit
            </Button>
          </form>

          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon">
            <img src={Cancel} alt="close-modal-icon"></img>
          </div>
        </div>
      </NormalModal>

      <SnackBar open={open} setOpen={setOpen} response={response} />
      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={"400px"}
        title={`${selectedRowIds.length > 1
          ? "Do you want to delete these records?"
          : "Do you want to delete this record?"
          }`}
      ></ConfirmModal>
    </>
  );
};

Targets.layout = (page) => <Layout title="Targets">{page}</Layout>;
export default Targets;
