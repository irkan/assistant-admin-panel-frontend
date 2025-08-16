import type { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";
export const USER_KEY = "refine-user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://46.62.135.5:3003";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: data.message || "Login failed",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Network error. Please try again.",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        // Verify token by making a request to a protected endpoint
        const response = await fetch(`${API_BASE_URL}/api/users?limit=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return {
            authenticated: true,
          };
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          return {
            authenticated: false,
            redirectTo: "/login",
          };
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id,
          name: `${user.name} ${user.surname}`,
          avatar: "https://i.pravatar.cc/300",
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
