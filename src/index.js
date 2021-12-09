/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import { 
  sign,abs,PI,l,debounce
} from './common/index.js'

import {Stage,Text,Ring,Line,Circle} from './render/index.js'

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

const createChartTitle = ({text,x,y,size,color}={})=>{
  const $title = document.createElement('div')
  $title.style.cssText = `
    position:absolute;
    bottom:0;
    left:50%;
    transform:translate3d(-50%,0,0);
    margin: 0 0 ${y}px ${x}px;
    color:${color};
    font-size:${size}px;
  `
  $title.innerHTML = text
  return $title
}


export default function SunburstChart(config) {

  const that = {
    resizeObserver: null,
    onElementClick(fn) {
      this.handleElementClick = fn;
    },
    _rings:[],
    _constrain(node,margin=0){
      let [left, right, top, bottom] = [
        0 +margin, 
        this.stage.getWidth()-margin,
        0 +margin, 
        this.stage.$c.height-margin
      ];
      var { x, y} = node;
      if (x < left) node.x = left
      if (x > right) node.x = right
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
            let minDist = (o1.radius + o2.radius)+5
            
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

                const { normalize } = o2.parent.getMiddleOfEdge();

                const dir = sign(normalize.x);

                const labelNameHeight = labelName.getHeight()

                this._constrain(labelName,boundingCircle.radius)

                labelName.x += diff.x*-1
                labelName.y += diff.y*-1
                
                labelValue.x = labelName.x
                labelValue.y = labelName.y+labelNameHeight*1.1

                boundingCircle.x = labelName.x
                boundingCircle.y = labelName.y

                line1.x2 = labelName.x - line1.dir().x*(boundingCircle.radius+10)
                line1.y2 = labelName.y - line1.dir().y*(boundingCircle.radius+10)


                line2.x1 = line1.x2
                line2.y1 = line1.y2
                line2.x2 = line1.x2 + dir*10
                line2.y2 = line1.y2

              }

              {
                let [labelName,labelValue,line1,line2,boundingCircle] = [
                  o1.parent.findChild({name:'labelName'})[0],
                  o1.parent.findChild({name:'labelValue'})[0],
                  o1.parent.findChild({name:'line1'})[0],
                  o1.parent.findChild({name:'line2'})[0],
                  o1.parent.findChild({name:'boundingCircle'})[0]   
                ]
                const labelNameHeight = labelName.getHeight()

                const { normalize } = o2.parent.getMiddleOfEdge();

                const dir = sign(normalize.x);

                labelName.x += diff.x
                labelName.y += diff.y

                this._constrain(labelName,boundingCircle.radius)

                labelValue.x = labelName.x
                labelValue.y = labelName.y+labelNameHeight*1.1

                boundingCircle.x = labelName.x
                boundingCircle.y = labelName.y

                line1.x2 = labelName.x - line1.dir().x*(boundingCircle.radius+10)
                line1.y2 = labelName.y - line1.dir().y*(boundingCircle.radius+10)

                line2.x1 = line1.x2
                line2.y1 = line1.y2
                line2.x2 = line1.x2 + dir*10
                line2.y2 = line1.y2

  
              }
           }
        }
      });
    },
    clear(){
      this.stage.clear()
      this.stage.resize(config.$el.offsetWidth,config.$el.offsetHeight)
      this._rings = []
    },
    updateTitle(title){
      this.$title.innerHTML = title
    },
    updateData(data){
      this.stage.resize(config.$el.offsetWidth,config.$el.offsetHeight)

      try{
        if(JSON.stringify(data)===JSON.stringify(this.data)){
          return
        }
      }catch(e){
        console.log('e',e)
      }

      this.data = data
      this.clear()

      config.title = {
        ...{text:'',x:0,y:20,size:16,color:'rgba(0,0,0,0.65)'},
        ...config.title
      }
      
      config.x = this.resizeObserver ? config.$el.offsetWidth * 0.5 : config.x;
      config.y = this.resizeObserver ? config.$el.offsetHeight * 0.5 : config.y;
      config.gap = config.gap ?? 0;
      config.min = config.min ?? 0.01;
      config.levels = config.levels ?? [];
      config.labelMode = config.labelMode ?? 'space-between';
      config.radius = this.resizeObserver ? config.$el.offsetHeight * 0.3 : config.radius;
      config.processLineDist = config.processLineDist || function(){ return 10}
      config.processLine = config.processLine || function(userParams,normalize){ return {
        axis:normalize,
        length:10
      }}

      const processedData = processData({ data, min: config.min });
      const stepRadius = config.radius / processedData.length;
      
      let {stage} = this
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
            startRadian = 0 - PI*.5;
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
          ring.x = config.x;
          ring.y = config.y;
          ring.fillStyle = co;
          ring.strokeStyle = 'white';
          ring.lineWidth = config.gap;
          ring.globalAlpha = 1;
          ring.userParams = { ...childData,color:co };

          if (i !== processedData.length-1) {
            const textName = Text({ text: childData.name });
            const { x, y } = ring.getCenterPo();
            ring.add(textName);
            textName.x = x + font.tx
            textName.y = y + font.ty
            textName.font = font.font
            textName.z = 2
            const textValue = Text({ text: childData.value });
            ring.add(textValue);
            textValue.font = font.font
            textValue.x = x + font.tx
            textValue.y = y + 18+ font.ty
            textValue.z = 2


            textName.shadowBlur = textValue.shadowBlur = font.shadowBlur
            textName.shadowOffsetX = textValue.shadowOffsetX = font.shadowOffsetX
            textName.shadowOffsetY = textValue.shadowOffsetY = font.shadowOffsetY
            textName.shadowColor = textValue.shadowColor = font.shadowColor
          }

          if (i === processedData.length-1) {

            const { x: x1, y: y1, normalize } = ring.getMiddleOfEdge();

            const line = Line({
              x1,
              y1,
              x2: x1 + normalize.x * 10,
              y2: y1 + normalize.y * 10,
            });
            line.z = 1
            ring.add(line);
            line.strokeStyle = '#6D7278';

            if(config.processLine){
              const {length,axis} = config.processLine(
                {...ring.userParams},
                {...normalize},
                (vec,rad)=>{
                  const c = Math.cos(rad),
                    s = Math.sin(rad);
              
                  const x = vec.x - 0;
                  const y = vec.y - 0;
                  
                  return {
                    x:x * c - y * s + 0,
                    y:x * s + y * c + 0
                  }
                }
              )

              line.x2 = x1 + axis.x *length
              line.y2 = y1 + axis.y *length
            }

            const dir = sign(normalize.x);

            const targetX =
            dir > 0
              ? this.stage.getWidth()-50
              : 50
            const diffX = targetX - line.x2;
            const line2 = Line({
              x1: line.x2,
              y1: line.y2,
              x2: line.x2 + diffX,
              y2: line.y2,
            });
            ring.add(line2);
            line2.z = 1
            line2.strokeStyle = '#6D7278';

            if(font.mode === 'break-world'){

              const labelName = Text({ text: childData.name });
              labelName.font = font.font
              labelName.fillStyle = '#6D7278';
              const labelNameWidth = labelName.getWidth()
              labelName.x = line2.x2 + dir*(labelNameWidth*.8+font.tx)
              labelName.y = line2.y2 + font.ty
              ring.add(labelName)
              labelName.z = 2

              const labelValue = Text({ text: childData.value });
              ring.add(labelValue);
              labelValue.fillStyle = '#6D7278';
              labelValue.x = labelName.x 
              labelValue.y = labelName.y + 16
              labelValue.z = 2

              labelName.shadowBlur = labelValue.shadowBlur = font.shadowBlur
              labelName.shadowOffsetX = labelValue.shadowOffsetX = font.shadowOffsetX
              labelName.shadowOffsetY = labelValue.shadowOffsetY = font.shadowOffsetY
              labelName.shadowColor = labelValue.shadowColor = font.shadowColor


            }else{
              const labelName = Text({
                text: childData.name + ` (${childData.value}) `,
              });
              labelName.z = 2
              const labelNameWidth = labelName.getWidth()

              const targetX =
              dir > 0
                ? this.stage.getWidth()-labelNameWidth
                : labelNameWidth
              const diffX = targetX - line.x2;

              line2.x2 = line.x2+diffX
              line2.y2 = line.y2


              labelName.font = font.font
              labelName.fillStyle = '#6D7278';
              labelName.x = line2.x2 + dir*(labelNameWidth*.8+font.tx)
              labelName.y = line2.y2 + font.ty
              ring.add(labelName);

              labelName.shadowBlur =  font.shadowBlur
              labelName.shadowOffsetX =  font.shadowOffsetX
              labelName.shadowOffsetY =  font.shadowOffsetY
              labelName.shadowColor = font.shadowColor
            }

          }

          depthChilds.push(ring);

          stage.add(ring);
        }
      }

      let currentClickElement = null
      stage.getShapes().forEach((item,i) => {
        item.onClick(() => {
          that.handleElementClick(item.userParams);

          if(currentClickElement&&currentClickElement===item){
            currentClickElement = null
            this._rings.forEach((n) => {
              n.globalAlpha = 1;
            });
          }else{
            currentClickElement = item
          }

        });

        item.onMouseover((x,y) => {
          if(config.tooltip){
            const tooltipVal = config.tooltip(item.userParams,i)
            this.$tooltip.innerHTML = tooltipVal
            this.$tooltip.style.left = (x + 30) + 'px'
            this.$tooltip.style.top = (y + 30) + 'px'
            this.$tooltip.style.display = 'block'
          }

          this._rings.forEach((n) => {
            n.globalAlpha = n === item ? 1 : 0.3;
          });

          if(currentClickElement){
            currentClickElement.globalAlpha = 1
          }
        });

        item.onMouseout(() => {
          this.$tooltip.style.display = 'none'

          if(!currentClickElement){
            this._rings.forEach((n) => {
              n.globalAlpha = 1;
            });
          }else{
            this._rings.forEach((n) => {
              n.globalAlpha = .3;
            });
            if(currentClickElement){
              currentClickElement.globalAlpha = 1
            }
          }
          
        });
      });
      stage.onMouseout(() => {
        this.$tooltip.style.display = 'none'

        if(!currentClickElement){
          this._rings.forEach((n) => {
            n.globalAlpha = 1;
          });
        }else{
          this._rings.forEach((n) => {
            n.globalAlpha = .3;
          });
          if(currentClickElement){
            currentClickElement.globalAlpha = 1
          }
        }
      });
    },

    render(){

      if(!this.stage){

        this.$tooltip = config.$el.appendChild(createTooltip())
        this.$title = config.$el.appendChild(createChartTitle(config.title))

        const stage = Stage(
          config.$el.offsetWidth,
          config.$el.offsetHeight,
          config.$el,
        );
        stage.tick(() => {
          stage.update();
        });
        this.stage = stage;
      }

      
    },
    autoResize() {
      this.resizeObserver = new ResizeObserver(debounce(() => {
        this.updateData(config.data)
      }));
      this.resizeObserver.observe(config.$el);
    },
  };
  that.autoResize()
  that.render()
  return that;
}
