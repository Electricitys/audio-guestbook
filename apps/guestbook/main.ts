import app from "./src/server.ts";

const PORT = 8000;

console.log("Starting");
console.log(`PORT: ${PORT}`);

app.listen({ port: PORT });
