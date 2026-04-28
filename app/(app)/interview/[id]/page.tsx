"use client";

import { use } from "react";
import { VoiceProvider } from "@humeai/voice-react";
import { InterviewContent } from "@/components/interview/InterviewContent";

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <VoiceProvider
      onMessage={(message) => {
        // Only log assistant/user messages to reduce noise
        if (message.type === "assistant_message" || message.type === "user_message") {
          console.log("[Hume] message:", message.type, message.message?.content?.slice(0, 60));
        }
      }}
      onError={(error) => {
        // Log the real error details — Hume errors are often nested
        console.error("[Hume] erreur:", {
          message: (error as any)?.message ?? String(error),
          type: (error as any)?.type,
          code: (error as any)?.code,
          raw: error,
        });
      }}
      onClose={(event) => {
        console.log("[Hume] connexion fermée — code:", event?.code, "raison:", event?.reason);
      }}
    >
      <InterviewContent id={id} />
    </VoiceProvider>
  );
}