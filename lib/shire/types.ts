import { z } from "zod";

/** Limits shared by the chat widget (UX) and the API route (enforcement). */
export const SHIRE_LIMITS = {
  /** Characters in a single visitor message. */
  messageChars: 600,
  /** Messages kept in a request (older ones are dropped client-side). */
  historyMessages: 10,
  /** Total characters across the whole request. */
  totalChars: 6000,
} as const;

export const shireMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(SHIRE_LIMITS.messageChars * 4),
});

export const shireRequestSchema = z
  .object({
    messages: z.array(shireMessageSchema).min(1).max(SHIRE_LIMITS.historyMessages),
    /** Page the visitor is on — light context only. */
    path: z.string().max(200).optional(),
  })
  .refine((v) => v.messages[v.messages.length - 1]?.role === "user", {
    message: "The last message must come from the visitor",
  })
  .refine(
    (v) =>
      v.messages
        .filter((m) => m.role === "user")
        .every((m) => m.content.length <= SHIRE_LIMITS.messageChars),
    { message: "Message too long" },
  )
  .refine(
    (v) => v.messages.reduce((sum, m) => sum + m.content.length, 0) <= SHIRE_LIMITS.totalChars,
    { message: "Conversation too long" },
  );

export type ShireMessage = z.infer<typeof shireMessageSchema>;

export type ShireResponse = { reply: string };
