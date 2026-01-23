"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Zap, Globe, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background flex flex-col relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-40 pointer-events-none" />

            {/* Navigation */}
            <nav className="p-6 max-w-7xl mx-auto w-full z-10">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="group text-muted-foreground hover:text-primary pl-0"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Button>
            </nav>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-start pt-12 px-4 relative z-10 max-w-3xl mx-auto text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        About One2One
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                        One2One is a peer-to-peer video calling platform built on the philosophy of simplicity and privacy.
                        We believe connecting with others shouldn't require accounts, downloads, or tracking.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="grid gap-8 w-full text-left"
                >
                    {[
                        {
                            icon: Shield,
                            title: "Privacy First",
                            desc: "Your calls are established directly between peers using WebRTC. No video data ever touches our servers."
                        },
                        {
                            icon: Zap,
                            title: "Lightning Fast",
                            desc: "By removing the middleman, we ensure the lowest possible latency for your conversations."
                        },
                        {
                            icon: Globe,
                            title: "Universal Access",
                            desc: "Works on any modern browser, on any device. Just share the link and connect."
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass p-6 rounded-2xl flex gap-4 items-start hover:bg-white/5 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-muted-foreground mb-4">Open Source & Community Driven</p>
                    <Button variant="outline" className="gap-2" onClick={() => window.open('https://github.com/Adarsh-codesOP/one2one', '_blank')}>
                        <Github className="h-4 w-4" />
                        View on GitHub
                    </Button>
                </motion.div>

            </main>
        </div>
    );
}
