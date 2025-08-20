import React from "react";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  useDataGrid,
  BooleanField,
} from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { 
  Box, 
  Button, 
  Container,
  Fade,
  Avatar,
  Typography,
  Stack,
  Card,
  alpha,
  useTheme,
} from "@mui/material";
import { Add, Business, Group } from "@mui/icons-material";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import "../../styles/modern-theme.css";

export const OrganizationList: React.FC = () => {
  const navigate = useNavigate();
  const { dataGridProps } = useDataGrid({
    resource: "organizations",
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
      minWidth: 200,
    },
    {
      field: "shortName",
      headerName: "Short Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "parentId",
      headerName: "Parent ID",
      width: 100,
      valueGetter: (params) => (params as any)?.value || "None",
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
        return dayjs(value).format("DD-MM-YYYY HH:mm");
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
          onClick={() => navigate("/organizations/create")}
        >
          Create Organization
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