"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function RoomPage() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();
    const {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        toggleAudio,
        toggleVideo,
        remoteStream
    } = useWebRTC(roomId);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggleMic = () => {
        setIsMuted(!isMuted);
        toggleAudio(isMuted); // passed logic might need inversion depending on hook
    };

    const handleToggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        toggleVideo(isVideoOff);
    };

    const handleLeave = () => {
        router.push('/');
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-screen w-full bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Header / Status */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", isConnected ? "bg-green-500" : "bg-yellow-500")} />
                    <span className="text-sm font-medium">{isConnected ? "Connected" : "Waiting for peer..."}</span>
                </div>

                <Button variant="outline" size="sm" onClick={copyRoomId} className="bg-card/50 backdrop-blur-md rounded-full border-border/50">
                    <span className="mr-2 text-muted-foreground">Room ID:</span> {roomId}
                    {copied ? <Check className="ml-2 h-3 w-3 text-green-500" /> : <Copy className="ml-2 h-3 w-3" />}
                </Button>
            </div>

            {/* Video Grid */}
            <div className="w-full max-w-6xl flex-1 flex flex-col md:flex-row gap-4 items-center justify-center relative">

                {/* Local Video */}
                <motion.div
                    layout
                    className={cn(
                        "relative bg-muted rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border border-border/50",
                        remoteStream ? "w-full md:w-1/2 h-[40vh] md:h-auto aspect-video" : "w-full max-w-4xl h-[60vh] md:h-auto aspect-video"
                    )}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={cn("w-full h-full object-cover transform scale-x-[-1]", isVideoOff && "hidden")}
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                        <span className="text-white text-sm font-medium">You</span>
                    </div>
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <VideoOff className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Remote Video */}
                {remoteStream && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                            "relative bg-muted rounded-2xl overflow-hidden shadow-2xl border border-border/50",
                            "w-full md:w-1/2 h-[40vh] md:h-auto aspect-video" // Split screen when connected
                        )}
                    >
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <span className="text-white text-sm font-medium">Peer</span>
                        </div>
                        {/* Placeholder for remote video muted/off could go here if we sync state via socket */}
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-lg border border-border/50 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl z-20">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleToggleMic}
                >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleToggleVideo}
                >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <div className="w-px h-8 bg-border mx-2" />

                <Button
                    variant="destructive"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleLeave}
                >
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
