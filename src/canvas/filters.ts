export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type Vector5 = [number, number, number, number, number];
export type Matrix_5v4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

function mix(
  r: number,
  g: number,
  b: number,
  or: number,
  og: number,
  ob: number,
  value: number
) {
  const r1 = or * value + r * (1 - value);
  const g1 = og * value + g * (1 - value);
  const b1 = ob * value + b * (1 - value);
  return [r1, g1, b1];
}

export function makeOperationFromMatrix(alpha: number, m: number[]) {
  async function draw(ctx: CanvasRenderingContext2D) {
    if (alpha === 0) {
      return;
    }
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const outData = ctx.createImageData(width, height);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const offset = (x + y * width) * 4;
        let r = imageData.data[offset + 0] / 255;
        let g = imageData.data[offset + 1] / 255;
        let b = imageData.data[offset + 2] / 255;
        let a = imageData.data[offset + 3] / 255;
        if (a === 0) {
          continue;
        }
        let or,
          og,
          ob,
          oa = 0;
        // Un-premultiply alpha before applying the color matrix
        if (a > 0) {
          r /= a;
          g /= a;
          b /= a;
        }
        or = m[0] * r;
        or += m[1] * g;
        or += m[2] * b;
        or += m[3] * a;
        or += m[4];

        og = m[5] * r;
        og += m[6] * g;
        og += m[7] * b;
        og += m[8] * a;
        og += m[9];

        ob = m[10] * r;
        ob += m[11] * g;
        ob += m[12] * b;
        ob += m[13] * a;
        ob += m[14];

        oa = m[15] * r;
        oa += m[16] * g;
        oa += m[17] * b;
        oa += m[18] * a;
        oa += m[19];

        // Mix alpha and clamp
        // vec3 rgb = mix(c.rgb, result.rgb, uAlpha);
        [or, og, ob] = mix(r, g, b, or, og, ob, alpha);

        // Premultiply alpha again.
        or *= oa;
        og *= oa;
        ob *= oa;

        outData.data[offset + 0] = clamp(or * 255);
        outData.data[offset + 1] = clamp(og * 255);
        outData.data[offset + 2] = clamp(ob * 255);
        outData.data[offset + 3] = clamp(a * 255);
      }
    }
    ctx.putImageData(outData, 0, 0);
  }
  return draw;
}

export type FilterOperations = ReturnType<typeof createFilter>[1];

export function createFilter() {
  let matrix: Matrix_5v4 = [
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  ];
  let alpha = 1;

  function getMatrix() {
    return matrix;
  }

  function setMatrix(m: Matrix_5v4) {
    matrix = [...m];
  }
  function setAlpha(a: number) {
    alpha = a;
  }
  function multiply(out: Matrix_5v4, a: Matrix_5v4, b: Matrix_5v4) {
    // Red Channel
    out[0] = a[0] * b[0] + a[1] * b[5] + a[2] * b[10] + a[3] * b[15];
    out[1] = a[0] * b[1] + a[1] * b[6] + a[2] * b[11] + a[3] * b[16];
    out[2] = a[0] * b[2] + a[1] * b[7] + a[2] * b[12] + a[3] * b[17];
    out[3] = a[0] * b[3] + a[1] * b[8] + a[2] * b[13] + a[3] * b[18];
    out[4] = a[0] * b[4] + a[1] * b[9] + a[2] * b[14] + a[3] * b[19] + a[4];
    // Green Channel
    out[5] = a[5] * b[0] + a[6] * b[5] + a[7] * b[10] + a[8] * b[15];
    out[6] = a[5] * b[1] + a[6] * b[6] + a[7] * b[11] + a[8] * b[16];
    out[7] = a[5] * b[2] + a[6] * b[7] + a[7] * b[12] + a[8] * b[17];
    out[8] = a[5] * b[3] + a[6] * b[8] + a[7] * b[13] + a[8] * b[18];
    out[9] = a[5] * b[4] + a[6] * b[9] + a[7] * b[14] + a[8] * b[19] + a[9];
    // Blue Channel
    out[10] = a[10] * b[0] + a[11] * b[5] + a[12] * b[10] + a[13] * b[15];
    out[11] = a[10] * b[1] + a[11] * b[6] + a[12] * b[11] + a[13] * b[16];
    out[12] = a[10] * b[2] + a[11] * b[7] + a[12] * b[12] + a[13] * b[17];
    out[13] = a[10] * b[3] + a[11] * b[8] + a[12] * b[13] + a[13] * b[18];
    out[14] =
      a[10] * b[4] + a[11] * b[9] + a[12] * b[14] + a[13] * b[19] + a[14];
    // Alpha Channel
    out[15] = a[15] * b[0] + a[16] * b[5] + a[17] * b[10] + a[18] * b[15];
    out[16] = a[15] * b[1] + a[16] * b[6] + a[17] * b[11] + a[18] * b[16];
    out[17] = a[15] * b[2] + a[16] * b[7] + a[17] * b[12] + a[18] * b[17];
    out[18] = a[15] * b[3] + a[16] * b[8] + a[17] * b[13] + a[18] * b[18];
    out[19] =
      a[15] * b[4] + a[16] * b[9] + a[17] * b[14] + a[18] * b[19] + a[19];
    return out;
  }

  function colorMatrix(_matrix: Matrix_5v4): Matrix_5v4 {
    // Create a Float32 Array and normalize the offset component to 0-1
    const m: Matrix_5v4 = [..._matrix];
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;
    return m;
  }

  function loadMatrix(_matrix: Matrix_5v4, _multiply: boolean = false) {
    let newMatrix = _matrix;
    if (_multiply) {
      multiply(newMatrix, matrix, _matrix);
      newMatrix = colorMatrix(newMatrix);
    }
    // set the new matrix
    setMatrix(newMatrix);
  }

  // const filters = {
  //   opacity: setAlpha,
  //   brightness,
  //   contrast,
  //   chromaKey,
  //   desaturate,
  //   negative,
  //   saturate,
  //   greyscale,
  //   grayscale: greyscale,
  //   hue,
  //   sepia,
  //   technicolor,
  //   polaroid,
  //   kodachrome,
  //   browni,
  //   vintage,
  // };
  const state = {
    getMatrix,
    setMatrix,
    setAlpha,
    multiply,
    colorMatrix,
    loadMatrix,
  };
  const operation = () => makeOperationFromMatrix(alpha, matrix);

  return [operation, state] as [typeof operation, typeof state];
}

export type MatrixState = ReturnType<typeof createFilter>[1];

export function brightness(
  state: MatrixState,
  b: number,
  _multiply: boolean = true
) {
  const matrix: Matrix_5v4 = [
    b,
    0,
    0,
    0,
    0,
    0,
    b,
    0,
    0,
    0,
    0,
    0,
    b,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function saturate(
  state: MatrixState,
  amount: number,
  _multiply: boolean = true
) {
  const x = (amount * 2) / 3 + 1;
  const y = (x - 1) * -0.5;
  const matrix: Matrix_5v4 = [
    x,
    y,
    y,
    0,
    0,
    y,
    x,
    y,
    0,
    0,
    y,
    y,
    x,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}
export function greyscale(
  state: MatrixState,
  scale: number,
  _multiply: boolean = true
) {
  const matrix: Matrix_5v4 = [
    scale,
    scale,
    scale,
    0,
    0,
    scale,
    scale,
    scale,
    0,
    0,
    scale,
    scale,
    scale,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function chromaKey(state: MatrixState, chroma: Vector3, rgb: Vector3) {
  const [cr, cg, cb] = chroma;
  const [r, g, b] = rgb;
  const matrix: Matrix_5v4 = [
    // Red channel
    cr * r,
    cg * r,
    cb * r,
    0,
    0,
    // Green channel
    cr * g,
    cg * g,
    cb * g,
    0,
    0,
    // Blue channel
    cr * b,
    cg * b,
    cb * b,
    0,
    0,
    // Alpha channel
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix);
}

export function hue(
  state: MatrixState,
  rotation: number,
  _multiply: boolean = true
) {
  rotation = ((rotation || 0) / 180) * Math.PI;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const sqrt = Math.sqrt;
  /* a good approximation for hue rotation
       This matrix is far better than the versions with magic luminance constants
       formerly used here, but also used in the starling framework (flash) and known from this
       old part of the internet: quasimondo.com/archives/000565.php
       This new matrix is based on rgb cube rotation in space. Look here for a more descriptive
       implementation as a shader not a general matrix:
       https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/adjust/huesaturation.js
       This is the source for the code:
       see http://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color/8510751#8510751
       */
  const w = 1 / 3;
  const sqrW = sqrt(w); // weight is
  const a00 = cosR + (1.0 - cosR) * w;
  const a01 = w * (1.0 - cosR) - sqrW * sinR;
  const a02 = w * (1.0 - cosR) + sqrW * sinR;
  const a10 = w * (1.0 - cosR) + sqrW * sinR;
  const a11 = cosR + w * (1.0 - cosR);
  const a12 = w * (1.0 - cosR) - sqrW * sinR;
  const a20 = w * (1.0 - cosR) - sqrW * sinR;
  const a21 = w * (1.0 - cosR) + sqrW * sinR;
  const a22 = cosR + w * (1.0 - cosR);
  const matrix: Matrix_5v4 = [
    a00,
    a01,
    a02,
    0,
    0,
    a10,
    a11,
    a12,
    0,
    0,
    a20,
    a21,
    a22,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function contrast(
  state: MatrixState,
  amount: number,
  _multiply: boolean = true
) {
  const v = (amount || 0) + 1;
  const o = -0.5 * (v - 1);
  const matrix: Matrix_5v4 = [
    v,
    0,
    0,
    0,
    o,
    0,
    v,
    0,
    0,
    o,
    0,
    0,
    v,
    0,
    o,
    0,
    0,
    0,
    1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function desaturate(state: MatrixState) {
  saturate(state, -1, false);
}

export function negative(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, -1, 1, 0, 0, 0, 0, 1, 0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function sepia(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    0.393, 0.7689999, 0.18899999, 0, 0, 0.349, 0.6859999, 0.16799999, 0, 0,
    0.272, 0.5339999, 0.13099999, 0, 0, 0, 0, 0, 1, 0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function technicolor(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0,
    11.793603434377337, -0.3087833385928097, 1.7658908555458428,
    -0.10601743074722245, 0, -70.35205161461398, -0.231103377548616,
    -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138, 0, 0, 0, 1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function polaroid(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    1.438, -0.062, -0.062, 0, 0, -0.122, 1.378, -0.122, 0, 0, -0.016, -0.016,
    1.483, 0, 0, 0, 0, 0, 1, 0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function kodachrome(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0,
    63.72958762196502, -0.16404339962244616, 1.0835251566291304,
    -0.05498805115633132, 0, 24.732407896706203, -0.16786010706155763,
    -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946, 0, 0, 0, 1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function browni(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0,
    47.43192855600873, -0.037703249837783157, 0.8609577587992641,
    0.15059552388459913, 0, -36.96841498319127, 0.24113635128153335,
    -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283, 0, 0, 0,
    1, 0,
  ];
  state.loadMatrix(matrix, _multiply);
}

export function vintage(state: MatrixState, _multiply: boolean = true) {
  const matrix: Matrix_5v4 = [
    0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0,
    9.651285835294123, 0.02578397704808868, 0.6441188644374771,
    0.03259127616149294, 0, 7.462829176470591, 0.0466055556782719,
    -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296, 0, 0, 0, 1,
    0,
  ];
  state.loadMatrix(matrix, _multiply);
}

function clamp(v: number) {
  if (v < 0) {
    return 0;
  }
  if (v > 255) {
    return 255;
  }
  return Math.round(v);
}

export function hexToVector3(hexColor: string): Vector3 {
  const r = parseInt(hexColor.substr(1, 2), 16) / 255;
  const g = parseInt(hexColor.substr(3, 2), 16) / 255;
  const b = parseInt(hexColor.substr(5, 2), 16) / 255;
  return [r, g, b];
}
