import Cookies from "js-cookie";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function registerUser(
  email: string,
  username: string,
  password: string
) {
  const res = await fetch(`${apiUrl}/auth/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error("Backend error:", err);
    throw new Error(err?.detail || "Something went wrong");
  }

  return res.json();
}

export async function loginUser(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Backend error:", err);
    throw new Error("Failed to login");
  }
  const data = await res.json();

  const expiresAt = new Date().getTime() + 15 * 60 * 1000;
  Cookies.set("access_token", data.access_token, {
    expires: new Date(expiresAt),
  });
  Cookies.set("expires_at", expiresAt.toString());

  return data;
}

export function getAccessToken() {
  return Cookies.get("access_token");
}

export function logoutUser() {
  Cookies.remove("access_token");
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      logoutUser();
      return false;
    }

    const data = await res.json();

    const expiresAt = new Date().getTime() + 15 * 60 * 1000;
    Cookies.set("access_token", data.access_token, {
      expires: new Date(expiresAt),
    });
    Cookies.set("expires_at", expiresAt.toString());
    return true;
  } catch (err) {
    console.error("Refresh token failed", err);
    logoutUser();
    return false;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  options.credentials = "include";

  let res = await fetch(`${apiUrl}${url}`, options);

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${getAccessToken()}`,
      };
      res = await fetch(`${apiUrl}${url}`, options);
    }
  }

  return res;
}
