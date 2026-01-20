import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
    ],
};

export const useWebRTC = (roomId: string) => {
    const socket = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs to avoid dependency cycles in callbacks
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const init = async () => {
            if (!socket) return;

            // 1. Get User Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. socket Join
                socket.emit('join-room', roomId, socket.id);

                // 3. Set up listeners
                socket.on('user-connected', handleUserConnected);
                socket.on('offer', handleOffer);
                socket.on('answer', handleAnswer);
                socket.on('ice-candidate', handleIceCandidate);
                socket.on('user-disconnected', handleUserDisconnected);

            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        init();

        return () => {
            // Cleanup: stop tracks, close PC, off listeners
            localStream?.getTracks().forEach(track => track.stop());
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
        if (peerConnection.current) return peerConnection.current;

        const pc = new RTCPeerConnection(RTC_CONFIG);

        // Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Handle remote tracks
        pc.ontrack = (event) => {
            console.log("Remote track received");
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        // State change
        pc.onconnectionstatechange = () => {
            console.log("PC Connection State:", pc.connectionState);
            setIsConnected(pc.connectionState === 'connected');
        };

        peerConnection.current = pc;
        return pc;
    };

    const handleUserConnected = async (userId: string) => {
        console.log("User connected, creating offer", userId);
        if (!localStream) return;

        const pc = createPeer(localStream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.emit('offer', {
            roomId,
            offer,
        });
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
        console.log("Received offer");
        if (!localStream) return; // Should optimize to wait for stream

        const pc = createPeer(localStream);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket?.emit('answer', {
            roomId,
            answer,
        });
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
        console.log("Received answer");
        const pc = peerConnection.current;
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
        const pc = peerConnection.current;
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    const handleUserDisconnected = () => {
        setRemoteStream(null);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        // Optionally close PC and reset
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsConnected(false);
    }

    // Toggle functions
    const toggleAudio = (enabled: boolean) => {
        localStream?.getAudioTracks().forEach(track => track.enabled = enabled);
    };

    const toggleVideo = (enabled: boolean) => {
        localStream?.getVideoTracks().forEach(track => track.enabled = enabled);
    };

    return {
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isConnected,
        toggleAudio,
        toggleVideo
    };
};
