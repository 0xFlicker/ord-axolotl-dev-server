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

app.get("/content/:inscriptionId", async ({ req }) => {
  const inscriptionId = req.param("inscriptionId");
  const fileExistsInContent = await fileExists(`./content/${inscriptionId}`);
  if (fileExistsInContent) {
    const content = await readFile(`./content/${inscriptionId}`);
    const type = await fileTypeFromFile(`./content/${inscriptionId}`);
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
  try {
    const response = await fetch(`${host}${req.path}`);
    if (!response.ok && response.status === 400) {
      console.log("Metadata not found, returning local metadata");
      const content = await readFile("./metadata.json", "utf8");
      const metadata = JSON.parse(content);
      const c = cborEncode(metadata);
      return new Response(JSON.stringify(c.toString("hex")), {
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await response.json();
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});

app.get("/r/*", async ({ req }) => {
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
    return new Response(error.message, { status: 500 });
  }
});

serve({
  fetch: app.fetch,
  port: 6969,
});

console.log(`Listening on http://localhost:6969`);
