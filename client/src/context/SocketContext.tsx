"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to the backend
        const URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

        console.log("Connecting to socket at:", URL);
        const newSocket = io(URL, {
            transports: ['websocket'], // Force websocket
        });
        setSocket(newSocket);

        // Debugging connection
        newSocket.on('connect', () => {
            console.log("Socket Connected:", newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error("Socket Connection Error:", err);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
