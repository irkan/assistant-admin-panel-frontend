import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useGetIdentity, useList } from "@refinedev/core";
import { HamburgerMenu, RefineThemedLayoutV2HeaderProps } from "@refinedev/mui";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { useNavigate } from "react-router";

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const navigate = useNavigate();

  const { data: user } = useGetIdentity<IUser>();
  
  // Get user's organization
  const { data: organizationsData } = useList({
    resource: "organizations",
    pagination: { pageSize: 1 },
  });
  
  const currentOrganization = organizationsData?.data?.[0];

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            direction="row"
            alignItems="center"
            gap="16px"
          >
            <HamburgerMenu />
            
            {/* Organization Name - Left Side */}
            {currentOrganization && (
              <Stack
                direction="row"
                alignItems="center"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => navigate(`/organizations/show/${currentOrganization.id}`)}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: {
                      xs: "none",
                      md: "block",
                    },
                  }}
                >
                  {currentOrganization.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    ml: 1,
                    display: {
                      xs: "none",
                      md: "block",
                    },
                  }}
                >
                  ({currentOrganization.shortName})
                </Typography>
              </Stack>
            )}
          </Stack>
          
          {/* User Info - Right Side */}
          <Stack
            direction="row"
            gap="16px"
            alignItems="center"
            justifyContent="flex-end"
          >
            <IconButton
              color="inherit"
              onClick={() => {
                setMode();
              }}
            >
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>

            {(user?.avatar || user?.name) && (
              <Stack
                direction="row"
                gap="16px"
                alignItems="center"
                justifyContent="center"
              >
                {user?.name && (
                  <Typography
                    sx={{
                      display: {
                        xs: "none",
                        sm: "inline-block",
                      },
                    }}
                    variant="subtitle2"
                  >
                    {user?.name}
                  </Typography>
                )}
                <Avatar src={user?.avatar} alt={user?.name} />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
