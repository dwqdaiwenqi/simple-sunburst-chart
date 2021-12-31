export default class M2 {
  constructor() {
    this.elements = [1, 0, 0, 1, 0, 0];
  }
  translation(tx, ty) {
    this.elements = [1, 0, 0, 1, tx, ty];
    return this
  }
  rotation(rad) {
    this.elements = [
      Math.cos(rad),
      Math.sin(rad),
      -1 * Math.sin(rad),
      Math.cos(rad),
      0,
      0
    ];
    return this
  }
  scaling(sx, sy) {
    if(!sy) sy = sx
    this.elements = [sx, 0, 0, sy, 0, 0];
    return this
  }
  multiply(m2) {
    let m = [];

    let m1 = this.elements;

    m2 = m2.elements

    m[0] = m1[0] * m2[0] + m1[2] * m2[1] + m1[4] * 0;
    m[2] = m1[0] * m2[2] + m1[2] * m2[3] + m1[4] * 0;
    m[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4] * 1;
    m[1] = m1[1] * m2[0] + m1[3] * m2[1] + m1[5] * 0;
    m[3] = m1[1] * m2[2] + m1[3] * m2[3] + m1[5] * 0;
    m[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5] * 1;

    this.elements = m;
    return this
  }

  translate(tx,ty) {
    return this.multiply(this.translation(tx, ty));
  }

  rotate(rad) {
    return this.multiply(this.rotation(rad));
  }

  scale(sx, sy) {
    return this.multiply(this.scaling(sx, sy));
  }
}
