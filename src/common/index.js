const [sin, cos, sign, abs,PI] = ['sin', 'cos', 'sign', 'abs','PI'].map(
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

export {
  sin, cos, sign, abs,PI,
  l,
  debounce
}

export default {
  sin, cos, sign, abs,PI,
  l,
  debounce
}