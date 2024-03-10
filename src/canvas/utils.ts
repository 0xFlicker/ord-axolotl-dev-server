import { zipObj } from "ramda";
import { ILayer } from "./core.js";

export const alwaysCompatible = (other: ILayer) => true;

export function resolveProperties(path: string) {
  return path;
  // return resolve(__dirname, "..", "..", "properties", path);
}

export function weightSampleFromWeights<T extends string>(
  _weights: {
    [key in T]: number;
  },
  randomProvider?: (sum: number) => number
): T {
  const choices = Object.keys(_weights) as T[];
  const weights = Object.values(_weights) as number[];
  return weightedSample(choices, weights, randomProvider);
}

export function mapWeightedValuesToRange<T extends string>(
  min: number,
  max: number,
  weights: { [key in T]: number }
): {
  [key in T]: number;
} {
  const weightedValues = mapWeightsToRange(Object.values(weights), min, max);
  return zipObj(Object.keys(weights) as T[], weightedValues);
}

export function mapWeightsToRange(weights: number[], min: number, max: number) {
  const total = weights.reduce((acc, curr) => acc + curr, 0);
  const normalizedWeights = weights.map((weight) => weight / total);
  const range = max - min;
  const scaledWeights = normalizedWeights.map((weight) =>
    Math.round(weight * range)
  );
  // Check that the sum of the scaled weights is equal to the range
  const sum = scaledWeights.reduce((acc, curr) => acc + curr, 0);
  if (sum !== range) {
    // If not, add the difference to the largest value
    const diff = range - sum;
    const maxIndex = scaledWeights.indexOf(
      scaledWeights.reduce((acc, curr) => Math.max(acc, curr), 0)
    );
    scaledWeights[maxIndex] += diff;
  }
  return scaledWeights;
}

/*
 * Taken/adapted from https://github.com/chancejs/chancejs/blob/master/chance.js
 */
export function weightedSample<T>(
  list: T[],
  weights: number[],
  randomProvider: (sum: number) => number = (sum: number) => Math.random() * sum
): T {
  if (list.length !== weights.length) {
    throw new RangeError("Chance: Length of array and weights must match");
  }

  // scan weights array and sum valid entries
  let sum = 0;
  let val;
  for (let weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
    val = weights[weightIndex];
    if (isNaN(val)) {
      throw new RangeError("Chance: All weights must be numbers");
    }

    if (val > 0) {
      sum += val;
    }
  }

  if (sum === 0) {
    throw new RangeError("Chance: No valid entries in array weights");
  }

  // select a value within range
  const selected = randomProvider(sum);

  // find array entry corresponding to selected value
  let total = 0;
  let lastGoodIdx = -1;
  let chosenIdx = 0;
  for (let weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
    val = weights[weightIndex];
    total += val;
    if (val > 0) {
      if (selected <= total) {
        chosenIdx = weightIndex;
        break;
      }
      lastGoodIdx = weightIndex;
    }

    // handle any possible rounding error comparison to ensure something is picked
    if (weightIndex === weights.length - 1) {
      chosenIdx = lastGoodIdx;
    }
  }

  var chosen = list[chosenIdx];
  return chosen;
}

export function weightedChance<T>(list: T[], weights: number[]): T {
  const total = weights.reduce((acc, cur) => acc + cur, 0);
  const rand = Math.random() * total;
  let i = 0;
  let sum = 0;
  while (sum < rand) {
    sum += weights[i];
    i++;
  }
  return list[i];
}
