/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import Group from './group.js'
import M2 from '../common/matrix2d.js'
import {dpr} from '../common/index.js'

const Stage = (w, h, $el) => {
  const that = Group()
  Object.assign(that,{
    name: 'stage',
    init() {
      const $c = document.createElement('canvas');
      this.$c = $c;
      this.$el = $el;
      this.$el.style.position = 'relative'
      this.c = $c.getContext('2d');

      this.resize(w,h)
      $el.appendChild($c);

      this.registryEvents();
      
      this.mat = new M2().scaling(dpr)

      return this;
    },
    resize(w,h){
      this.viewportWidth = w
      this.viewportHeight = h

      this.$c.style.width = w +'px'
      this.$c.style.height = h +'px'
      this.$c.width = w * dpr;
      this.$c.height = h * dpr;
    },
    getViewportWidth(){
      return this.viewportWidth
    },
    getViewportHeight(){
      return this.viewportHeight
    },
    getWidth(){
      return this.$c.width
    },
    getHeight(){
      return this.$c.height
    },
    getShapes(process) {
      let result = this.elements.filter((n) => n.shape)
      if(process){
        result = result.filter(n=>process(n))
      }
      return result
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
        const shapes = this.getShapes((n)=>n.visible);
        shapes.forEach((item) => {
          if (item.inPath(x, y)) {
            console.log('item:',item,x,y)
            item?.clickHandle?.(x, y);
          }
        });

        this?.clickHandle?.(x, y);
      };

      let previousMousemoveItem = null;
      let currentMousemoveItem = null;
      this.$el.onmousemove = (event) => {
        const [x, y] = this.getClipSpacePo(event.pageX, event.pageY);
        const shapes = this.getShapes((n)=>n.visible);

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
    clearRect(){
      this.c.clearRect(0, 0, w, h);
    },
    tick(fuc) {
      this.itv = window.itv = setInterval(() => {
        this.c.clearRect(0, 0, this.getWidth(), this.getHeight());
        fuc && fuc()
      }, 1000/60);
    },
    update() {
      this.c.save()
      this.c.setTransform(...this.mat.elements)
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
    clear(){
      this.elements.forEach((n) => {
        n.elements = [];
      });
      this.elements = [];
    },
    destroy() {
      clearInterval(this.itv)

      this.$el.onclick = this.$el.onmousemove = this.$el.onmouseout = null;

      if(this.$c.parentNode){
        this.$c.parentNode.removeChild(this.$c);
      }
      this.elements.forEach((n) => {
        n.elements = [];
      });
      this.elements = [];
    },
  })

  return that.init();
};

export default Stage