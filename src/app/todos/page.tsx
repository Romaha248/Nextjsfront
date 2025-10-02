"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Category } from "@/enums/category";
import { createTodo, updateTodo, deleteTodo, getTodos } from "@/services/todo";
import { Todo } from "@/interfaces/todo";
import { todoSchema } from "@/zodSchemas/todos";

type TodoFormData = z.infer<typeof todoSchema>;

export default function TodosPage() {
  const [todosList, setTodosList] = useState<Todo[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: { categories: Category.OTHER, priority: 1, complete: false },
  });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await getTodos();
      setTodosList(data);
    } catch (err) {
      console.error("Failed to load todos:", err);
    }
  };

  const onSubmit = async (data: TodoFormData) => {
    const payload = {
      ...data,
      deadline: new Date(data.deadline).toISOString(),
    };

    try {
      if (editingTodoId) {
        const updated = await updateTodo(editingTodoId, payload);
        setTodosList(todosList.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTodo(payload);
        setTodosList([created, ...todosList]);
      }
      reset();
      setEditingTodoId(null);
    } catch (err) {
      console.error("Error saving todo:", err);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setValue("title", todo.title);
    setValue("description", todo.description);
    setValue("categories", todo.categories ?? Category.OTHER);
    setValue("priority", todo.priority);
    setValue("deadline", new Date(todo.deadline).toISOString().split("T")[0]);
    setValue("complete", todo.complete ?? false);
  };

  const deleteTodoById = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodosList((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      const updated = await updateTodo(todo.id, {
        ...todo,
        complete: !todo.complete,
      });
      setTodosList(todosList.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {editingTodoId ? "Edit Todo" : "My Todos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 mb-6"
          >
            <Input placeholder="Todo title..." {...register("title")} />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title.message}</p>
            )}

            <Input placeholder="Description..." {...register("description")} />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}

            <div className="flex gap-2 items-center">
              <Select
                value={watch("categories")}
                onValueChange={(v) => setValue("categories", v as Category)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min={1}
                max={10}
                {...register("priority", { valueAsNumber: true })}
                placeholder="Priority"
              />

              <Input type="date" {...register("deadline")} />

              <Button type="submit">{editingTodoId ? "Update" : "Add"}</Button>
            </div>
            {errors.deadline && (
              <p className="text-red-600 text-sm">{errors.deadline.message}</p>
            )}
          </form>

          <ul className="space-y-3">
            {todosList.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-2 border rounded-lg bg-white"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={todo.complete ?? false}
                    onCheckedChange={() => toggleComplete(todo)}
                  />
                  <div>
                    <span
                      className={
                        todo.complete ? "line-through text-gray-500" : ""
                      }
                    >
                      {todo.title}
                    </span>
                    <p className="text-sm text-gray-600">{todo.description}</p>
                    <span className="ml-2 text-sm text-gray-400">
                      [{todo.categories}] P{todo.priority} -{" "}
                      {new Date(todo.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(todo)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTodoById(todo.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
