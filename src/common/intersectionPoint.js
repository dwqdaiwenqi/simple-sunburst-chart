const intersectionPoint = (e) => {
  // p0 + v1*t1 = p2 + v2*t2

  // e[0].x1 + e[0].dir.x * t1 = e[1].x1 + e[1].dir.x * t2;
  // e[0].y1 + e[0].dir.y * t1 = e[1].y1 + e[1].dir.y * t2;

  // e[0].dir.x * t1 - e[1].dir.x * t2 = e[1].x1 - e[0].x1;
  // e[0].dir.y * t1 - e[1].dir.y * t2 = e[1].y1 - e[0].y1;

  //
  //  a b          t1          e
  //  c d          t2          f
  let mat = {
    a: e[0].dir.x,
    b: -e[1].dir.x,
    c: e[0].dir.y,
    d: -e[1].dir.y,

    e: e[1].x1 - e[0].x1,
    f: e[1].y1 - e[0].y1
  };

  //Dx
  let DxMat = {
    ...mat,
    a: mat.e,
    c: mat.f
  };
  //Dy
  let DyMat = {
    ...mat,
    b: mat.e,
    d: mat.f
  };

  //D ad-cb
  let D = mat.a * mat.d - mat.c * mat.b;
  let Dx = DxMat.a * DxMat.d - DxMat.c * DxMat.b;
  let Dy = DyMat.a * DyMat.d - DyMat.c * DyMat.b;
  let intersect = {
    x: 0,
    y: 0
  };
  let msg = ''
  if (D === 0) {
    msg = 'no solution'
  } else {
    let [t1, t2] = [Dx / D, Dy / D];

    if (t1 < 0 || t2 < 0) {
      msg = 'no intersection point'
    }

    if (t1 > 0 && t2 > 0) {
      msg = 'intersection！'
    }
    intersect = {
      t1,
      t2,
      x: e[0].x1 + e[0].dir.x * t1,
      y: e[0].y1 + e[0].dir.y * t1,
      intersectionExist:true
    };
  }

  return {
    ...intersect,
    msg
  };
};

// let intersect = intersectionPoint([e[0], e[1]]);

export default intersectionPoint