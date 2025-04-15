import app from "./src/server.ts";

const PORT = 8000;

console.log(`Server Listen on: http://localhost:${PORT}`);

app.listen({ port: PORT });
