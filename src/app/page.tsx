"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/enums/category";
import { Todo } from "@/interfaces/todo";

// Drag & Drop
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      title: "Learn Next.js",
      description: "Watch tutorials and read docs",
      priority: 3,
      complete: false,
      categories: Category.WORK,
      deadline: "2025-10-10",
    },
    {
      id: "2",
      title: "Build Todo App",
      description: "Connect frontend with FastAPI backend",
      priority: 5,
      complete: true,
      categories: Category.PERSONAL,
      deadline: "2025-10-15",
    },
    {
      id: "3",
      title: "Test App",
      description: "Check UI, toggle todos, CRUD with FastAPI backend",
      priority: 2,
      complete: false,
      categories: Category.OTHER,
      deadline: "2025-10-20",
    },
  ]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // --------------------
  // Handle drag end
  // --------------------
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setTodos(items);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Welcome to My Todos App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {todos.map((todo, index) => (
                    <Draggable
                      key={todo.id}
                      draggableId={todo.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-2 border rounded-lg bg-white ${
                            snapshot.isDragging ? "bg-gray-200" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              className="cursor-pointer"
                              checked={todo.complete}
                              onCheckedChange={() => toggleTodo(todo.id)}
                            />
                            <div>
                              <span
                                className={
                                  todo.complete
                                    ? "line-through text-gray-500"
                                    : ""
                                }
                              >
                                {todo.title}
                              </span>
                              <p className="text-sm text-gray-600">
                                {todo.description}
                              </p>
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
                            >
                              Edit
                            </Button>
                            <Button
                              className="cursor-pointer"
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          {todos.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No todos left.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
