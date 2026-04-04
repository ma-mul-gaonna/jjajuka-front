
interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  loginId: string;
  authority: "ADMIN" | "USER";
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!res.ok) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");

  const data = await res.json();
  return {
    ...data,
    authority: data.authority === "ADMIN" ? "ADMIN" : "USER",
  };
}

export async function logout(): Promise<void> {
  await fetch(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
