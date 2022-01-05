const [sin, cos, sign, asin,abs,PI] = ['sin', 'cos', 'sign', 'asin','abs','PI'].map(
  (n) => Math[n],
);

const l = (a, b, t) => a + (b - a) * t;

const debounce = (fn, t = 233) => {
  let itv = null;
  return () => {
    clearTimeout(itv);
    itv = setTimeout(() => {
      fn();
    }, t);
  };
};

const dpr = window.devicePixelRatio || 1

export {
  sin, cos, sign, abs,PI,asin,
  l,
  debounce,
  dpr
}

export default {
  sin, cos, sign, asin,abs,PI,
  l,
  debounce,
  dpr
}