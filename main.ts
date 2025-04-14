// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const kv = await Deno.openKv("http://10.10.40.9:4512");

  await kv.set(["users", "alice"], {
    name: "Alice",
    birthday: new Date(2018, 5, 13),
  });

  const { value } = await kv.get(["users", "alice"]);
  console.log(value);
}
