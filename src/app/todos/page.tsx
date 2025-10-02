import { Suspense } from "react";
import TodosPageClient from "./TodosPageClient";

export default function TodosPageWrapper() {
  return (
    <Suspense
      fallback={<div className="text-center mt-10">Loading todos...</div>}
    >
      <TodosPageClient />
    </Suspense>
  );
}
