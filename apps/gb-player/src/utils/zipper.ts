import { zip } from "@deno-library/compress";
import { parseArgs } from "@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["output"],
  alias: { o: "output" },
});

const src = flags["_"][0];
const dest = flags["output"];

if (!src || typeof src != "string") {
  throw new Error("`source` option are required.");
}
if (!dest) {
  throw new Error("`output` option are required.");
}

await zip.compress(src, dest);
// zip.uncompress(src, dest);
