// import type { ILayer, IMetadata, IImageFetcher } from "@0xflick/assets";

import {
  makeAccessoriesLayer,
  makeArmsLayer,
  makeBackgroundLayer,
  makeBaseLayer,
  makeSpecialOrHeadThingsLayer,
  makeOutlineLayer,
  makeTailLayer,
} from "./operations.js";
import { BaseColor } from "./types.js";
import * as weights from "./weights.js";
import { IMetadata } from "./metadata.js";
import { IImageFetcher } from "./canvas/cache.js";
import { ILayer } from "./canvas/core.js";
import {
  weightSampleFromWeights,
  mapWeightedValuesToRange,
} from "./canvas/utils.js";

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  let hexString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    let hex = uint8Array[i].toString(16);
    hex = hex.length === 1 ? "0" + hex : hex;
    hexString += hex;
  }
  return hexString;
}

export type IAttributeMetadata = Omit<
  IMetadata,
  "name" | "image" | "tokenId"
> & {
  seed: string;
};

export function generateTraits(_seed: Uint8Array) {
  let seed = _seed;
  const seedChomper = (range: number) => {
    if (range != 255) {
      throw new Error(`Expected a range of 255 but got ${range}`);
    }
    const value = seed[0];
    seed = seed.slice(1);
    return value;
  };
  const backgroundColor = weightSampleFromWeights(
    weights.backgroundWeights,
    seedChomper,
  );
  const baseColor = weightSampleFromWeights(weights.colorWeights, seedChomper);
  const split = weightSampleFromWeights(weights.splitWeights, seedChomper);
  let secondaryColor: BaseColor | undefined;
  if (split === "Split") {
    const colorWeightsCopy = { ...weights.colorWeights };
    delete colorWeightsCopy[baseColor];
    const secondaryColorWeights = mapWeightedValuesToRange(
      0,
      255,
      colorWeightsCopy,
    );
    secondaryColor = weightSampleFromWeights(
      secondaryColorWeights,
      seedChomper,
    ) as BaseColor;
  } else {
    // Eat the alt color
    seed = seed.slice(1);
  }
  const accessory = weightSampleFromWeights(
    weights.accessoryWeights,
    seedChomper,
  );
  const accessoryColor = weightSampleFromWeights(
    weights.accessoryColorWeights,
    seedChomper,
  );
  const tail = weightSampleFromWeights(weights.tailWeights, seedChomper);
  const arm = weightSampleFromWeights(weights.armWeights, seedChomper);
  const frills = weightSampleFromWeights(weights.frillWeights, seedChomper);
  const face = weightSampleFromWeights(weights.faceWeights, seedChomper);
  const mouth = weightSampleFromWeights(weights.mouthWeights, seedChomper);
  let mustache = weightSampleFromWeights(weights.mustacheWeights, seedChomper);
  const head = weightSampleFromWeights(weights.headWeights, seedChomper);
  const special = weightSampleFromWeights(
    weights.specialFeatureWeights,
    seedChomper,
  );
  // mustache not allowed with face === "Cloud Goggles", "Troll" or "Visor"
  if (["Cloud Goggles", "Troll", "Visor"].includes(face)) {
    mustache = "Clean Shaven";
  }
  const metadata: IAttributeMetadata = {
    seed: uint8ArrayToHexString(_seed),
    attributes: [
      {
        trait_type: "Background Color",
        value: backgroundColor,
      },
      {
        trait_type: "Base Color",
        value: baseColor,
      },
      ...(split === "Split" && typeof secondaryColor !== "undefined"
        ? [{ trait_type: "Secondary Color", value: secondaryColor }]
        : []),
      ...(special !== "None"
        ? [{ trait_type: "Special Feature", value: special }]
        : []),
      {
        trait_type: "Accessory",
        value: accessory,
      },
      ...(accessory === "Hoodie"
        ? [
            {
              trait_type: "Accessory Color",
              value: accessoryColor,
            },
          ]
        : []),
      {
        trait_type: "Tail",
        value: tail,
      },
      {
        trait_type: "Arm",
        value: arm,
      },
      {
        trait_type: "Frills",
        value: frills,
      },
      {
        trait_type: "Face",
        value: face,
      },
      {
        trait_type: "Mouth",
        value: mouth,
      },
      {
        trait_type: "Facial Hair",
        value: mustache,
      },
      {
        trait_type: "Head",
        value: head,
      },
    ],
  };
  return {
    metadata,
    arm,
    special,
    accessory,
    accessoryColor,
    backgroundColor,
    baseColor,
    split,
    secondaryColor,
    tail,
    face,
    frills,
    mouth,
    head,
    mustache,
  };
}

export async function operations(
  _seed: Uint8Array,
  imageFetcher: IImageFetcher,
): Promise<{
  metadata: IAttributeMetadata;
  layers: ILayer[];
}> {
  const {
    metadata,
    arm,
    special,
    accessory,
    accessoryColor,
    backgroundColor,
    baseColor,
    secondaryColor,
    tail,
    face,
    frills,
    mouth,
    head,
    mustache,
  } = generateTraits(_seed);
  return {
    metadata,
    layers: [
      makeBackgroundLayer({ color: backgroundColor }, imageFetcher),
      await makeBaseLayer(
        { color: baseColor, splitColor: secondaryColor },
        imageFetcher,
      ),
      ...(await makeAccessoriesLayer(
        {
          accessoryType: accessory,
          color: accessoryColor,
        },
        imageFetcher,
      )),
      ...(await makeArmsLayer(
        {
          armType: arm,
          color: baseColor,
          splitColor: secondaryColor,
        },
        imageFetcher,
      )),
      ...(await makeSpecialOrHeadThingsLayer(
        {
          frillType: frills,
          faceType: face,
          mouthType: mouth,
          headType: head,
          specialType: special,
          color: baseColor,
          splitColor: secondaryColor,
          mustache: mustache === "Mustache",
        },
        imageFetcher,
      )),
      makeOutlineLayer(imageFetcher),
      ...(await makeTailLayer(
        {
          color: baseColor,
          splitColor: secondaryColor,
          tailType: tail,
        },
        imageFetcher,
      )),
    ],
  };
}
