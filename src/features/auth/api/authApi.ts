const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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

const MOCK_USERS = [
  { loginId: "admin", password: "admin123", authority: "ADMIN" as const, id: 1, name: "관리자" },
  { loginId: "worker", password: "worker123", authority: "USER" as const, id: 2, name: "직원" },
];

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const mock = MOCK_USERS.find(
    (u) => u.loginId === body.loginId && u.password === body.password
  );
  if (mock) return mock;

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!res.ok) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");

  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
