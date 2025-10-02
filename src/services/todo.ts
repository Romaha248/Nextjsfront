import { Todo } from "@/interfaces/todo";
import { fetchWithAuth } from "./auth";
import { Category } from "@/enums/category";

export interface CreateTodoRequest {
  title: string;
  description: string;
  categories: Category;
  priority: number;
  deadline: string;
}

export interface CreateTodoResponse extends Todo {
  id: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  categories?: Category;
  priority?: number;
  complete?: boolean;
  deadline?: string;
}

export type UpdateTodoResponse = Todo;

export async function getTodos(): Promise<Todo[]> {
  const res = await fetchWithAuth("/todos/all-todo", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to fetch todos");
  }

  const data: Todo[] = await res.json();
  return data;
}

export async function createTodo(
  todo: CreateTodoRequest
): Promise<CreateTodoResponse> {
  const res = await fetchWithAuth("/todos/create-todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  console.log(JSON.stringify(todo));

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create todo");
  }

  const data: CreateTodoResponse = await res.json();
  return data;
}

export async function updateTodo(
  todoId: string,
  todoData: UpdateTodoRequest
): Promise<UpdateTodoResponse> {
  const res = await fetchWithAuth(`/todos/update-todo/${todoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to update todo");
  }

  const data: UpdateTodoResponse = await res.json();
  return data;
}

export async function deleteTodo(todoId: string): Promise<boolean> {
  const res = await fetchWithAuth(`/todos/delete-todo/${todoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to delete todo");
  }

  return true;
}
