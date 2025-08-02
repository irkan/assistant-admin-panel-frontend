import React from "react";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  useDataGrid,
  FilterDropdown,
  BooleanField,
} from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router";

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { dataGridProps } = useDataGrid({
    resource: "users",
    pagination: {
      mode: "server",
    },
    filters: {
      mode: "server",
    },
  });

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "surname",
      headerName: "Surname",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "active",
      headerName: "Active",
      width: 100,
      renderCell: function render({ value }) {
        return <BooleanField value={value} />;
      },
      filterable: false,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueFormatter: ({ value }) => {
        return new Date(value).toLocaleString();
      },
      filterable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: function render({ row }) {
        return (
          <Box>
            <EditButton hideText recordItemId={row.id} />
            <ShowButton hideText recordItemId={row.id} />
            <DeleteButton hideText recordItemId={row.id} />
          </Box>
        );
      },
    },
  ];

  return (
    <List
      headerButtons={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/users/create")}
        >
          Create User
        </Button>
      }
    >
      <DataGrid
        {...dataGridProps}
        columns={columns}
        autoHeight
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25,
            },
          },
        }}
      />
    </List>
  );
}; 