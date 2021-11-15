/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import { 
  sin, cos, sign, abs,PI,
  l,
  debounce
} from './common.js'


const Stage = (w, h, $el) => {
  const that = {
    elements: [],
    name: 'stage',
    init() {
      const $c = document.createElement('canvas');
      this.$c = $c;
      this.$el = $el;
      this.c = $c.getContext('2d');
      $c.width = w;
      $c.height = h;
      $el.appendChild($c);

      this.registryEvents();

      return this;
    },
    getShapes() {
      return this.elements.filter((n) => n.shape);
    },
    getClipSpacePo(x, y) {
      const scrollTop =
        document.body.scrollTop || document.documentElement.scrollTop;
      const scrollLeft =
        document.body.scrollLeft || document.documentElement.scrollLeft;
      return [
        x - this.$el.getBoundingClientRect().left - scrollLeft,
        y - this.$el.getBoundingClientRect().top - scrollTop,
      ];
    },
    onClick(fuc) {
      this.clickHandle = fuc;
    },
    onMouseover(fuc) {
      this.mouseoverHandle = fuc;
    },
    onMouseout(fuc) {
      this.mouseoutHandle = fuc;
    },
    registryEvents() {
      this.$el.onclick = (event) => {
        const [x, y] = this.getClipSpacePo(event.pageX, event.pageY);
        const shapes = this.getShapes();
        shapes.forEach((item) => {
          if (item.inPath(x, y)) {
            item?.clickHandle?.(x, y);
          }
        });

        this?.clickHandle?.(x, y);
      };

      let previousMousemoveItem = null;
      let currentMousemoveItem = null;
      this.$el.onmousemove = (event) => {
        const [x, y] = this.getClipSpacePo(event.pageX, event.pageY);
        const shapes = this.getShapes();

        currentMousemoveItem = null;
        shapes.forEach((item) => {
          if (item.inPath(x, y)) {
            currentMousemoveItem = item;
            this.$c.style.cursor = 'pointer';
          }
        });

        if (!previousMousemoveItem && currentMousemoveItem) {
          previousMousemoveItem = currentMousemoveItem;
        }

        if (
          previousMousemoveItem &&
          currentMousemoveItem &&
          previousMousemoveItem !== currentMousemoveItem
        ) {
          previousMousemoveItem?.mouseoutHandle?.(x, y);
          previousMousemoveItem = null;
          this.$c.style.cursor = 'auto';
        }

        if (currentMousemoveItem) {
          currentMousemoveItem?.mouseoverHandle?.(x, y);
        }

        // 一个对象 mouseout
        if (!currentMousemoveItem && previousMousemoveItem) {
          previousMousemoveItem?.mouseoutHandle?.(x, y);
          previousMousemoveItem = null;
          this.$c.style.cursor = 'auto';
        }

        this?.mouseoverHandle?.(x, y);
      };

      this.$el.onmouseout = (event) => {
        const [x, y] = this.getClipSpacePo(event.pageX, event.pageY);

        if (previousMousemoveItem) {
          previousMousemoveItem?.mouseoutHandle?.(x, y);
          previousMousemoveItem = null;
        }

        if (currentMousemoveItem) {
          currentMousemoveItem?.mouseoverHandle?.(x, y);
          currentMousemoveItem = null;
        }

        this?.mouseoutHandle?.(x, y);

        this.$c.style.cursor = 'auto';
      };
    },
    tick() {
      const callee = () => {
        requestAnimationFrame(callee);
        this.c.clearRect(0, 0, w, h);
        this.update();
      };
      requestAnimationFrame(callee);
    },
    update() {
      this.elements.forEach((element) => {
        element.update(this.c);

        if (element.elements) {
          element.elements.forEach((item) => {
            item.update(this.c);
          });
        }
      });
    },
    add(element) {
      element.c = this.c;
      this.elements.push(element);
    },
    destroy() {
      this.$el.onclick = this.$el.onmousemove = this.$el.onmouseout = null;

      this.$c.parentNode.removeChild(this.$c);
      this.elements.forEach((n) => {
        n.elements = [];
      });
      this.elements = [];
    },
  };
  return that.init();
};

const Line = ({
  x1, y1, x2, y2,
}) => {
  const that = {
    name: 'line',
    lineWidth: 1,
    strokeStyle: 'black',
    init() {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      return this;
    },
    update(c) {
      c.save();
      c.lineWidth = this.lineWidth;
      c.strokeStyle = this.strokeStyle;
      c.beginPath();
      c.moveTo(this.x1, this.y1);
      c.lineTo(this.x2, this.y2);
      c.closePath();
      c.stroke();
      c.restore();
    },
  };
  return that.init();
};

const Text = ({ text }) => {
  const that = {
    name: 'text',
    font: '14px',
    textBaseline: 'middle',
    textAlign: 'center',
    fillStyle: 'white',
    x: 0,
    y: 0,
    init() {
      this.text = text;
      return this;
    },
    update(c) {
      c.save();
      c.font = this.font;
      c.fillStyle = this.fillStyle;
      c.textBaseline = this.textBaseline;
      c.textAlign = this.textAlign;
      c.fillText(text, this.x, this.y);
      c.restore();
    },
  };
  return that.init();
};

const Ring = ({
  innerRadius, outerRadius, startRadian, endRadian,
}) => {
  const that = {
    name: 'ring',
    fillStyle: 'black',
    globalAlpha: 1,
    x: 0,
    y: 0,
    elements: [],
    userParams: {},
    shape: true,
    init() {
      this.innerRadius = innerRadius;
      this.outerRadius = outerRadius;
      this.startRadian = startRadian;
      this.endRadian = endRadian;
      return this;
    },
    getCenterPo() {
      const radian = l(this.startRadian, this.endRadian, 0.5);
      const radius = l(this.innerRadius, this.outerRadius, 0.5);
      return {
        x: this.innerRadius === 0 ? this.x : cos(radian) * radius + this.x,
        y: this.innerRadius === 0 ? this.y : sin(radian) * radius + this.y,
      };
    },
    getMiddleOfEdge() {
      const radian = l(this.startRadian, this.endRadian, 0.5);
      const radius = this.outerRadius;
      return {
        x: cos(radian) * radius + this.x,
        y: sin(radian) * radius + this.y,
        normalize: {
          x: cos(radian),
          y: sin(radian),
        },
      };
    },
    onClick(fuc) {
      this.clickHandle = fuc;
    },
    onMouseover(fuc) {
      this.mouseoverHandle = fuc;
    },
    onMouseout(fuc) {
      this.mouseoutHandle = fuc;
    },
    inPath(x, y) {
      this.drawPath(this.c);
      return this.c.isPointInPath(x, y);
    },
    drawPath(c) {
      const {
        innerRadius: ir,
        outerRadius: or,
        startRadian: sr,
        endRadian: er,
      } = this;

      const [cx, cy] = [this.x, this.y];

      c.save();

      c.beginPath();

      c.moveTo(cos(sr) * ir + cx, sin(sr) * ir + cy);
      c.lineTo(cos(sr) * or + cx, sin(sr) * or + cy);

      c.arc(cx, cy, or, sr, er);

      c.lineTo(
        cos(er) * ir + cx, // 圆弧起点x
        sin(er) * ir + cy, // 圆弧起点y
      );

      c.arc(
        cx, // 圆心x
        cy, // 圆心y
        ir, // 圆弧的半径
        er, // 圆弧的开始弧度
        sr, // 圆弧的结束弧度
        true, // 逆时针绘制
      );
      c.closePath();

      c.fillStyle = this.fillStyle;
      c.strokeStyle = this.strokeStyle;
      c.lineWidth = this.lineWidth;

      c.stroke();
    },
    update(c) {
      this.drawPath(c);
      c.globalAlpha = this.globalAlpha;
      c.fill();
      c.restore();
    },
    add(element) {
      this.elements.push(element);
    },
  };
  return that.init();
};

const processData = ({ data, min }) => {
  const make = data.map((arr) => {
    const sumVal = arr.reduce(
      (previousValue, currentValue) => previousValue + currentValue.value,
      0,
    );
    return [...arr].map((item) => {
      const fac = Math.max(min, item.value / sumVal);
      return {
        ...item,
        rad: l(0, PI * 2, fac),
      };
    });
  });
  return make;
};

export default function SunburstChart(config) {
  const that = {
    resizeObserver: null,
    onElementClick(fn) {
      this.handleElementClick = fn;
    },
    render() {
      if (this.stage) {
        this.stage.destroy();
      }

      config.x = this.resizeObserver ? config.$el.offsetWidth * 0.5 : config.x;
      config.y = this.resizeObserver ? config.$el.offsetHeight * 0.5 : config.y;
      config.gap = config.gap ?? 0;
      config.min = config.min ?? 0.01;
      config.levels = config.levels ?? [];
      config.labelMode = config.labelMode ?? 'space-between';
      config.radius = this.resizeObserver ? config.$el.offsetHeight * 0.4 : config.radius;

      const processedData = processData({ data: config.data, min: config.min });

      const stage = Stage(
        config.$el.offsetWidth,
        config.$el.offsetHeight,
        config.$el,
      );

      this.stage = stage;

      const avgRadius = config.radius / processedData.length;

      for (let i = 0, len = processedData.length; i < len; i++) {
        const children = processedData[i];
        const radius = (i / len) * config.radius;
        const co = config.levels?.[i]?.color;
        const depthChilds = [];
        for (let j = 0, len = children.length; j < len; j++) {
          const childData = children[j];

          const radian = childData.rad;

          let startRadian;
          let endRadian;

          if (j === 0) {
            startRadian = 0;
            endRadian = startRadian + radian;
          } else {
            startRadian = depthChilds[j - 1].endRadian;
            endRadian = startRadian + radian;
          }

          const ring = Ring({
            innerRadius: radius,
            outerRadius: radius + avgRadius,
            startRadian,
            endRadian,
          });
          ring.x = config.x;
          ring.y = config.y;
          ring.fillStyle = co;
          ring.strokeStyle = 'white';
          ring.lineWidth = config.gap;
          ring.globalAlpha = 1;
          ring.userParams = { ...childData };

          if (i !== 2) {
            const textName = Text({ text: childData.name });
            const { x, y } = ring.getCenterPo();
            ring.add(textName);
            textName.x = x;
            textName.y = y;
            textName.font = '13px Regular';
            const textValue = Text({ text: childData.value });
            ring.add(textValue);
            textName.font = '13px Regular';
            textValue.x = x;
            textValue.y = y + 18;

            textValue.font = '14px Regular';
          }

          if (i === 2) {
            const { x: x1, y: y1, normalize } = ring.getMiddleOfEdge();

            const line = Line({
              x1,
              y1,
              x2: x1 + normalize.x * 10,
              y2: y1 + normalize.y * 10,
            });
            ring.add(line);
            line.strokeStyle = '#6D7278';

            const dir = sign(normalize.x);
            const targetX =
              dir > 0
                ? ring.x + ring.outerRadius * 1.1
                : ring.x - ring.outerRadius * 1.1;
            const diffX = abs(targetX - line.x2) * dir;
            const line2 = Line({
              x1: line.x2,
              y1: line.y2,
              x2: line.x2 + diffX,
              y2: line.y2,
            });
            ring.add(line2);
            line2.strokeStyle = '#6D7278';

            const labelName = Text({
              text: childData.name,
            });
            labelName.fillStyle = '#6D7278';
            labelName.x = line2.x2 + dir * 10;
            labelName.y = line2.y2;
            ring.add(labelName);

            const labelValue = Text({
              text: childData.value,
            });
            labelValue.fillStyle = '#6D7278';
            labelValue.x = line2.x2 + dir * 10;
            labelValue.y = line2.y2 + 14;
            ring.add(labelValue);
          }

          depthChilds.push(ring);

          stage.add(ring);
        }
      }

      stage.getShapes().forEach((item) => {
        item.onClick(() => {
          that.handleElementClick(item.userParams);
        });

        item.onMouseover(() => {
          stage.getShapes().forEach((n) => {
            n.globalAlpha = n === item ? 1 : 0.3;
          });
        });

        item.onMouseout(() => {
          stage.getShapes().forEach((n) => {
            n.globalAlpha = 1;
          });
        });
      });

      stage.onMouseout(() => {
        stage.getShapes().forEach((n) => {
          n.globalAlpha = 1;
        });
      });
      stage.tick(() => {
        stage.update();
      });
    },
    autoResize() {
      this.resizeObserver = new ResizeObserver(debounce(() => {
        that.render();
      }));
      this.resizeObserver.observe(config.$el);
    },
  };
  that.render();
  return that;
}
