// Sample file for ast-grep testing only (not part of build)
import foo from "@/lib/x";

console.log("hello");
console.info("info");
console.error("err");

const t = process.env.TEST_FLAG;

async function demo(autoMemory: any) {
  await autoMemory.retrieveRelevantContext("tool", { a: 1 }, "sess");
}

export default foo;

