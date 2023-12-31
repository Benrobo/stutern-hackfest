import {z as zod} from "zod";


export const createChatSchema = zod.object({
    name: zod.string().min(3).max(255),
    agent_name: zod.string().min(3).max(255),
    filtered_links: zod.array(zod.string()).optional(),
    webpage_url: zod.string().url().optional(),
    type: zod.enum(["webpage", "file"]).optional(),
})


export const anonymousConversationSchema = zod.object({
  message: zod
    .string({
      required_error: "Message is required",
    })
    .min(1)
    .max(255),
  chatId: zod
    .string({
      required_error: "Active chat is required",
    })
    .min(1)
    .max(255),
  anonymous_id: zod
    .string({
      required_error: "Anonymous id is required",
    })
    .min(1)
    .max(255)
    .optional(),
});

export const assistantConversationSchema = zod.object({
  conversation_id:zod
    .string({
      required_error: "conversation ID is required",
    })
    .min(1)
    .max(255),
});

export const adminReplyToConversationSchema = zod.object({
  conversation_id: zod
    .string({
      required_error: "conversation ID is required",
    })
    .min(1)
    .max(255),
  message: zod.string({
    required_error: "Message is required",
  }).min(1).max(255),
});

export const collectUserInfoSchema = zod.object({
  email: zod.string().email({
    message: "Invalid email address provided",
  }),
  conversation_id: zod.string().min(1).max(255),
});

export const escallateChatSchema = zod.object({
  email: zod.string().email({
    message: "Invalid email address provided",
  }),
  name: zod.string(),
  chatId: zod.string().min(1).max(255),
});