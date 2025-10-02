"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <Link href={"/"} className="text-xl font-bold">
        My Todos
      </Link>

      <nav className="flex gap-4">
        {user ? (
          <>
            <Link href="/todos">
              <Button variant="outline">Todos</Button>
            </Link>
            <Button variant="default" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="default">Register</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
