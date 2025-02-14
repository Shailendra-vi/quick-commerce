"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/signin");
    } else {
      router.push("/dashboard");
    }
  }, [token, router]);


  return token ? (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
    </div>
  ) : null;
}
