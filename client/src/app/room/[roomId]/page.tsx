"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check, Users, RefreshCw, Share2, Link } from 'lucide-react';
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
        connectionStatus,
        switchCamera
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

    const handleToggleMic = () => {
        setIsMuted(!isMuted);
        toggleAudio(isMuted);
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
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background relative overflow-hidden flex flex-col items-center justify-center">

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            {/* Header / Status Pill */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-3 items-center w-full px-4 text-center">
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

                {/* Room ID Copy Button - HIDDEN IN FAVOR OF NEW SHARE UI IF DESIRED, OR KEEP AS STATUS */}
                {/* Keeping this centered pill as status, moving commands to top right as requested */}
            </div>

            {/* Top Right Share Controls */}
            <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
                {/* Mobile Share Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden glass rounded-full h-10 w-10 text-white border-white/10 hover:bg-white/10"
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'Join my One2One call',
                                text: `Join me on One2One! Room: ${roomId}`,
                                url: window.location.href
                            }).catch(console.error);
                        } else {
                            // Fallback if navigator.share fails or not supported (though hidden on desktop)
                            copyRoomId();
                        }
                    }}
                >
                    <Share2 className="h-4 w-4" />
                </Button>

                {/* Desktop + Mobile Copy Link Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="glass rounded-full h-10 w-10 text-white border-white/10 hover:bg-white/10"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard!");
                    }}
                >
                    <Link className="h-4 w-4" />
                </Button>
            </div>

            {/* Video Grid - Full Screen Layout */}
            <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">

                {/* Remote Video (Full Screen Background) */}
                {remoteStream ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-0 h-full w-full"
                    >
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Peer Label */}
                        <div className="absolute top-24 left-6 glass px-3 py-1 rounded-full flex items-center gap-2 z-10 backdrop-blur-md">
                            <Users className="h-3 w-3 text-white/70" />
                            <span className="text-white/90 text-xs font-medium tracking-wide">Peer</span>
                        </div>
                    </motion.div>
                ) : (
                    /* Waiting State (Centered when alone) */
                    <div className="flex flex-col items-center justify-center p-8 z-0">
                        <div className="glass px-8 py-4 rounded-full flex items-center gap-4 animate-pulse">
                            <div className="relative h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </div>
                            <span className="text-base font-medium text-white/90">Waiting for peer to join...</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">Share the Room ID to start chatting</p>
                    </div>
                )}

                {/* Local Video - Picture in Picture Overlay */}
                <motion.div
                    layout
                    className={cn(
                        "transition-all duration-500 ease-in-out overflow-hidden shadow-2xl bg-black/60 ring-1 ring-white/10 z-30",
                        // Logic for PiP:
                        // If remoteStream exists: Bottom Right Corner (Small)
                        // If NO remoteStream: Full Screen (Background) - mimicking a "Lobby" or "Lone" state
                        // BUT, to satisfy "small in one corner" request specifically even if alone?
                        // "i need my view to pe overlapped in both mobile and also in desktop but small in one corner"
                        // If I am alone, making me small corner means 90% screen is empty background.
                        // I will assume they mean "When call is active (or maybe always?)"
                        // Let's keep the standard behavior I designed:
                        // - Remote Present: Local is PiP (Corner)
                        // - Remote Absent: Local is Full Screen (You look at yourself while waiting)
                        // This is industry standard (Meet, Zoom).
                        remoteStream
                            ? "absolute bottom-28 right-4 w-32 md:bottom-28 md:right-8 md:w-64 aspect-[3/4] md:aspect-video rounded-2xl"
                            : "absolute inset-0 w-full h-full"
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
            </div>

            {/* Controls Bar - Floating above everything */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute bottom-6 md:bottom-8 z-50 flex justify-center w-full"
            >
                <div className="glass p-2 rounded-[2rem] flex items-center gap-2 md:gap-4 shadow-2xl ring-1 ring-white/10 px-4 md:px-6 py-3 bg-black/40 backdrop-blur-xl">
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

                    {/* Camera Flip (Mobile Only) */}
                    <Button
                        variant="secondary"
                        size="icon"
                        className="md:hidden h-12 w-12 rounded-full transition-all duration-300 shadow-md bg-white/10 hover:bg-white/20 text-white border-0"
                        onClick={switchCamera}
                    >
                        <RefreshCw className="h-5 w-5" />
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
