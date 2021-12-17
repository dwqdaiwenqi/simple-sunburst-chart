/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
/* eslint-disable operator-assignment */

import { 
  sign,abs,asin,PI,l,debounce
} from './common/index.js'

import {Stage,Text,Ring,Line,Circle} from './render/index.js'

import Vec from './common/vector.js'

import intersectionPoint from './common/intersectionPoint.js'

const processData = ({ data, min }) => {
  const make = data.map((arr) => {
    const sumVal = arr.reduce(
      (previousValue, currentValue) => previousValue + currentValue.value,
      0,
    );

    const innerArr = [...arr].map((item) => {
      const fac =  item.value / sumVal
      return {
        ...item,
        rad: l(0, PI * 2, fac),
      };
    });

    const min = [...innerArr].sort((a,b)=>a.rad-b.rad)?.[0]
    const max = [...innerArr].sort((a,b)=>b.rad-a.rad)?.[0]

    if(min?.rad < .05){
      min.rad = .05
      max.rad -= .05
    }
    return innerArr
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

const Depth = {
  bounding:0,
  line:1,
  overlap:2,
  ring:3,
  text:4
}



export default function SunburstChart(config) {
  // onclick = ()=>{
  //   // that.updatePos()
  //   that._handleCollision()
  // }
  const that = {
    resizeObserver: null,
    onElementClick(fn) {
      this.handleElementClick = fn;
    },
    _rings:[],
    _constrain(node,margin=0){
      let [left, right, top, bottom] = [
        0 +margin, 
        this.stage.getViewportWidth()-margin,
        0 +margin, 
        this.stage.getViewportHeight()-margin
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
          let minDist = (o1.radius + o2.radius)

          if (centerAxisLength < minDist) {
            let diff = centerAxis.clone().setLength((centerAxisLength - minDist)*.5)
            {
              let [boundingCircle] = [
                o2.parent.findChild({name:'boundingCircle'})[0]   
              ]
              boundingCircle.x += diff.x*-1
              boundingCircle.y += diff.y*-1
            }

            {
              let [boundingCircle] = [
                o1.parent.findChild({name:'boundingCircle'})[0]   
              ]
              boundingCircle.x += diff.x*1
              boundingCircle.y += diff.y*1
            }
          }
           
        }

      });

      outerRings.forEach(o2=>{
        o2 = o2.boundingCircle
        this._constrain(o2,o2.radius)
      })

      outerRings.forEach((o2)=>{
        o2 = o2.boundingCircle
        let [labelName,labelValue,line,line2,boundingCircle] = [
          o2.parent.findChild({name:'labelName'})[0],
          o2.parent.findChild({name:'labelValue'})[0],
          o2.parent.findChild({name:'line1'})[0],
          o2.parent.findChild({name:'line2'})[0],
          o2.parent.findChild({name:'boundingCircle'})[0]   
        ]


        labelName.x = boundingCircle.x
        labelName.y = boundingCircle.y-6


        labelValue.x = labelName.x
        labelValue.y = labelName.y + 18

        
        const { x: x1, y: y1, normalize }= o2.parent.getMiddleOfEdge();

        const dir = sign(normalize.x);

        line.x1 = x1
        line.y1 = y1
        line.x2 = x1  + normalize.x * 10 
        line.y2 = y1  + normalize.y * 10 


        line2.x1 = line.x1
        line2.y1 = boundingCircle.y
        line2.x2 = boundingCircle.x - dir*boundingCircle.radius
        line2.y2 = boundingCircle.y

        let interactive = intersectionPoint([
          line,line2
        ])

        if(interactive.intersectionExist){
          if(interactive.intersectionExist){

            if( asin(line.dir.clone().cross(new Vec(1,0))) < .087){
              line.x2 = line2.x1
              line.y2 = line2.y1
            }else{
              line.x2 = interactive.x
              line.y2 = interactive.y

              line2.x1 = interactive.x
              line2.y1 = interactive.y
            }
          }
        }
      })
     
    },
    clear(){
      this.stage.clear()
      this.stage.resize(config.$el.offsetWidth,config.$el.offsetHeight)
      this._rings = []
    },
    updateTitle(title){
      this.$title.innerHTML = title
    },
    updatePos(){

      if(this.overlapCircle){
        this.overlapCircle.x = config.x
        this.overlapCircle.y = config.y
      }

      this._rings.forEach(o=>{
        let [labelName,labelValue,line,line2,boundingCircle] = [
          o.findChild({name:'labelName'})[0],
          o.findChild({name:'labelValue'})[0],
          o.findChild({name:'line1'})[0],
          o.findChild({name:'line2'})[0],
          o.findChild({name:'boundingCircle'})[0]
        ]

        o.x = config.x
        o.y = config.y


        const { x, y } = o.getCenterPo();

        if (o.depth !==config.data.length-1) {
          labelName.x = x
          labelName.y = y

          labelValue.x = labelName.x
          labelValue.y = labelName.y + 18
        }


        if (o.depth === config.data.length-1) {
            const { x: x1, y: y1, normalize } = o.getMiddleOfEdge();

            line.x1 = x1
            line.y1 = y1
            line.x2 = x1  + normalize.x * 10 
            line.y2 = y1  + normalize.y * 10 

            const dir = sign(normalize.x);
            const labelNameWidth = labelName.getWidth()
            const labelValueWidth = labelValue.getWidth()

            const lableOffset = (labelNameWidth+labelValueWidth)*1.2

            const targetX =
            dir > 0
              ? this.stage.getViewportWidth()-lableOffset
              : lableOffset
            const diffX = targetX - line.x2;

            line2.x1 = line.x2
            line2.y1 = line.y2

            line2.x2 = line.x2+ diffX
            line2.y2 = line.y2

            // const labelNameWidth = labelName.getWidth()
            labelName.x = line2.x2 + dir*(labelNameWidth*1)
            labelName.y = line2.y2

            labelValue.x = labelName.x 
            labelValue.y = labelName.y + 16


            boundingCircle.x = labelName.x
            boundingCircle.y = labelName.y+5

        }

      })

    },
    updateData(data){
      config.title = {
        ...{text:'',x:0,y:20,size:16,color:'rgba(0,0,0,0.65)'},
        ...config.title,
      }

      config.line = {
        ...config.line,
        color:'#e8e8e8'
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

      if(this.stage.getViewportWidth()!==config.$el.offsetWidth){
        this.stage.resize(config.$el.offsetWidth,config.$el.offsetHeight)
        this.updatePos()
      }


      try{
        if(JSON.stringify(data)===JSON.stringify(this.data)){ 
          return
        }
      }catch(e){
        console.log('e:',e)
      }
      

      this.updatePos()
      
      this.data = data
      this.clear()

      let {stage} = this

      let overlapCircle = Circle({radius:config.radius})
      stage.add(overlapCircle)
      this.overlapCircle = overlapCircle
      overlapCircle.fillStyle = 'white'
      overlapCircle.visible = false
      overlapCircle.x = config.x
      overlapCircle.y = config.y
      overlapCircle.z = Depth.overlap
      overlapCircle.name = 'overlapCircle'
      overlapCircle.globalAlpha = 1

      const processedData = processData({ data, min: 0 });


      
      const stepRadius = config.radius / processedData.length;
      
      for (let i = 0, len = processedData.length; i < len; i++) {
        const children = processedData[i];
        const radius = (i / len) * config.radius;

        const levelConfig =  config.levels?.[i]
        const font = Object.assign({tx:0,ty:0,font:'13px Regular',mode:'break-world'},levelConfig.font ??{})
        const co = levelConfig?.color;

        const depthChilds = [];
        for (let j = 0, len = children.length; j < len; j++) {
          
          const childData = children[j];

          const radian = Math.max(childData.rad,0.01)

          let startRadian;
          let endRadian;

          if (j === 0) {
            startRadian = 0 - PI*.5;
            endRadian = startRadian + radian;
          } else {
            startRadian = depthChilds[j - 1].endRadian;
            endRadian =startRadian + radian
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
          ring.z = Depth.ring
          ring.fillStyle = co;
          ring.strokeStyle = 'white';
          ring.lineWidth = 3;
          ring.globalAlpha = 1;
          ring.userParams = { ...childData,color:co };
          ring.depth = i

          ring.getLines = (fn)=>{

            let line1 = ring.findChild({name:'line1'})[0]
            let line2 = ring.findChild({name:'line2'})[0]
            if(line1) fn(line1)
            if(line2) fn(line2)
          }

          if (ring.depth !== processedData.length-1) {
            const textName = Text({ text: childData.name });
            const { x, y } = ring.getCenterPo();
            ring.add(textName);
            textName.x = x + font.tx
            textName.y = y + font.ty
            textName.font = font.font
            textName.z = Depth.text
            textName.name = 'labelName'
            const textValue = Text({ text: childData.value });
            ring.add(textValue);
            textValue.font = font.font
            textValue.x = x + font.tx
            textValue.y = y + 18+ font.ty
            textValue.z = Depth.text
            textValue.name = 'labelValue'


            textName.shadowBlur = textValue.shadowBlur = font.shadowBlur
            textName.shadowOffsetX = textValue.shadowOffsetX = font.shadowOffsetX
            textName.shadowOffsetY = textValue.shadowOffsetY = font.shadowOffsetY
            textName.shadowColor = textValue.shadowColor = font.shadowColor
          }

          if (ring.depth === processedData.length-1) {

            const { x: x1, y: y1, normalize } = ring.getMiddleOfEdge();

            const line = Line({
              x1,
              y1,
              x2: x1 + normalize.x * 10,
              y2: y1 + normalize.y * 10,
            });
            line.name = 'line1'
            line.z = Depth.line
            ring.add(line);
            line.strokeStyle = config.line.color


            const dir = sign(normalize.x);

            const targetX =
            dir > 0
              ? this.stage.getViewportWidth()-100
              : 50
            const diffX = targetX - line.x2;
            const line2 = Line({
              x1: line.x2,
              y1: line.y2,
              x2: line.x2 + diffX,
              y2: line.y2,
            });
            ring.add(line2);
            line2.z = Depth.line
            line2.strokeStyle = config.line.color
            line2.name = 'line2'


            const labelName = Text({ text: childData.name });
            labelName.font = font.font
            labelName.fillStyle = '#6D7278';
            labelName.name = 'labelName'
            const labelNameWidth = labelName.getWidth()
            const labelNameHeight = labelName.getHeight()
            labelName.x = line2.x2 + dir*(labelNameWidth*.8+font.tx)
            labelName.y = line2.y2 + font.ty
            ring.add(labelName)
            labelName.z = Depth.text

            const labelValue = Text({ text: childData.value });
            ring.add(labelValue);
            labelValue.fillStyle = '#6D7278';
            labelValue.x = labelName.x 
            labelValue.y = labelName.y + 16
            labelValue.z = Depth.text
            labelValue.name = 'labelValue'

            labelName.shadowBlur = labelValue.shadowBlur = font.shadowBlur
            labelName.shadowOffsetX = labelValue.shadowOffsetX = font.shadowOffsetX
            labelName.shadowOffsetY = labelValue.shadowOffsetY = font.shadowOffsetY
            labelName.shadowColor = labelValue.shadowColor = font.shadowColor


            const labelValueWidth = labelValue.getWidth()
            const labeValueHeight = labelValue.getHeight()
            const boundRadius = new Vec(labelNameHeight+labeValueHeight,Math.max(labelNameWidth,labelValueWidth)).length()
            
            const boundingCircle = Circle({
              radius:boundRadius*.7
            })
            boundingCircle.name = 'boundingCircle'
            boundingCircle.attrName = 'boundingCircle-'+childData.name
            boundingCircle.fillStyle = 'transparent'
            // boundingCircle.strokeStyle = 'aqua'
            ring.add(boundingCircle)
            ring.boundingCircle = boundingCircle

            boundingCircle.x = labelName.x
            boundingCircle.y = labelName.y+5
            boundingCircle.z = Depth.bounding


          }

          depthChilds.push(ring);

          stage.add(ring);
        }
      }

      let currentClickElement = null
      stage.getShapes().forEach((item,i) => {
        item.onClick(() => {
          if(currentClickElement&&currentClickElement===item){
            currentClickElement = null
            this.handleElementCancel&&this.handleElementCancel(item)
            this._rings.forEach((n) => {
              n.globalAlpha = 1;
            });
          }else{
            currentClickElement = item

            that.handleElementClick(item.userParams);
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


          // item?.getLines?.(line=>{
          //   line.strokeStyle = 'gray'
          // })

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

          // item?.getLines?.(line=>{
          //   line.strokeStyle =  config.line.color
          // })
          
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

        this._rings.forEach(item=>{
          // item?.getLines?.(line=>{
          //   line.strokeStyle =  config.line.color
          // })

        })
      });
    },
    onElementCancel(fn){
      this.handleElementCancel = fn
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
          this._handleCollision()
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
