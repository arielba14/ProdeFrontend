// api.js
const API_URL = import.meta.env.VITE_API_URL;

// 👉 Helper para manejar respuestas y errores
// api.js
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const json = contentType && contentType.includes("application/json")
    ? await response.json()
    : { error: "Respuesta inesperada del servidor" };

  // Si el token está vencido o no autorizado
  if (response.status === 401) {
    localStorage.removeItem("token");
    // Podés redirigir directamente al login
    window.location.href = "/login";
    throw new Error("Sesión expirada, vuelve a iniciar sesión");
  }

  if (!response.ok) {
    return { error: json.error || "Error en la petición" };
  }

  return json;
};

// 👉 Login
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// 👉 Registro
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// 👉 Helper para validar token
const getAuthHeader = (token) => {
  if (!token || token === "undefined" || token === "null") {
    throw new Error("No hay token válido disponible");
  }
  return { Authorization: `Bearer ${token}` };
};

// 👉 GET genérico
export const apiGet = async (endpoint, token) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
  });

  return handleResponse(response);
};

// 👉 POST genérico
export const apiPost = async (endpoint, token, body = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

// 👉 PUT genérico
export const apiPut = async (endpoint, token, body = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

// 👉 DELETE genérico
export const apiDelete = async (endpoint, token) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(token),
    },
  });
  return handleResponse(response);
};