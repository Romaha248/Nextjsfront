import { Category } from "@/enums/category";

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: number;
  complete?: boolean;
  categories?: Category;
  deadline: string;
}
