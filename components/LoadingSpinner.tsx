"use client";

import { useEffect, useState } from "react";

interface Props {
  messages: string[];
}

export default function LoadingSpinner({ messages }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse-slow">
          ✨
        </div>
      </div>
      <p className="text-lg font-medium text-purple-600 animate-pulse text-center max-w-xs">
        {messages[msgIdx]}
      </p>
    </div>
  );
}
