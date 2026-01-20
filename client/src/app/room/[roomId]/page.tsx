"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { toast } from 'sonner';

export default function RoomPage() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();
    const {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        toggleAudio,
        toggleVideo,
        remoteStream,
        connectionStatus
    } = useWebRTC(roomId);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);

    // Toast notifications for connection status
    useEffect(() => {
        if (isConnected) {
            toast.success("Secure connection established!");
        }
    }, [isConnected]);

    useEffect(() => {
        if (remoteStream) {
            toast.info("Peer video stream received");
        }
    }, [remoteStream]);

    // Attach remote stream when available
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, remoteVideoRef]);

    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background relative overflow-hidden flex flex-col items-center justify-center p-4">

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            {/* Header / Status Pill */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-3 items-center w-full px-4 md:auto">
                {/* Connection Status Badge */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
                >
                    <div className={cn("h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
                        isConnected ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500"
                    )} />
                    <span className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">
                        {isConnected ? "Live Secure Connection" : connectionStatus || "Connecting..."}
                    </span>
                </motion.div>

                {/* Room ID Copy Button - Only show if not connected or just as useful info */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomId}
                    className="text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors gap-2"
                >
                    Room: <span className="font-mono bg-white/5 px-1 rounded">{roomId}</span>
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
            </div>

            {/* Video Grid */}
            <div className="w-full max-w-6xl flex-1 flex flex-col md:flex-row gap-4 items-center justify-center p-2 md:p-6 transition-all duration-500 ease-in-out relative z-10">

                {/* Remote Video (Main Stage) */}
                {remoteStream && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        layout
                        className="relative w-full md:flex-1 h-1/2 md:h-full max-h-[70vh] md:max-h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-black/40 ring-1 ring-white/10 group order-1 md:order-2"
                    >
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full flex items-center gap-2">
                            <Users className="h-3 w-3 text-white/70" />
                            <span className="text-white/90 text-xs font-medium tracking-wide">Peer</span>
                        </div>
                    </motion.div>
                )}

                {/* Local Video */}
                <motion.div
                    layout
                    className={cn(
                        "relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-black/40 ring-1 ring-white/10 transition-all duration-500 ease-in-out",
                        // When remote stream exists, Local video becomes smaller (Picture-in-Picture style or side stack)
                        remoteStream
                            ? "w-1/3 md:w-64 aspect-[3/4] md:aspect-video md:absolute md:bottom-24 md:right-8 lg:right-12 z-30 shadow-xl order-2 md:order-1"
                            : "w-full max-w-4xl aspect-video mx-auto order-1"
                    )}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={cn("w-full h-full object-cover transform scale-x-[-1]", isVideoOff && "invisible")}
                    />

                    {/* Self Label */}
                    <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full backdrop-blur-md">
                        <span className="text-white/90 text-xs font-medium tracking-wide">You</span>
                    </div>

                    {/* Camera Off State */}
                    {isVideoOff && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm gap-3">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                                <VideoOff className="h-6 w-6 text-white/50" />
                            </div>
                            <span className="text-white/50 text-sm">Camera Off</span>
                        </div>
                    )}
                </motion.div>

                {/* Waiting State (If no remote stream) */}
                {!remoteStream && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
                            <div className="relative">
                                <div className="h-2 w-2 bg-primary rounded-full animate-ping absolute inset-0" />
                                <div className="h-2 w-2 bg-primary rounded-full relative" />
                            </div>
                            <span className="text-sm font-medium text-white/80">Waiting for peer to join...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute bottom-6 md:bottom-8 z-50"
            >
                <div className="glass p-2 rounded-[2rem] flex items-center gap-2 md:gap-4 shadow-2xl ring-1 ring-white/10 px-4 md:px-6 py-3">
                    <Button
                        variant={isMuted ? "destructive" : "secondary"}
                        size="icon"
                        className={cn(
                            "h-12 w-12 md:h-14 md:w-14 rounded-full transition-all duration-300 shadow-md",
                            !isMuted && "bg-white/10 hover:bg-white/20 text-white border-0"
                        )}
                        onClick={handleToggleMic}
                    >
                        {isMuted ? <MicOff className="h-5 w-5 md:h-6 md:w-6" /> : <Mic className="h-5 w-5 md:h-6 md:w-6" />}
                    </Button>

                    <Button
                        variant={isVideoOff ? "destructive" : "secondary"}
                        size="icon"
                        className={cn(
                            "h-12 w-12 md:h-14 md:w-14 rounded-full transition-all duration-300 shadow-md",
                            !isVideoOff && "bg-white/10 hover:bg-white/20 text-white border-0"
                        )}
                        onClick={handleToggleVideo}
                    >
                        {isVideoOff ? <VideoOff className="h-5 w-5 md:h-6 md:w-6" /> : <Video className="h-5 w-5 md:h-6 md:w-6" />}
                    </Button>

                    <div className="w-px h-8 bg-white/10 mx-1 md:mx-2" />

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                        onClick={handleLeave}
                    >
                        <PhoneOff className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
