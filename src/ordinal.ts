import { renderHtmlCanvas } from "./canvas/core.js";
import { operations, IAttributeMetadata } from "./generate.js";

declare global {
  interface Window {
    CBOR: any;
  }
}

function hexStringToArrayBuffer(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
    .buffer;
}

async function main() {
  // window URL will get us the inscription id via /content/:inscriptionId
  const inscriptionId = new URL(window.location.href).pathname.split("/").pop();
  // Fetch the metadata and decode with CBOR
  const { tokenId, revealedAt } = await fetch(
    `/r/metadata/${inscriptionId ? inscriptionId : "0"}`,
  )
    .then((r) => r.json())
    .then((r) => window.CBOR.decode(hexStringToArrayBuffer(r)));

  const canvas = document.querySelector("canvas#main") as HTMLCanvasElement;

  function findSrcForPath(path: string) {
    return `/content/assets/${path}`;
  }
  let currentMetadata: IAttributeMetadata | null = null;
  async function renderLayers(seedBytes: Uint8Array) {
    const { layers, metadata } = await operations(seedBytes, (imagePath) => {
      const img = document.createElement("img");
      img.src = findSrcForPath(imagePath);
      img.crossOrigin = "anonymous";
      return new Promise((resolve) => {
        img.onload = () => resolve(img);
      });
    });
    currentMetadata = metadata;
    const renderableCanvas = document.createElement("canvas");
    renderableCanvas.width = 569;
    renderableCanvas.height = 569;
    await renderHtmlCanvas(renderableCanvas, layers);
    // copy the image contents to the canvas
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(renderableCanvas, 0, 0);
  }

  function randomUint8ArrayOfLength(length: number) {
    const arr = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }

  async function getRevealedBlockHash(): Promise<ArrayBuffer | null> {
    let hash: string | null = null;
    try {
      const response = await fetch(`/r/blockhash/${revealedAt}`);
      hash = await response.json();
    } catch (e) {
      // nothing
      return null;
    }

    if (!hash) {
      try {
        const response = await fetch("/r/blockhash");
        if (response.status !== 200) {
          return randomUint8ArrayOfLength(32);
        }
        hash = await response.json();
      } catch (e) {
        return null;
      }
    }

    // use crypto to create a sha256 hash of the block hash + window.tokenId
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(hash + tokenId),
    );
    return hashBuffer;
  }

  async function getCurrentBlockHeight(): Promise<number | null> {
    try {
      return Number(await fetch("/r/blockheight").then((r) => r.json()));
    } catch (e) {
      return null;
    }
  }

  async function checkAndRenderLayers() {
    let isRevealed = false;
    const blockheight = await getCurrentBlockHeight();
    if (!blockheight || blockheight < revealedAt) {
      const remainingBlocks = blockheight ? revealedAt - blockheight : 99999999;
      // Return prereveal text
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 569, 569);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Revealing in progress...",
        canvas.width / 2,
        canvas.height / 2 - 20,
      );
      if (blockheight) {
        ctx.fillText(
          `Blocks remaining: ${remainingBlocks}`,
          canvas.width / 2,
          canvas.height / 2 + 20,
        );
      }
      isRevealed = false;
    } else {
      const hashBuffer = await getRevealedBlockHash();
      let seedBytes: Uint8Array;
      if (hashBuffer) {
        const hashArray = new Uint8Array(hashBuffer);
        seedBytes = new Uint8Array(hashArray.slice(0, 32));
        isRevealed = true;
      } else {
        seedBytes = randomUint8ArrayOfLength(32);
      }
      await renderLayers(seedBytes);
    }

    if (!isRevealed) {
      setTimeout(checkAndRenderLayers, 5000);
    }
  }
  checkAndRenderLayers();

  function resizeCanvas() {
    var scale = Math.min(window.innerWidth / 569, window.innerHeight / 569);
    canvas.style.width = 569 * scale + "px";
    canvas.style.height = 569 * scale + "px";
  }

  // Resize the canvas whenever the window size changes
  window.addEventListener("resize", resizeCanvas, false);

  // Initial canvas resize
  resizeCanvas();

  // on right click, save the image
  const downloadImage = (e: any) => {
    e.preventDefault();
    const data = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data;
    a.download = `${tokenId}.png`;
    a.click();
  };
  // Desktop
  canvas.addEventListener("contextmenu", downloadImage);
  // Mobile long press
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const timer = setTimeout(downloadImage, 2000, e);
    canvas.addEventListener("touchend", () => clearTimeout(timer));
  });

  // on press 'm', download the metadata
  window.addEventListener("keydown", (e) => {
    if (e.key === "m") {
      e.preventDefault();
      const data = JSON.stringify(
        {
          tokenId,
          ...currentMetadata,
        },
        null,
        2,
      );
      const a = document.createElement("a");
      a.href = "data:text/json;charset=utf-8," + encodeURIComponent(data);
      a.download = `${tokenId}.json`;
      a.click();
    }
  });
}

main();
