"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, setUser, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <nav className="flex w-full justify-between items-center">
        {user ? (
          <>
            <Link href={"/todos"} className="text-xl font-bold">
              My Todos
            </Link>
            <Button variant="default" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href={"/"} className="text-xl font-bold">
              My Todos
            </Link>
            <div>
              <Link href="/login" className="mr-3">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="default">Register</Button>
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
