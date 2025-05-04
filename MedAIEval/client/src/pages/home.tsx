import { useState } from "react";
import { useLocation } from "wouter";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleStartSession = (specialty: string, difficulty: string, count: number, topics: string) => {
    const queryParams = new URLSearchParams();
    queryParams.set('specialty', specialty);
    queryParams.set('difficulty', difficulty);
    queryParams.set('count', count.toString());
    if (topics) queryParams.set('topics', topics);
    
    setLocation(`/practice?${queryParams.toString()}`);
  };

  return <Dashboard onStartSession={handleStartSession} />;
}
