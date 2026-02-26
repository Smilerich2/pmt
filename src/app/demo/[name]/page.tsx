"use client";

import { Suspense } from "react";
import { use } from "react";
import demoRegistry from "@/demos/index";

export default function DemoPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const demo = demoRegistry[name];

  if (!demo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Demo &quot;{name}&quot; nicht gefunden.</p>
          <p className="text-sm mt-1 opacity-60">
            Stelle sicher, dass die Demo in der Registry eingetragen ist.
          </p>
        </div>
      </div>
    );
  }

  const Component = demo.component;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}
