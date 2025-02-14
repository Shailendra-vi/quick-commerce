"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Delivery from "@/components/Delivery";
import Customer from "@/components/Customer";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, setUser } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
    }
    if (token && !user) {
      fetchUserRole();
      return;
    }

    async function fetchUserRole() {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
      } else {
        router.push("/signin");
      }
    }
  }, []);

  if (!user || !user.role) return <div>Loading...</div>;

  return user.role === "customer" ? <Customer /> : <Delivery />;
}
