const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  whatsapp_number: string;
  password: string;
}

interface LoginPayload {
  identifier: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    role: string; 
  };
}

export const registerUser = async (userData: RegisterPayload) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Registrasi gagal");
  }

  return result;
};

export const registerAdmin = async (userData: RegisterPayload) => {
  const response = await fetch(`${API_BASE_URL}/register/admin`, { // Endpoint berbeda
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Registrasi Admin gagal");
  }

  return result;
};

export const loginUser = async (credentials: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Login gagal");

  if (typeof window !== "undefined" && result?.data?.access_token) {
    localStorage.setItem("access_token", result.data.access_token);
    localStorage.setItem("refresh_token", result.data.refresh_token);
    // Opsional: Simpan role di localStorage untuk pengecekan cepat di Navbar
    localStorage.setItem("user_role", result.data.role); 
  }

  return result as LoginResponse;
};


export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};