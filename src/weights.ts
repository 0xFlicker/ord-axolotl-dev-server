import { mapWeightedValuesToRange } from "./canvas/utils.js";
import {
  BackgroundColors,
  BaseColor,
  HoodieColor,
  IAccessoriesType,
  IArmType,
  IFaceType,
  IFrillType,
  IHeadType,
  IMouthType,
  ISpecialType,
  TailTypes,
} from "./types.js";

export type IWeights<AttributeType extends string> = {
  [key in AttributeType]: number;
};

export const backgroundWeights: IWeights<BackgroundColors> =
  mapWeightedValuesToRange(0, 255, {
    Blue: 40,
    Gold: 7,
    Lime: 3,
    Pink: 20,
    Salmon: 20,
    Turquoise: 20,
    White: 1,
  });

export const tailWeights: IWeights<TailTypes> = mapWeightedValuesToRange(
  0,
  255,
  {
    Normal: 6,
    Curled: 3,
    Wiggles: 1,
    Short: 0.5,
  },
);

export const colorWeights: IWeights<BaseColor> = mapWeightedValuesToRange(
  0,
  255,
  {
    Pink: 30.25,
    Peach: 24,
    Brown: 16,
    White: 20,
    Gold: 0.5,
    Diamond: 0.25,
    Lime: 1,
    Black: 10,
  },
);

export const splitWeights: IWeights<"Split" | "Not Split"> =
  mapWeightedValuesToRange(0, 255, {
    Split: 2,
    "Not Split": 48,
  });

export const specialFeatureWeights: IWeights<ISpecialType> =
  mapWeightedValuesToRange(0, 255, {
    None: 98.5,
    "Skull Face": 0.5,
    "TV Head": 0.5,
    "Giant Eye": 0.5,
  });

export const armWeights: IWeights<IArmType> = mapWeightedValuesToRange(0, 255, {
  Claws: 8,
  Paws: 2,
});

export const frillWeights: IWeights<IFrillType> = mapWeightedValuesToRange(
  0,
  255,
  {
    Short: 2,
    Wide: 3,
    Thin: 4,
    Wiggles: 1,
    Puffy: 1,
    "Teenie Tiny": 1,
  },
);

export const accessoryWeights: IWeights<IAccessoriesType> =
  mapWeightedValuesToRange(0, 255, {
    None: 40,
    "Bow Tie": 16,
    Heart: 12,
    "Neck Tie": 5,
    "Rainbow Cape": 3,
    Flamingo: 3,
    Floaties: 8,
    Hoodie: 2,
  });

export const accessoryColorWeights: IWeights<HoodieColor> =
  mapWeightedValuesToRange(0, 255, {
    Red: 10,
    Orange: 50,
    Purple: 10,
  });

export const faceWeights: IWeights<IFaceType> = mapWeightedValuesToRange(
  0,
  255,
  {
    Anger: 10,
    "Clout Goggles": 3,
    Derp: 7,
    Lash: 25,
    Oval: 30,
    Troll: 4,
    Visor: 6,
    Bored: 9,
    Disapproval: 4,
  },
);

export const mouthWeights: IWeights<IMouthType> = mapWeightedValuesToRange(
  0,
  255,
  {
    Bleh: 11,
    Blunt: 2,
    "Happy mouth": 17,
    owo: 14,
    Plain: 10,
    Smile: 19,
    Smirk: 18,
    "Smol frown": 7,
    Fangs: 4,
  },
);

export const mustacheWeights: IWeights<"Mustache" | "Clean Shaven"> =
  mapWeightedValuesToRange(0, 255, {
    Mustache: 3,
    "Clean Shaven": 97,
  });

export const headWeights: IWeights<IHeadType> = mapWeightedValuesToRange(
  0,
  255,
  {
    Bald: 40,
    Tuft: 22,
    Side: 14,
    "Cowboy Hat": 5,
    Crown: 1,
    Halo: 2,
    Octopus: 1.5,
    "Party Hat": 3,
    "Spin Beanie": 2.5,
    Beanie: 5.5,
    Birdie: 3.5,
  },
);
