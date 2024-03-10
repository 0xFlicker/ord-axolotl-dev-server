import { globIterate } from "glob";
import { writeFile, readFile } from "fs/promises";
import { stringify as yamlStringify } from "yaml";
import { spawnSync } from "child_process";

const inscriptionCache = JSON.parse(
  await readFile("tmp/inscription-ids.json", "utf8"),
);

const { layerParentInscriptionId: parentInscriptionId } = inscriptionCache;

const ASSETS_DIR = "./inscribe-me/assets/**/*.webp";

const batchYml = {
  mode: "shared-output",
  parent: parentInscriptionId,
  postage: 546,
  inscriptions: [],
};

for await (const file of globIterate(ASSETS_DIR)) {
  batchYml.inscriptions.push({
    file: file,
  });
}

console.log(`Inscribing ${batchYml.inscriptions.length} files`);
await writeFile("tmp/batch.yml", yamlStringify(batchYml), "utf8");
const { stdout, stderr, error } = spawnSync(
  "ord",
  [
    "--regtest",
    "wallet",
    "--server-url",
    "http://127.0.0.1:5000",
    "inscribe",
    "--fee-rate",
    "1",
    "--batch",
    "tmp/batch.yml",
  ],
  { encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 },
);
if (error) {
  console.error(stderr);
  process.exit(1);
}
console.log("done");
const response = JSON.parse(stdout);
const inscriptionJs = {};
for (let i = 0; i < response.inscriptions.length; i++) {
  const { id } = response.inscriptions[i];
  const file = batchYml.inscriptions[i].file.replace("inscribe-me/assets/", "");
  inscriptionJs[file] = id;
}

await writeFile(
  "tmp/inscriptions.js",
  `export default ${JSON.stringify(inscriptionJs, null, 2)}`,
  "utf8",
);
