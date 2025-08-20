import React from "react";
import {
  CanAccess,
  ITreeMenu,
  useIsExistAuthentication,
  useLogout,
  useMenu,
  useRefineContext,
  useRouterContext,
  useRouterType,
  useTitle,
  useTranslate,
} from "@refinedev/core";
import { useNavigate } from "react-router";
import { RefineThemedLayoutV2SiderProps } from "@refinedev/mui";
import {
  ListOutlined,
  Logout,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Button,
  IconButton,
  MuiMenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { RefineThemedLayoutV2SiderProps as SiderProps } from "@refinedev/mui";

export const Sider: React.FC<SiderProps> = ({
  Title: TitleFromProps,
  render,
  meta,
  width: widthFromProps,
}) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [opened, setOpened] = React.useState<boolean>(false);

  const routerType = useRouterType();
  const NewLink = useRouterContext().Link;
  const navigate = useNavigate();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
  const Title = useTitle();
  const isExistAuthentication = useIsExistAuthentication();
  const t = useTranslate();
  const { hasDashboard } = useRefineContext();
  const { mutate: mutateLogout } = useLogout();

  const RenderToTitle = TitleFromProps ?? Title ?? React.Fragment;

  const drawerWidth = () => {
    if (collapsed) return 64;
    return widthFromProps ?? 200;
  };

  const commonListItemProps = {
    sx: {
      pl: collapsed ? 1 : 2,
      justifyContent: collapsed ? "center" : "initial",
      "&:hover": {
        backgroundColor: "action.hover",
      },
    },
  };

  const commonLinkProps = {
    color: "inherit",
    textDecoration: "none",
  };

  const renderTreeView = (tree: ITreeMenu[], selectedKey?: string) => {
    return tree.map((item: ITreeMenu) => {
      const { icon, label, route, name, children, parentName } = item;
      const isOpen = defaultOpenKeys?.includes(name || "");
      const isSelected = route === selectedKey;
      const isParent = !!(children?.length);

      return (
        <CanAccess
          key={item.key}
          resource={name.toLowerCase()}
          action="list"
          params={{
            resource: item,
          }}
        >
          <div key={item.key}>
            {isParent ? (
              <ListItemButton 
                {...commonListItemProps}
                onClick={() => setOpened(!opened)}
              >
                <ListItemIcon
                  sx={{
                    justifyContent: "center",
                    minWidth: 36,
                    color: "text.primary",
                  }}
                >
                  {icon ?? <ListOutlined />}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: "14px",
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  />
                )}
                {!collapsed && (opened ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            ) : (
              <Tooltip
                title={collapsed ? label ?? name : ""}
                placement="right"
                disableHoverListener={!collapsed}
                arrow
              >
                <ListItemButton
                  {...(routerType === "legacy"
                    ? {
                        component: NewLink as any,
                        to: route,
                      }
                    : {})}
                  {...commonListItemProps}
                  selected={isSelected}
                  onClick={() => {
                    if (route) {
                      navigate(route);
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      justifyContent: "center",
                      minWidth: 36,
                      color: isSelected ? "primary.main" : "text.primary",
                    }}
                  >
                    {icon ?? <ListOutlined />}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: "14px",
                        fontWeight: isSelected ? "bold" : "normal",
                        color: isSelected ? "primary.main" : "text.primary",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            )}
            {isParent && (
              <Collapse in={opened} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderTreeView(children, selectedKey)}
                </List>
              </Collapse>
            )}
          </div>
        </CanAccess>
      );
    });
  };

  const dashboard = hasDashboard ? (
    <CanAccess resource="dashboard" action="list">
      <Tooltip
        title={collapsed ? t("dashboard.title", "Dashboard") : ""}
        placement="right"
        disableHoverListener={!collapsed}
        arrow
      >
        <ListItemButton
          {...(routerType === "legacy"
            ? {
                component: NewLink as any,
                to: "/",
              }
            : {})}
          {...commonListItemProps}
          selected={selectedKey === "/" || selectedKey === "/dashboard"}
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          <ListItemIcon
            sx={{
              justifyContent: "center",
              minWidth: 36,
              color: (selectedKey === "/" || selectedKey === "/dashboard") ? "primary.main" : "text.primary",
            }}
          >
            📊
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={t("dashboard.title", "Dashboard")}
              primaryTypographyProps={{
                noWrap: true,
                fontSize: "14px",
                fontWeight: (selectedKey === "/" || selectedKey === "/dashboard") ? "bold" : "normal",
                color: (selectedKey === "/" || selectedKey === "/dashboard") ? "primary.main" : "text.primary",
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </CanAccess>
  ) : null;

  const logout = isExistAuthentication && (
    <Tooltip
      title={collapsed ? t("buttons.logout", "Logout") : ""}
      placement="right"
      disableHoverListener={!collapsed}
      arrow
    >
      <ListItemButton
        key="logout"
        {...commonListItemProps}
        onClick={() => mutateLogout()}
        sx={{
          color: "text.primary",
          "&:hover": {
            backgroundColor: "error.light",
            color: "error.contrastText",
          },
        }}
      >
        <ListItemIcon
          sx={{
            justifyContent: "center",
            minWidth: 36,
            color: "inherit",
          }}
        >
          <Logout />
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={t("buttons.logout", "Logout")}
            primaryTypographyProps={{
              noWrap: true,
              fontSize: "14px",
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );

  const items = renderTreeView(menuItems, selectedKey);

  const renderSider = () => {
    if (render) {
      return render({
        dashboard,
        logout,
        items,
        collapsed,
      });
    }
    return (
      <>
        {dashboard}
        {items}
      </>
    );
  };

  return (
    <>
      <Drawer
        variant="permanent"
        PaperProps={{ elevation: 1 }}
        sx={{
          width: { xs: 0, md: drawerWidth() },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth(),
            boxSizing: "border-box",
            transition: "width 200ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
          },
        }}
        open
      >
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            paddingLeft: collapsed ? 0 : 2,
            paddingRight: 1,
          }}
        >
          <RenderToTitle collapsed={collapsed} />
          {!collapsed && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                color: "text.secondary",
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
          {collapsed && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                color: "text.secondary",
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </Box>
        <Divider />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <List sx={{ flexGrow: 1, paddingTop: 0 }}>
            {renderSider()}
          </List>
          {/* Logout at the bottom */}
          <Box sx={{ mt: "auto" }}>
            <Divider />
            <List sx={{ paddingTop: 1, paddingBottom: 1 }}>
              {logout}
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
