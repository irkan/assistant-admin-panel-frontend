import { DataProvider } from "@refinedev/core";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://46.62.135.5:3003";

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("refine-auth");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Map frontend resource names to backend API endpoints
const mapResource = (resource: string): string => {
  if (resource === "assistants") {
    return "agents";
  }
  if (resource === "tools") {
    return "tools";
  }
  if (resource === "api-keys") {
    return "api-keys";
  }
  return resource;
};

export const dataProvider: DataProvider = {
  getApiUrl: () => API_BASE_URL,
  getList: async ({ resource, pagination }) => {
    const { current = 1, pageSize = 50 } = pagination ?? {};
    const offset = (current - 1) * pageSize;
    const mappedResource = mapResource(resource);
    
    const url = `${API_BASE_URL}/api/${mappedResource}?limit=${pageSize}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data.data || [],
      total: data.pagination?.total || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const mappedResource = mapResource(resource);
    const response = await fetch(`${API_BASE_URL}/api/${mappedResource}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data.data,
    };
  },

  create: async ({ resource, variables }) => {
    const mappedResource = mapResource(resource);
    const response = await fetch(`${API_BASE_URL}/api/${mappedResource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Create failed");
    }

    const data = await response.json();

    return {
      data: data.data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const mappedResource = mapResource(resource);
    const response = await fetch(`${API_BASE_URL}/api/${mappedResource}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Update failed");
    }

    const data = await response.json();

    return {
      data: data.data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const mappedResource = mapResource(resource);
    const response = await fetch(`${API_BASE_URL}/api/${mappedResource}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Delete failed");
    }

    return {
      data: {} as any,
    };
  },

  getMany: async ({ resource, ids }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/api/${resource}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }).then((res) => res.json())
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return {
      data,
    };
  },

  createMany: async ({ resource, variables }) => {
    const promises = variables.map((variable) =>
      fetch(`${API_BASE_URL}/api/${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(variable),
      }).then((res) => res.json())
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return {
      data,
    };
  },

  updateMany: async ({ resource, ids, variables }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/api/${resource}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(variables),
      }).then((res) => res.json())
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return {
      data,
    };
  },

  deleteMany: async ({ resource, ids }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/api/${resource}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      })
    );

    await Promise.all(promises);

    return {
      data: [] as any,
    };
  },

  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = `${API_BASE_URL}${url}`;

    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      requestUrl += `?${searchParams.toString()}`;
    }

    const response = await fetch(requestUrl, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    const data = await response.json();

    return {
      data: data.data || data,
    };
  },
}; 