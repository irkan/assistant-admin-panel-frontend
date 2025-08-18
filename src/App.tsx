import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { Navigate } from "react-router";

import {
  OrganizationList,
  OrganizationCreate,
  OrganizationEdit,
  OrganizationShow,
} from "./pages/organizations";
import {
  AgentList,
  AgentCreate,
  AgentEdit,
  AgentShow,
} from "./pages/agents";
import {
  ToolList,
  ToolCreate,
  ToolEdit,
  ToolShow,
} from "./pages/tools";
import {
  ApiKeyList,
  ApiKeyCreate,
  ApiKeyEdit,
  ApiKeyShow,
} from "./pages/api-keys";
import { Dashboard } from "./pages/dashboard";
import { AppIcon } from "./components/app-icon";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { Signin } from "./pages/signin";
import { Signup } from "./pages/signup";
import { ForgotPassword } from "./pages/forgotPassword";

import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";

// Google Client ID - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

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
                      name: "organizations",
                      show: "/organizations/show/:id",
                      edit: "/organizations/edit/:id",
                      meta: {
                        canDelete: false,
                        icon: <span>🏢</span>,
                        hide: true, // Hide from sidebar
                      },
                    },
                    {
                      name: "assistants",
                      list: "/assistants",
                      create: "/assistants/create",
                      edit: "/assistants/edit/:id",
                      show: "/assistants/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <span>🤖</span>,
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
                        icon: <span>🔧</span>,
                        label: "Tools",
                      },
                    },
                    {
                      name: "api-keys",
                      list: "/api-keys",
                      create: "/api-keys/create",
                      edit: "/api-keys/edit/:id",
                      show: "/api-keys/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <span>🔑</span>,
                        label: "API Keys",
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
                          <ThemedLayoutV2 Header={Header}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      }
                    >
                      <Route
                        index
                        element={<Dashboard />}
                      />

                      <Route path="/organizations">
                        <Route index element={<OrganizationList />} />
                        <Route path="create" element={<OrganizationCreate />} />
                        <Route path="edit/:id" element={<OrganizationEdit />} />
                        <Route path="show/:id" element={<OrganizationShow />} />
                      </Route>
                      <Route path="/assistants">
                        <Route index element={<AgentList />} />
                        <Route path="create" element={<AgentCreate />} />
                        <Route path="edit/:id" element={<AgentEdit />} />
                        <Route path="show/:id" element={<AgentShow />} />
                      </Route>
                      <Route path="/tools">
                        <Route index element={<ToolList />} />
                        <Route path="create" element={<ToolCreate />} />
                        <Route path="edit/:id" element={<ToolEdit />} />
                        <Route path="show/:id" element={<ToolShow />} />
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
                          <NavigateToResource />
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