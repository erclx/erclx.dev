const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

const grad2 = new Float32Array([
  1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1,
])

export function createNoise2D(
  seed = 0x9e3779b9,
): (x: number, y: number) => number {
  const perm = new Uint8Array(512)
  const permMod8 = new Uint8Array(512)
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let state = seed >>> 0
  for (let i = 255; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0
    const j = state % (i + 1)
    const tmp = p[i]
    p[i] = p[j]
    p[j] = tmp
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
    permMod8[i] = perm[i] % 8
  }

  return function noise2D(x: number, y: number): number {
    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const t = (i + j) * G2
    const x0 = x - (i - t)
    const y0 = y - (j - t)
    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1
    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2
    const ii = i & 255
    const jj = j & 255

    let n0 = 0
    let n1 = 0
    let n2 = 0

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) {
      const gi0 = permMod8[ii + perm[jj]] * 2
      t0 *= t0
      n0 = t0 * t0 * (grad2[gi0] * x0 + grad2[gi0 + 1] * y0)
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) {
      const gi1 = permMod8[ii + i1 + perm[jj + j1]] * 2
      t1 *= t1
      n1 = t1 * t1 * (grad2[gi1] * x1 + grad2[gi1 + 1] * y1)
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) {
      const gi2 = permMod8[ii + 1 + perm[jj + 1]] * 2
      t2 *= t2
      n2 = t2 * t2 * (grad2[gi2] * x2 + grad2[gi2 + 1] * y2)
    }
    return 70 * (n0 + n1 + n2)
  }
}
