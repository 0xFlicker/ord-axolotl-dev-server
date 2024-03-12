/*
based on: https://gist.github.com/elocremarc/3415e31549ba02f46d8d8e40d135f86b
Test server for inscriptions
Requires bun javascript runtime
Uses your local ordinal server on http://localhost:80
run your ord server with:
> ord server
Could also use https://ordinals.com if you don't have your ord server running
replace the host with https://ordinals.com
It will return inscriptions already inscribed in the /content/ route as well as all recursive routes under /r/
If you want to test out a file that is not inscribed put it into a folder /content/ it will serve those 
example /content/style.css
<link rel="stylesheet" href="/content/style.css">
run with:
> bun --watch Ordinal_Tester_Server.js
*/

import { readFile, stat } from "fs/promises";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import cbor from "cbor";
const { encode: cborEncode } = cbor;

const host = "http://localhost:5000";

const app = new Hono();

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

app.get("/", async () => {
  try {
    const content = await readFile("index.html", "utf8");
    return new Response(content, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
});

app.get("/content/*", async ({ req }) => {
  const fileExistsInContent = await fileExists(
    `.${decodeURIComponent(req.path)}`,
  );
  if (fileExistsInContent) {
    console.log(`Fetching local file: .${decodeURIComponent(req.path)}`);
    const content = await readFile(`.${decodeURIComponent(req.path)}`);
    const type = await fileTypeFromFile(`.${decodeURIComponent(req.path)}`);
    return new Response(content, {
      headers: {
        "Content-Type": type ? type.mime : "application/octet-stream",
      },
    });
  }

  try {
    const response = await fetch(`${host}/content/${inscriptionId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    return new Response(await response.blob(), {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});

app.get("/r/metadata/:inscriptionId", async ({ req }) => {
  async function fallback() {
    console.log("Metadata not found, returning local metadata");
    const content = await readFile("./metadata.json", "utf8");
    const metadata = JSON.parse(content);
    const c = cborEncode(metadata);
    return new Response(JSON.stringify(c.toString("hex")), {
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const response = await fetch(`${host}${req.path}`);
    if (!response.ok) {
      return fallback();
    }
    const res = await response.json();
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return fallback();
  }
});

app.get("/r/*", async ({ req }) => {
  async function fallback() {
    console.log("Recursive endpoint not found, returning local metadata");
    const content = await readFile(`.${req.path}`, "utf8");
    return new Response(content, {
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const response = await fetch(`${host}${req.path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res = await response.json();
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return fallback();
  }
});

serve({
  fetch: app.fetch,
  port: 6969,
});

console.log(`Listening on http://localhost:6969`);
