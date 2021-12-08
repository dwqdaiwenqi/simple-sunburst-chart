/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import Group from './group.js'

const dpr = 1

const Stage = (w, h, $el) => {
  const that = Group()
  Object.assign(that,{
    name: 'stage',
    init() {
      const $c = document.createElement('canvas');
      this.$c = $c;
      this.$el = $el;
      this.c = $c.getContext('2d');
      $c.width = w * dpr;
      $c.height = h * dpr;

      // $c.style.width = w + 'px'
      // $c.style.height = h +'px'
      $el.appendChild($c);

      this.registryEvents();

      return this;
    },
    getWidth(){
      return w
    },
    getHeight(){
      return h
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
        (x - this.$el.getBoundingClientRect().left - scrollLeft),
        (y - this.$el.getBoundingClientRect().top - scrollTop),
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
    tick(fuc) {
      const callee = () => {
        requestAnimationFrame(callee);
        this.c.clearRect(0, 0, w, h);
        fuc && fuc()
      };
      requestAnimationFrame(callee);
    },
    update() {
      this.c.save()
      let elements = this.elements.reduce((preVal,curVal)=>{
        preVal.push(...curVal.elements,...[curVal])
        return preVal
      },[])
      elements = elements.sort((a,b)=>a.z-b.z)

      elements.forEach(element=>{
        element.update(this.c)
      })
     this.c.restore()
    },
    destroy() {
      this.$el.onclick = this.$el.onmousemove = this.$el.onmouseout = null;

      this.$c.parentNode.removeChild(this.$c);
      this.elements.forEach((n) => {
        n.elements = [];
      });
      this.elements = [];
    },
  })

  return that.init();
};

export default Stage