"use client";

import { useEffect, useState } from "react";
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
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/services/todo";
import { Todo } from "@/interfaces/todo";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category>(Category.OTHER);
  const [priority, setPriority] = useState<number>(1);
  const [deadline, setDeadline] = useState<string>("");

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const todosFromServer = await getTodos();
      setTodos(todosFromServer);
    } catch (err) {
      console.error("Failed to load todos:", (err as Error).message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategories(Category.OTHER);
    setPriority(1);
    setDeadline("");
    setEditingTodoId(null);
  };

  const handleAddOrUpdateTodo = async () => {
    if (!title.trim() || !deadline) return;

    const [year, month, day] = deadline.split("-").map(Number);
    const now = new Date();
    const isoDeadline = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    ).toISOString();

    try {
      if (editingTodoId) {
        const updatedTodo = await updateTodo(editingTodoId, {
          title,
          description,
          categories,
          priority,
          deadline: isoDeadline,
        });
        console.log(updatedTodo);
        setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
      } else {
        const createdTodo = await createTodo({
          title,
          description,
          categories,
          priority,
          deadline: isoDeadline,
        });
        console.log(createdTodo);
        setTodos([createdTodo, ...todos]);
      }
      resetForm();
    } catch (err) {
      console.error(
        editingTodoId ? "Error updating todo:" : "Error creating todo:",
        (err as Error).message
      );
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
    setCategories(todo.categories ?? Category.OTHER);
    setPriority(todo.priority);
    setDeadline(new Date(todo.deadline).toISOString().split("T")[0]);
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const updated = await updateTodo(todo.id, {
        title: todo.title,
        description: todo.description,
        categories: todo.categories,
        priority: todo.priority,
        deadline: todo.deadline,
        complete: !todo.complete,
      });
      console.log(updated);
      setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle todo:", (err as Error).message);
    }
  };

  const deleteTodoById = async (id: string) => {
    try {
      const deleted = await deleteTodo(id);
      if (deleted) {
        console.log(`Todo ${id} deleted successfully`);
        setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to toggle todo:", (err as Error).message);
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
          <div className="flex flex-col gap-2 mb-6">
            <Input
              placeholder="Todo title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                value={categories}
                onValueChange={(value) => setCategories(value as Category)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(priority)}
                onValueChange={(value) => setPriority(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <Button
                onClick={handleAddOrUpdateTodo}
                className="cursor-pointer"
              >
                {editingTodoId ? "Update" : "Add"}
              </Button>
            </div>
          </div>

          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-2 border rounded-lg bg-white"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    className="cursor-pointer"
                    checked={todo.complete ?? false}
                    onCheckedChange={() => toggleTodo(todo)}
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
                    className="cursor-pointer"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(todo)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="cursor-pointer"
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
