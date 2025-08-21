import {
  Refine,
  Authenticated,
  useList,
} from "@refinedev/core";
import {
  Dashboard as DashboardIcon,
  SmartToy,
  Build,
  Business,
  VolumeUp,
} from "@mui/icons-material";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from "react";

import {
  ErrorComponent,
  useNotificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerBindings, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { Navigate, useNavigate } from "react-router";

import {
  OrganizationList,
  OrganizationCreate,
  OrganizationEdit,
  OrganizationShow,
} from "./pages/organizations";
import {
  AssistantList,
  AssistantCreate,
  AssistantEdit,
  AssistantShow,
} from "./pages/assistants";
import {
  ToolList,
  ToolCreate,
  ToolEdit,
  ToolShow,
} from "./pages/tools";
import {
  VoiceLibraryList,
} from "./pages/voice-library";
import {
  ApiKeyList,
  ApiKeyCreate,
  ApiKeyEdit,
  ApiKeyShow,
} from "./pages/api-keys";
import { Dashboard } from "./pages/dashboard";
import { AppIcon } from "./components/app-icon";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header, Sider } from "./components";
import { Signin } from "./pages/signin";
import { Signup } from "./pages/signup";
import { ForgotPassword } from "./pages/forgotPassword";

import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";

// Google Client ID - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

// Custom component to handle navigation based on user's organizations
const CustomNavigateToResource: React.FC = () => {
  const navigate = useNavigate();
  
  // Get organizations data to check if user has any
  const { data: organizationsData, isLoading } = useList({
    resource: "organizations",
    pagination: { pageSize: 1 },
  });

  useEffect(() => {
    if (!isLoading) {
      // If user has no organizations, redirect to dashboard
      if (!organizationsData || organizationsData.total === 0) {
        navigate("/dashboard", { replace: true });
      } else {
        // If user has organizations, navigate to assistants (first resource)
        navigate("/assistants", { replace: true });
      }
    }
  }, [isLoading, organizationsData, navigate]);

  // Show loading while checking organizations
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return null;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <RefineKbarProvider>
          <ColorModeContextProvider>
            <CssBaseline />
            <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
            <RefineSnackbarProvider>
              <DevtoolsProvider>
                <Refine
                  dataProvider={dataProvider}
                  notificationProvider={useNotificationProvider}
                  authProvider={authProvider}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "dashboard",
                      list: "/dashboard",
                      meta: {
                        canDelete: false,
                        icon: <DashboardIcon />,
                        label: "Dashboard",
                      },
                    },
                    {
                      name: "organizations",
                      show: "/organizations/show/:id",
                      edit: "/organizations/edit/:id",
                      meta: {
                        canDelete: false,
                        icon: <Business />,
                        hide: true, // Hide from sidebar
                      },
                    },
                    {
                      name: "assistants",
                      list: "/assistants",
                      edit: "/assistants/edit/:id",
                      show: "/assistants/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <SmartToy />,
                        label: "Assistants",
                      },
                    },
                    {
                      name: "tools",
                      list: "/tools",
                      create: "/tools/create",
                      edit: "/tools/edit/:id",
                      show: "/tools/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <Build />,
                        label: "Tools",
                      },
                    },
                    {
                      name: "voice-library",
                      list: "/voice-library",
                      meta: {
                        canDelete: false,
                        icon: <VolumeUp />,
                        label: "Voice Library",
                      },
                    },

                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "02MhLZ-4nqL8v-p6hne0",
                    title: { text: "Admin Panel", icon: <AppIcon /> },
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<CatchAllNavigate to="/signin" />}
                        >
                          <ThemedLayoutV2 Header={Header} Sider={Sider}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      }
                    >
                      <Route
                        index
                        element={<Dashboard />}
                      />
                      <Route path="/dashboard" element={<Dashboard />} />

                      <Route path="/organizations">
                        <Route index element={<OrganizationList />} />
                        <Route path="create" element={<OrganizationCreate />} />
                        <Route path="edit/:id" element={<OrganizationEdit />} />
                        <Route path="show/:id" element={<OrganizationShow />} />
                      </Route>
                      <Route path="/assistants">
                        <Route index element={<AssistantList />} />
                        <Route path="create" element={<AssistantCreate />} />
                        <Route path="edit/:id" element={<AssistantEdit />} />
                        <Route path="show/:id" element={<AssistantShow />} />
                      </Route>
                      <Route path="/tools">
                        <Route index element={<ToolList />} />
                        <Route path="create" element={<ToolCreate />} />
                        <Route path="edit/:id" element={<ToolEdit />} />
                        <Route path="show/:id" element={<ToolShow />} />
                      </Route>
                      <Route path="/voice-library">
                        <Route index element={<VoiceLibraryList />} />
                      </Route>
                      <Route path="/api-keys">
                        <Route index element={<ApiKeyList />} />
                        <Route path="create" element={<ApiKeyCreate />} />
                        <Route path="edit/:id" element={<ApiKeyEdit />} />
                        <Route path="show/:id" element={<ToolShow />} />
                      </Route>
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-outer"
                          fallback={<Outlet />}
                        >
                          <CustomNavigateToResource />
                        </Authenticated>
                      }
                    >
                                          <Route path="/signin" element={<Signin />} />
                    <Route path="/login" element={<Navigate to="/signin" replace />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/register" element={<Navigate to="/signup" replace />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </RefineSnackbarProvider>
          </ColorModeContextProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;