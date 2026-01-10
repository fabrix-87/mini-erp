// packages/backend/run-server.ts
try {
  await import("./server");
} catch (error) {
  console.error(error);
  process.exit(1);
}

export {};
