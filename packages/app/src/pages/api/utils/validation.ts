import {z as zod} from "zod";


export const createChatSchema = zod.object({
    name: zod.string().min(3).max(255),
    agent_name: zod.string().min(3).max(255),
    filtered_links: zod.array(zod.string()).optional(),
    webpage_url: zod.string().url().optional(),
    type: zod.enum(["webpage", "file"]).optional(),
})