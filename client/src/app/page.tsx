"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video, Users, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = () => {
    setIsLoading(true);
    // Simulate a brief "creation" delay for effect
    setTimeout(() => {
      // Generate 4-character alphanum code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let newRoomId = "";
      for (let i = 0; i < 4; i++) {
        newRoomId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      router.push(`/room/${newRoomId}`);
      toast.success("Room created!");
    }, 600);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      toast.error("Please enter a valid Room ID");
      return;
    }
    setIsLoading(true);

    if (socket) {
      let checked = false;

      socket.emit('check-room', roomId, (response: { exists: boolean }) => {
        checked = true;
        if (response.exists) {
          router.push(`/room/${roomId}`);
          toast.success("Joining room...");
        } else {
          toast.error("Room not found! Please check the ID.");
          setIsLoading(false);
        }
      });

      setTimeout(() => {
        if (!checked) {
          toast.warning("Server silent, trying to join anyway...");
          router.push(`/room/${roomId}`);
        }
      }, 2000);

    } else {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background flex flex-col relative overflow-hidden">

      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-900/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />

      {/* Navbar Placeholder */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-tr from-primary to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">One2One</span>
        </div>
        <Button variant="ghost" className="text-muted-foreground hover:text-primary">About</Button>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl text-center space-y-8 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-4 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live P2P Video Calling
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-tight">
            Connect Instantly,<br /> Anywere.
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Experience crystal clear, secure, and limitless video calls. No sign-ups, no downloads—just a link.
          </p>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative glass p-8 rounded-2xl space-y-6">

              <Button
                className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                size="lg"
                onClick={createRoom}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Zap className="mr-2 h-5 w-5 fill-current" />
                )}
                Start Instant Meeting
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/50"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">Or join with code</span>
                <div className="flex-grow border-t border-border/50"></div>
              </div>

              <form onSubmit={joinRoom} className="flex flex-col gap-4">
                <div className="relative w-full max-w-[280px] mx-auto scale-110">
                  {/* Hidden Input for Logic */}
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                      setRoomId(val);
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                    autoFocus
                  />

                  {/* Visual Split Boxes */}
                  <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((index) => {
                      const char = roomId[index] || "";
                      const isActive = roomId.length === index;
                      const isFilled = roomId.length > index;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "w-14 h-16 rounded-xl border flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-sm backdrop-blur-md",
                            // Border & Ring Logic
                            isActive
                              ? "border-primary ring-2 ring-primary/30 bg-white/10 scale-105 z-10"
                              : isFilled
                                ? "border-white/20 bg-white/5"
                                : "border-white/5 bg-black/20",
                            // Text Color
                            isFilled ? "text-white" : "text-white/30"
                          )}
                        >
                          {char}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={roomId.length < 4}
                  className={cn(
                    "w-full h-12 text-lg transition-all duration-300",
                    roomId.length === 4
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  Join Room <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-center px-4"
        >
          {[
            { icon: ShieldCheck, title: "End-to-End Secure", desc: "Available exclusively on secure connections." },
            { icon: Users, title: "Unlimited Peers", desc: "Join multiple users in a single room." },
            { icon: Globe, title: "Low Latency", desc: "Powered by WebRTC for real-time speed." },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center z-10">
        <p className="text-xs text-muted-foreground/60">
          &copy; 2026 One2One. Built with Next.js & WebRTC.
        </p>
      </footer>
    </div>
  );
}
