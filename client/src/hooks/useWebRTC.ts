import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

export const useWebRTC = (roomId: string) => {
    const socket = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>("Initializing...");

    // Refs to avoid dependency cycles in callbacks
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null); // Added this

    // Logging helper
    const log = (msg: string, data?: any) => {
        console.log(`[WebRTC] ${msg}`, data || '');
    };

    const error = (msg: string, err?: any) => {
        console.error(`[WebRTC Error] ${msg}`, err || '');
    };

    useEffect(() => {
        const init = async () => {
            if (!socket) {
                setConnectionStatus("Socket not connected");
                return;
            }

            setConnectionStatus("Getting Media...");

            // 1. Get User Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                log("Local stream acquired", stream.id);
                setLocalStream(stream);
                localStreamRef.current = stream; // Update ref!

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. socket Join
                setConnectionStatus(`Joining room ${roomId}...`);
                log(`Joining room ${roomId} with socket ID: ${socket.id}`);
                socket.emit('join-room', roomId, socket.id);

                // 3. Set up listeners
                socket.on('user-connected', handleUserConnected);
                socket.on('offer', handleOffer);
                socket.on('answer', handleAnswer);
                socket.on('ice-candidate', handleIceCandidate);
                socket.on('user-disconnected', handleUserDisconnected);

            } catch (err) {
                error("Error accessing media devices:", err);
                setConnectionStatus("Error: Camera/Mic Access Denied");
            }
        };

        init();

        return () => {
            // Cleanup: stop tracks, close PC, off listeners
            log("Cleaning up WebRTC hook");
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            peerConnection.current?.close();
            if (socket) {
                socket.off('user-connected');
                socket.off('offer');
                socket.off('answer');
                socket.off('ice-candidate');
                socket.off('user-disconnected');
            }
        };
    }, [roomId, socket]);

    // Helpers to create PeerConnection if not exists
    const createPeer = (stream: MediaStream) => {
        if (peerConnection.current) {
            log("Reusing existing PeerConnection");
            return peerConnection.current;
        }

        log("Creating new PeerConnection");
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // Add local tracks
        stream.getTracks().forEach(track => {
            log(`Adding local track: ${track.kind}`);
            pc.addTrack(track, stream);
        });

        // Handle remote tracks
        pc.ontrack = (event) => {
            log("Remote track received", event.streams[0].id);
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                log("Sending ICE candidate");
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        // State change
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            log(`PC Connection State: ${state}`);
            setIsConnected(state === 'connected');
            setConnectionStatus(`Connection State: ${state}`);
        };

        peerConnection.current = pc;
        return pc;
    };

    const handleUserConnected = async (userId: string) => {
        log(`User connected: ${userId}. Creating offer...`);
        // USE REF HERE
        const stream = localStreamRef.current;
        if (!stream) {
            error("No local stream, cannot create offer");
            return;
        }

        try {
            const pc = createPeer(stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            log("Sending offer");
            socket?.emit('offer', {
                roomId,
                offer,
            });
        } catch (err) {
            error("Error creating offer", err);
        }
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
        log("Received offer");
        // USE REF HERE
        const stream = localStreamRef.current;
        if (!stream) {
            error("No local stream, cannot create answer");
            return;
        }

        try {
            const pc = createPeer(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            log("Sending answer");
            socket?.emit('answer', {
                roomId,
                answer,
            });
        } catch (err) {
            error("Error handling offer", err);
        }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
        log("Received answer");
        const pc = peerConnection.current;
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (err) {
                error("Error setting remote description (answer)", err);
            }
        }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
        const pc = peerConnection.current;
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
                error("Error adding ICE candidate", err);
            }
        }
    };

    const handleUserDisconnected = () => {
        log("User disconnected");
        setRemoteStream(null);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsConnected(false);
        setConnectionStatus("Peer disconnected");
    }

    // Toggle functions
    const toggleAudio = (enabled: boolean) => {
        // Safe access via ref
        localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = enabled);
    };

    const toggleVideo = (enabled: boolean) => {
        // Safe access via ref
        localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = enabled);
    };

    return {
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isConnected,
        connectionStatus,
        toggleAudio,
        toggleVideo
    };
};
