import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import api from "../../utils/api";
import { useAuth } from "../AuthContext/AuthContext";
import NegotiationContext from "./NegotiationContext";

export default function NegotiationProvider({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth();
  const navigate = useNavigate();
  const [hasActiveNeg, setHasActiveNeg] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // check for an active negotiation when user logs in (regular or business)
  // also clear when user logs out (token becomes null)
  // wrapped in async fn so all setState calls are deferred — avoids sync setState-in-effect warning
  useEffect(() => {
    async function checkActiveNeg() {
      if (!token || (role !== "regular" && role !== "business")) {
        setHasActiveNeg(false);
        return;
      }
      try {
        // null means no active negotiation
        const res = await api.get("/negotiations/me");
        setHasActiveNeg(res.data !== null);
      } catch {
        setHasActiveNeg(false);
      }
    }
    checkActiveNeg();
  }, [token, role]);

  // maintain a global socket to catch negotiation:started from any page
  useEffect(() => {
    if (!token || (role !== "regular" && role !== "business")) return;

    // allow polling fallback for production environments (e.g. railway) where
    // websocket upgrades may not be available immediately
    const socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    // navigate to role-appropriate negotiation page when one starts
    // skip navigation if already on the page — the initiating party navigates via REST response
    socket.on("negotiation:started", () => {
      setHasActiveNeg(true);
      const target = role === "business" ? "/business/negotiations/me" : "/negotiations/me";
      if (!window.location.pathname.endsWith("/negotiations/me")) {
        navigate(target);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, role, backendUrl, navigate]);

  return (
    <NegotiationContext.Provider value={{ hasActiveNeg, setHasActiveNeg }}>
      {children}
    </NegotiationContext.Provider>
  );
}
