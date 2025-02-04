import { z } from "zod";
import { insertProductSchema } from "@/lib/validators";

// add additional data from z validator
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};
