/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import { 
  sign,abs,PI,l,debounce
} from './common/index.js'

import {Stage,Text,Ring,Line,Circle} from './render/index.js'
import Vec from './common/vector.js'

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

const createTooltip = ()=> {
  const $tooltip = document.createElement('div')
  $tooltip.style.cssText = `
    position:absolute;
    width:auto;
    height:auto;
    padding:8px 10px;
    display:none;
    pointer-events:none;
    background-color:white;
    color:#00000080;
    box-shadow:1px 1px 10px rgba(0,0,0,.2);
    border-radius:4px;
  `
  return $tooltip
}


export default function SunburstChart(config) {

  const that = {
    resizeObserver: null,
    _rings:[],
    _constrain(node){
      let [left, right, top, bottom] = [
        0 , 
        this.stage.$c.width,
        0 , 
        this.stage.$c.height
      ];
      var { x, y} = node;
      if (x < left) node.x = left;
      if (x > right) node.x = right;
      if (y < top) node.y = top;
      if (y > bottom) node.y = bottom;
    },
    _handleCollision(){
      const outerRings = this._rings.filter(n=>n.depth===config.data.length-1)

      outerRings.forEach((o1, i) => {
        o1 = o1.boundingCircle
        for (let j = i + 1, len = outerRings.length; j < len; j++) {
            let o2 = outerRings[j].boundingCircle
            let centerAxis = new Vec(o2.x - o1.x, o2.y - o1.y);
            let centerAxisLength = centerAxis.clone().length();
            let minDist = o1.radius + o2.radius;
            
            if (centerAxisLength < minDist) {
              let diff = centerAxis.clone().setLength((centerAxisLength - minDist)*.5)

              {
                let [labelName,labelValue,line1,line2,boundingCircle] = [
                  o2.parent.findChild({name:'labelName'})[0],
                  o2.parent.findChild({name:'labelValue'})[0],
                  o2.parent.findChild({name:'line1'})[0],
                  o2.parent.findChild({name:'line2'})[0],
                  o2.parent.findChild({name:'boundingCircle'})[0]   
                ]
    
                ;[labelName,labelValue,boundingCircle].forEach(item=>{
                  item.x += diff.x*-1
                  item.y += diff.y*-1
                })

                line1.x2 += diff.x*-1
                line1.y2 += diff.y*-1


                line2.x1 += diff.x*-1
                line2.y1 += diff.y*-1
                line2.x2 += diff.x*-1
                line2.y2 += diff.y*-1


              }

              {
                let [labelName,labelValue,line1,line2,boundingCircle] = [
                  o1.parent.findChild({name:'labelName'})[0],
                  o1.parent.findChild({name:'labelValue'})[0],
                  o1.parent.findChild({name:'line1'})[0],
                  o1.parent.findChild({name:'line2'})[0],
                  o1.parent.findChild({name:'boundingCircle'})[0]   
                ]

                ;[labelName,labelValue,boundingCircle].forEach(item=>{
                  item.x += diff.x
                  item.y += diff.y
                  this._constrain(item)
                })

                line1.x2 += diff.x
                line1.y2 += diff.y


                line2.x1 += diff.x
                line2.y1 += diff.y
                line2.x2 += diff.x
                line2.y2 += diff.y
  
              }
           }
        }
      });

    },

    _createElements(config){

      const processedData = processData({ data: config.data, min: config.min });

      const stage = Stage(
        config.$el.offsetWidth,
        config.$el.offsetHeight,
        config.$el,
      );

      this.stage = stage;

      const stepRadius = config.radius / processedData.length;

      let overlapCircle = Circle({radius:config.radius})
      stage.add(overlapCircle)
      overlapCircle.strokeStyle = 'transparent'
      overlapCircle.fillStyle = 'white'
      overlapCircle.visible = false
      overlapCircle.x = config.x
      overlapCircle.y = config.y
      overlapCircle.z = -1

      
      for (let i = 0, len = processedData.length; i < len; i++) {
        const children = processedData[i];
        const radius = (i / len) * config.radius;

        const levelConfig =  config.levels?.[i]
        const font = Object.assign({tx:0,ty:0,font:'13px Regular',mode:'break-world'},levelConfig.font ??{})
        const co = levelConfig?.color;

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
            outerRadius: radius + stepRadius,
            startRadian,
            endRadian,
          });
          this._rings.push(ring)
          ring.depth = i 
          ring.userParams = { ...childData,color:co };
          ring.fillStyle = co;
          ring.strokeStyle = 'white';
          ring.lineWidth = config.gap;
          ring.globalAlpha = 1;
          ring.x = config.x;
          ring.y = config.y


          if (i !== processedData.length-1) {
            const labelName = Text({ text: childData.name });
            const { x, y } = ring.getCenterPo();
            ring.add(labelName);
            labelName.name = 'labelName'
            labelName.font = font.font
            labelName.x = x + font.tx
            labelName.y = y + font.ty
            labelName.z = 1

            const labelValue = Text({ text: childData.value });
            ring.add(labelValue);
            labelValue.name = 'labelValue'
            labelValue.font = font.font
            labelName.shadowBlur = labelValue.shadowBlur = font.shadowBlur
            labelName.shadowOffsetX = labelValue.shadowOffsetX = font.shadowOffsetX
            labelName.shadowOffsetY = labelValue.shadowOffsetY = font.shadowOffsetY
            labelName.shadowColor = labelValue.shadowColor = font.shadowColor

            labelValue.x = x + font.tx
            labelValue.y = y + 18+ font.ty
            labelValue.z = 1
  
          }

         
          if (i === processedData.length-1) {

            const labelName = Text({
              text: childData.name,
            });
            labelName.name = 'labelName'
            labelName.z = 1

            const labelNameWidth = labelName.getWidth()
            const labelNameHeight = labelName.getHeight()
            const { x: x1, y: y1, normalize } = ring.getMiddleOfEdge();

            const dir = sign(normalize.x);

            let d = dir < 0? abs((ring.x-ring.outerRadius*1.2)-x1) : abs((ring.x+ring.outerRadius*1.2)-x1)
            d += 10
          
            const line = Line({
              x1: x1,
              y1: y1,
              x2: x1 + normalize.x * 10,
              y2: y1 + normalize.y * 10,
            });
            line.name = 'line1'
            line.z = -2
            ring.add(line);

            labelName.font = font.font
            labelName.fillStyle = '#6D7278';

            labelName.shadowBlur =  font.shadowBlur
            labelName.shadowOffsetX =  font.shadowOffsetX
            labelName.shadowOffsetY =  font.shadowOffsetY
            labelName.shadowColor = font.shadowColor

            ring.add(labelName);

            labelName.x = line.x1 + dir * d + dir * (labelNameWidth)
            labelName.y = y1 + normalize.y * 10 
    
            const labelValue = Text({
              text: childData.value,
            });
            labelValue.name = 'labelValue'

            const labelValueWidth = labelValue.getWidth()
            labelValue.font = font.font
            labelValue.fillStyle = '#6D7278';
            labelValue.shadowBlur =  font.shadowBlur
            labelValue.shadowOffsetX =  font.shadowOffsetX
            labelValue.shadowOffsetY =  font.shadowOffsetY
            labelValue.shadowColor = font.shadowColor
            ring.add(labelValue);

            labelValue.x = labelName.x
            labelValue.y = labelName.y+labelNameHeight*1.1
            labelValue.z = 1

            const boundingCircle = Circle({
              radius:(labelValueWidth+labelNameWidth)*.4
            })
            boundingCircle.name = 'boundingCircle'
            boundingCircle.visible = false
            // boundingCircle.fillStyle = 'transparent'
            // boundingCircle.strokeStyle = 'transparent'
            ring.add(boundingCircle)
            ring.boundingCircle = boundingCircle


            const line2 = Line({
              x1: line.x2,
              y1: line.y2,
              x2: labelName.x - dir*(labelNameWidth),
              y2: labelName.y,
            });
            line2.name = 'line2'
            line2.z = -2
            ring.add(line2);

            boundingCircle.x = labelName.x
            boundingCircle.y = l(labelName.y,labelValue.y,.5)
          }

          depthChilds.push(ring);

          stage.add(ring);
        }
      }
    },

    onElementClick(fn) {
      this.handleElementClick = fn;
    },
    render() {
      if (this.stage) {
        this.stage.destroy();
        this.$tooltip.remove()
        this._rings = []
      }

      this.$tooltip = config.$el.appendChild(createTooltip())


      config.x = this.resizeObserver ? config.$el.offsetWidth * 0.5 : config.x;
      config.y = this.resizeObserver ? config.$el.offsetHeight * 0.5 : config.y;
      config.gap = config.gap ?? 0;
      config.min = config.min ?? 0.01;
      config.levels = config.levels ?? [];
      config.labelMode = config.labelMode ?? 'space-between';
      config.radius = this.resizeObserver ? config.$el.offsetHeight * 0.4 : config.radius;


      this._createElements(config)


      const {stage} = this
      stage.getShapes().forEach((item,i) => {
        item.onClick(() => {
          that.handleElementClick(item.userParams);
        });

        item.onMouseover((x,y) => {
          if(config.tooltip){
            const tooltipVal = config.tooltip(item.userParams,i)
            this.$tooltip.innerHTML = tooltipVal
            this.$tooltip.style.left = (x + 12) + 'px'
            this.$tooltip.style.top = (y + 12) + 'px'
            this.$tooltip.style.display = 'block'
          }

          this._rings.forEach((n) => {
            n.globalAlpha = n === item ? 1 : 0.3;
          });
        });

        item.onMouseout(() => {
          this.$tooltip.style.display = 'none'
          this._rings.forEach((n) => {
            n.globalAlpha = 1;
          });
        });
      });
      stage.onMouseout(() => {
        this.$tooltip.style.display = 'none'
        this._rings.forEach((n) => {
          n.globalAlpha = 1;
        });
      });
      stage.tick(() => {
        stage.update();
        this._handleCollision();
      });
    },
    autoResize() {
      this.resizeObserver = new ResizeObserver(debounce(() => {
        that.render();
      }));
      this.resizeObserver.observe(config.$el);
    },
  };
  return that;
}
