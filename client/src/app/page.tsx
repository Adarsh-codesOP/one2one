"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
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
    setTimeout(() => {
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
    if (!roomId.trim()) return;
    setIsLoading(true);

    if (socket) {
      let checked = false;
      socket.emit('check-room', roomId, (response: { exists: boolean }) => {
        checked = true;
        if (response.exists) {
          router.push(`/room/${roomId}`);
          toast.success("Joining room...");
        } else {
          toast.error("Room not found!");
          setIsLoading(false);
        }
      });
      setTimeout(() => {
        if (!checked) {
          toast.warning("Server silent, trying...");
          router.push(`/room/${roomId}`);
        }
      }, 2000);
    } else {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden selection:bg-primary/30">

      {/* Deep Background Ambience - Static for performance */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          {/* Custom Abstract Logo */}
          <div className="relative h-10 w-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary relative z-10" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" className="opacity-20" />
              <path d="M8 12h8M12 8v8" strokeLinecap="round" strokeLinejoin="round" />
              {/* Abstract connection representation */}
              <path d="M12 2a10 10 0 0 1 10 10" className="opacity-60" />
              <circle cx="12" cy="12" r="4" className="fill-current" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">One2One</span>
        </div>
        <Button
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-full px-6"
          onClick={() => router.push('/about')}
        >
          About
        </Button>
      </nav>

      {/* Main Content - Centered & Minimal */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-5xl mx-auto">

        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-10 mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[0.9] drop-shadow-2xl">
            Pure Connection.
          </h1>
          <p className="text-xl text-white/40 max-w-lg mx-auto font-light leading-relaxed">
            No logins. No downloads. Just you and them.
          </p>
        </motion.div>

        {/* Floating Action Card - High Depth */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-[360px] relative group"
        >
          {/* Glow backing */}
          <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-purple-500/0 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />

          <div className="relative bg-[#0a0a0a] border border-white/5 p-2 rounded-[2rem] shadow-2xl flex flex-col gap-2 ring-1 ring-white/5">

            {/* Create Button */}
            <Button
              className="w-full h-16 rounded-[1.5rem] text-lg font-medium bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-[1.02]"
              onClick={createRoom}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
              ) : (
                <Zap className="mr-2 h-5 w-5 fill-current" />
              )}
              Start Instant Call
            </Button>

            {/* Separator - DISTINCT JOIN SECTION */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="absolute bg-[#0a0a0a] px-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">Or Join Room</span>
            </div>

            {/* Input Area (Join Section) */}
            <div className="bg-white/5 rounded-[1.5rem] p-4 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-white/20 group/input">
              <form onSubmit={joinRoom} className="flex gap-2 items-center">
                <div className="relative flex-1 h-12 sm:h-14 group/otp">
                  {/* Hidden Input for Logic */}
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                      setRoomId(val);
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-30 font-bold"
                  />

                  {/* Visual OTP Boxes - Minimalist (No individual focus glow) */}
                  <div className="absolute inset-0 flex gap-2 justify-center items-center pointer-events-none z-20">
                    {[0, 1, 2, 3].map((index) => {
                      const isFilled = roomId.length > index;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "h-full flex-1 rounded-lg flex items-center justify-center text-xl font-bold transition-all duration-200 border",
                            isFilled
                              ? "border-white/20 bg-white/10 text-white"
                              : "border-white/5 bg-black/20 text-white/5"
                          )}
                        >
                          {roomId[index] || ""}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={roomId.length < 4}
                  className={cn(
                    "h-12 w-12 sm:h-14 sm:w-14 rounded-xl transition-all duration-300 shrink-0",
                    roomId.length === 4
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/90"
                      : "bg-transparent text-white/10"
                  )}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer - Minimal */}
      <footer className="w-full p-8 text-center z-10">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/20">
          Secure • Private • Fast
        </div>
      </footer>
    </div>
  );
}
