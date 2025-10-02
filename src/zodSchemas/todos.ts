import { Category } from "@/enums/category";
import * as z from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(200, "Description must be at most 200 characters"),
  categories: z.nativeEnum(Category),
  priority: z.number().min(1, "Priority must be between 1 and 10").max(10),
  deadline: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Deadline must be in the future",
  }),
  complete: z.boolean().optional(),
});
