"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const newRoomId = crypto.randomUUID().slice(0, 8); // Simple ID
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">One2One</h1>
          <p className="text-muted-foreground text-lg">
            Premium, secure video calling for everyone.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Create a new meeting or join an existing one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-11 text-base group"
              size="lg"
              onClick={createRoom}
            >
              <Users className="mr-2 h-4 w-4" />
              Create New Room
              <ArrowRight className="ml-2 h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or join with ID</span>
              </div>
            </div>

            <form onSubmit={joinRoom} className="flex space-x-2">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="h-11"
              />
              <Button type="submit" variant="secondary" className="h-11">
                Join
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground flex items-center">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Secure, P2P, and free forever.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
