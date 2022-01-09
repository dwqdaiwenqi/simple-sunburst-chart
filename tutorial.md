# 前端可视化之旭日图

## 写前面
图表在前端开发中是见怪不怪了，常用的图表有：柱状图、饼图、折线图、面积图、雷达图，等等... 其中大部分的图表我们用业界常用的图表库（echarts、g2）通过一些配置项都能满足需求。但总有一些比较冷门的图表，再在基础上增加一些神奇的自定义交互与视觉，通过配置项**已经无法实现**了，如下:


<img src="https://latex.codecogs.com/svg.image?\vec{a}" title="\vec{a}" />

$\vec{a}$
![preview2.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab0e370034b84b51bc2bbb1e2ce9a90c~tplv-k3u1fbpfcp-watermark.image?)

痛点有那么几个：
* 最内层是个圆 （旭日图最内层不存在圆）
* 每层圆环的内外半径不一致
* 最外层 label 并不在圆环上，而是一种常见的饼图 label 布局样式

~~所以这个需求做不了~~
所以需要自己绘制出这个旭日图。

## 渲染引擎
经过衡量，决定实现一个为以上旭日图量身定制的渲染引擎。你可能会问：为什么不用现成的轮子呢？主要有以下几点思考：
* 此图并没有特别复杂的交互与视觉
* 为绘制图表而生的渲染引擎业界很少，文档不友好
* 如使用前端游戏开发的渲染引擎，体积太大，实属大炮轰蚊子

所以，这个渲染引擎只需要实现满足这个旭日图的**最少功能集**即可，引擎会涵盖以下这些特性：
* 基本的元素绘制: 支持 `text`、`line`、`ring`、 `circle`、`rect`
* 对象的交互事件: 支持 `mouseover`、`mouseout`、`mousemove`、`click`
* 坐标变换的抽象: 使用姿势为 `obj.scale = 2`， `obj.x = 11`，`obj.rotate = 10`..
* 便捷的管理元素：任何对象都会继承 `group`，使用姿势为 `stage.add(element)`， `element.add(element)` ，`stage.remove(element)`

### 引擎架构

![preview3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a0c5aa605bd49c2a75c22803b324da2~tplv-k3u1fbpfcp-watermark.image?)

* `Vector2D`类支持一些基本的向量运算，有：`add`、`sub`、`multiplyScalar`、`length`、`rotateAround`、`dot`、`cross`、`setLength`、`normalize` 操作

* `Matrix2D`类在图形变换中会使用，有：`rotation`、`translation`、`scaling`、`multiply`操作
* `intersectionPoint`是个工具方法，用于检测两条直线是否相交
* `Stage`是场景类，继承自 `Group`，掌管着整个场景，包括：场景的创建，销毁；对象的事件交互；对象的添加、删除等操作
* `Shape`是图形类，继承自 `Group`，是各类图形对象的基类

**整个引擎非常的小，没有相关冗余代码，轻量、纯粹**

基本使用如下：
```js
import {Stage,Ring,Circle} from './render/index'
const stage  = Stage($el.offsetWidth,$el.offsetHeight,$el)

let circle  = Circle({radius:30})
stage.add(circle)
circle.fillStyle = 'blue'
circle.visible = false
circle.x = 100
circle.y = 100
circle.globalAlpha = 1

let ring = Ring({
    innerRadius:10,
    outerRadius:40,
    startRadian:-.8,
    endRadian:1
})
stage.add(ring)
ring.x = 150
ring.y = 100
ring.fillStyle = 'pink'
ring.strokeStyle = 'white';
ring.lineWidth = 3;
ring.globalAlpha = 1;

stage.tick(()=>{
  stage.update()
  //...
})

```
以上绘制出来的图形如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a34165454a94b1ba43a4b15b4f6e153~tplv-k3u1fbpfcp-watermark.image?)

可以看到，隐藏了繁琐的`Canvas2D`（底层 API 是这个）语法，能够非常方便的进行绘制。在实现「旭日图」的过程中，最麻烦的是`ring`对象的实现，只要充分理解了`ring`，其他图形对象的实现都是水到渠成。下面的篇幅都将介绍`ring`。

## Ring 绘制
**外圈** ring 的绘制是比较核心的，只要实现了外圈 ring 的绘制，剩下的**内圈** ring 只需要通过合适的配置参数就可以绘制出来。外圈 ring 是由一个圆环(ring)、文字(text)、两条线段(line)构成的。
### Ring 的路径绘制
ring 的路径绘制代码如下：
```js
drawPath(c) {
  const {
    innerRadius: ir,
    outerRadius: or,
    startRadian: sr,
    endRadian: er,
  } = this;

  c.beginPath();

  {
    this.mat = 
    new M2().scaling(dpr,dpr)
    .multiply(new M2().translation(this.x,this.y))
    .multiply(new M2().rotation(this.rotate))
    .multiply(new M2().scaling(this.scale))
    .multiply(new M2().translation(-this.originX,-this.originY))
    c.setTransform(...this.mat.elements)
  }

  c.arc(0,0, or, sr, er);

  c.arc(
    0, // 圆心x
    0, // 圆心y
    ir, // 圆弧的半径
    er, // 圆弧的开始弧度
    sr, // 圆弧的结束弧度
    true, // 逆时针绘制
  );
  c.closePath();
},
     
```
`drawPath` 绘制函数可以分成两部分理解：
* 使用 `Matrix2D` 对点进行一系列变换，`this.mat` 矩阵变量解释为：**场景缩放矩阵 * 模型矩阵**。场景缩放矩阵的缩放系数为`dpr`，其值是`window.devicePixelRatio`，是用来配合解决**高分辨率屏下 canvas 模糊问题**。
* 用内置 `arc`指令在 (0,0) 处绘制两个弧，当调用 `closePath` 后，两个弧的两个端点会自动连接（Canvas2D API 牛逼），这样 ring 的 path 就完成了。需要注意的是，第二段弧得**逆时针**绘制。


### Line 和 Label 绘制
在绘制 `line` 和 `label` 之前，我们得先从 `ring` 上计算出一些信息，以便于后面的绘制，如下图所示：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cf101204bb84341b5fb8f125ada158b~tplv-k3u1fbpfcp-watermark.image?)

计算代码如下：

```js
Object.defineProperties(this,{
    edge1:{
      get(){ return new Vec2(Math.cos(this.startRadian),Math.sin(this.startRadian)) }
    },
    edge2:{
      get(){ return new Vec2(Math.cos(this.endRadian),Math.sin(this.endRadian)) }
    },
    normal:{
      get(){ return this.edge1.rotateAround(new Vec2(0,0),(this.endRadian-this.startRadian)*.5) }
    },
    po:{
      get(){ return new Vec2(this.x,this.y)}
    },
    p0:{
      get(){return this.po.add( this.edge1.multiplyScalar(this.innerRadius)  )}
    },
    p1:{
      get(){return this.po.add( this.edge1.multiplyScalar(this.outerRadius)  )}
    },
    p2:{
      get(){return this.po.add( this.edge2.multiplyScalar(this.outerRadius)  )}
    },
    p3:{
      get(){return this.po.add( this.edge2.multiplyScalar(this.innerRadius)  )}
    },
    p4:{
      get(){return this.po.add(
        this.normal.multiplyScalar(this.innerRadius+(this.outerRadius-this.innerRadius)*.5  )
      )}
    },
  })
```
`edge1` 和 `edge2` 是两个边的单位向量，分别用 `startRadian` 和 `endRadian` 计算得来。

`normal` 是法向量，可以对 `edge1` 旋转 `ring` 的一半弧度计算得来。

`po` 是 ring 的位置坐标。

`p0 ~ p3` 是 ring 各边顶点坐标，通过 `edge1` 和 `edge2` 计算得来。 

`p4` 是 ring 的中心位置，可以对法向量 `normal` 缩放至 `innerRadius + (outerRadius - innerRadius)*.5` 得到。

#### Line 的绘制
每个外圈 ring 中会有两个线段，第一个线段的坐标会和 ring 的**法向量**有关，第二个线段的坐标会和第一个线段水平连接，且线段长度会和场景宽度相关。

```js
const offset = 10
const linePos1 = ring.po.add(ring.normal.multiplyScalar(ring.outerRadius))
const linePos2 = ring.po.add(ring.normal.multiplyScalar(ring.outerRadius+offset))

const line = Line({
  x1: linePos1.x,
  y1: linePos1.y,
  x2: linePos2.x,
  y2: linePos2.y,
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


```
`line1` 的两个端点分别是在**法向量**方向上缩放至`outerRadius`和`outerRadius + offset` 得到的。

`line2 `的坐标需要与 `line1` 相连接，他的 `x2` 需要尽量撑满屏幕，所以会有一个 `diffX` 的计算。

#### Label 的绘制
内圈 label 的坐标位置就是中心点 `p4`，代码如下：
```js
let p = ring.p4
labelName.x = p.x
labelName.y = p.y - 10
```
外圈 label 的坐标大概位于 line2 端点处，代码如下：
```js
const dir = sign(ring.normal.x);
// ..
labelName.x = line2.x2 + dir*(labelNameWidth*1)
labelName.y = line2.y2
```
目前为止，已经绘制出来一个完整的外圈 ring 了，如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa787b972e5346c68dae38be85cce55a~tplv-k3u1fbpfcp-watermark.image?)
```js

```


## Ring 的事件交互
引擎中有四种交互事件，分别是：`mouseover`、`mouseout`、`mousemove`、`click`。在与旭日图的交互中，只需要考虑 `circle` 和 `ring` 这两种形状即可。`circle` 本质上是一个特殊的 `ring`，它的 `innerRadius` 是 0，`startRadian` 和  `endRadian` 分别是 `0`和 `2PI` 。所以，只要解决了与`ring`的交互，`circle` 也就顺带实现了。

上面几种交互事件的核心前置问题都是：**如何知道一个点在圆环内部？** 有两种方法（方向）来处理这个棘手问题：1）使用内置接口 `isPointInPath` 返回点是否在图形内部； 2）使用几何运算计算是否击中图形（我们选这个）

### 点在圆环内部
算法由三部分组成：
* 点是否在两个圆之间
* 点是否在两条边之间
* 圆环钝角和锐角的判断
上述三部分，每个步骤都会把检测点的范围限制得更小，最终实现想要的效果。

#### 两个圆之间
首先把检测点的范围限制在两个圆之间，具体来说就是：检测点到圆心的距离小于 `outerRadius` 并且要大于 `innerRadius`，如下图：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a308347e6cf47e1916a953de8b54db6~tplv-k3u1fbpfcp-watermark.image?)

代码如下：
```js
inPath(x,y){

  let centerAxisLen = new Vec2(x-this.x,y-this.y).length()
  
  // 检测范围在两个圆环之间
  if(centerAxisLen<this.outerRadius && centerAxisLen>this.innerRadius){

    return true
  }

  return false
},

```


#### 两条边之间
接下来需要再把检测范围限制在两个边之间，具体来说就是：检测点到圆心的向量要在 `edge1` 和`edge2` 之间，如下图：
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29b32301c3864f18850ba697584c00ea~tplv-k3u1fbpfcp-watermark.image?)
这里会用圆心到检测点的**射线向量**与 **p1p2线段** 进行相交检测，如果交点落在了 **p1p2** **线段**上，那么检测点在就两个边之间。

**射线与线段相交检测**

这里会用**参数化形式**来表示直线，如下图两条直线：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b328117912d4396be8d763507042fe2~tplv-k3u1fbpfcp-watermark.image?)

可以将两条直线表示成参数式形式，并建立方程组：

$$ 
\left\{ \begin{array}{c} 
\vec{AB}=A+\vec{v1}*t1 \\ 
\vec{CD}=C+\vec{v2}*t2 \\ 
\end{array}
\right. 
$$

其中 $\vec{v}$ 表示为直线的方向向量，`t`的取值范围决定了它的表现形式，如果为直线，那么`t`的取值范围就是$-\infty$到$+\infty$。

我们要知道两条直线是否相交，也就是上述方程组是有解的。这里使用了**克莱姆法则**进行求解，最后求解出的两个未知数公式为：

$t1=D_{t1}/D$

$t2=D_{t2}/D$

如果 $D=0$ 说明方程无解（两直线没有相交），求得的 `t1` 和 `t2` 的值决定了相交的形式，对于射线与线段的相交，`t2` 值的要小于 1 ，`t1` 值的范围会是 0 ~ 1。

方程求解部分代码如下：
```js
const intersectionPoint = (e) => {
  // p0 + v1*t1 = p2 + v2*t2

  // e[0].x1 + e[0].dir.x * t1 = e[1].x1 + e[1].dir.x * t2;
  // e[0].y1 + e[0].dir.y * t1 = e[1].y1 + e[1].dir.y * t2;

  // e[0].dir.x * t1 - e[1].dir.x * t2 = e[1].x1 - e[0].x1;
  // e[0].dir.y * t1 - e[1].dir.y * t2 = e[1].y1 - e[0].y1;

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
    y: 0,
    intersectionExist:null
  };

  let msg = ''
  if (D === 0) {
    msg = 'no solution'
  } else {

    let [t1, t2] = [Dx / D, Dy / D];

    msg = 'intersection!'
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
```
代码如下，进一步缩小检测返回：
```js
inPath(x,y){

  const helpAxis = Line({
    x1:this.p1.x,
    y1:this.p1.y,
    x2:this.p2.x,
    y2:this.p2.y
  })
  const mouseAxis = Line({
    x1:x,
    y1:y,
    x2:this.x,
    y2:this.y
  })

  let centerAxisLen = new Vec2(x-this.x,y-this.y).length()
  // 检测范围在两个圆环之间
  if(centerAxisLen<this.outerRadius && centerAxisLen>this.innerRadius){
    
    // 相交处理
    let interactive = intersectionPoint([
      helpAxis, mouseAxis
    ])

    if(interactive.intersectionExist){
      // 检测范围在两条边之间
      if(interactive.t1>=0&&interactive.t1<=1&&interactive.t2<1){
        return true
      }


    }
  }

  return false
},

```
### 圆环为钝角
上述方案只是在锐角的情况下运作，得对在角度 **大于 Math.PI** 情况稍处理一下，代码如下：
```js
inPath(x,y){

  const helpAxis = Line({
    x1:this.p1.x,
    y1:this.p1.y,
    x2:this.p2.x,
    y2:this.p2.y
  })
  const mouseAxis = Line({
    x1:x,
    y1:y,
    x2:this.x,
    y2:this.y
  })

  let centerAxisLen = new Vec2(x-this.x,y-this.y).length()
  // 检测范围在两个圆环之间
  if(centerAxisLen<this.outerRadius && centerAxisLen>this.innerRadius){
    // 相交处理
    let interactive = intersectionPoint([
      helpAxis, mouseAxis
    ])

    if(interactive.intersectionExist){
      // 大于 PI 说明是钝角，边的检测范围反着来即可
      if(Math.abs(this.endRadian-this.startRadian)>Math.PI){
          if(interactive.t1>=0&&interactive.t1<=1&&interactive.t2<1){
          }else{
            return true 
          }
      }else{
        // 检测范围在两条边之间
        if(interactive.intersectionExist){
          if(interactive.t1>=0&&interactive.t1<=1&&interactive.t2<1){
            return true
          }
        }
      }
    }
  }

  return false
},

```
至此，圆环选中的算法已经全部完成了 ～

现阶段完成度如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dedda6aee78c4b09a1dd086aab1ebc75~tplv-k3u1fbpfcp-watermark.image?)


## Label 的碰撞检测与响应
在数据量比较分散的情况下，是不会发生上图**粘**在一起问题的。但如果两个 `ring` 是紧紧挨着的，并且它们所占的数据比重差不多的话，就会发现 `label` **粘**在一起了。

### 碰撞检测
为每个 label 添加一个包围圆，判断任意两个圆形的**圆心距离**是否**小于某个阈值**，若小于则为碰撞，如下图所示：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef21dcd83639457798c9114b7b5bde95~tplv-k3u1fbpfcp-watermark.image?)


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b8a5f97ef6d43c492a310884812848a~tplv-k3u1fbpfcp-watermark.image?)

代码如下：
```js
 outerRings.forEach((o1, i) => {
    o1 = o1.boundingCircle
    for (let j = i + 1, len = outerRings.length; j < len; j++) {
      let o2 = outerRings[j].boundingCircle
      let centerAxis = new Vec(o2.x - o1.x, o2.y - o1.y);
      let centerAxisLength = centerAxis.clone().length();
      let minDist = (o1.radius + o2.radius)
      if (centerAxisLength < minDist) {
          // ...
      }
```

### 碰撞响应
当检到碰撞后，接下来需要用一个**推动向量**将它们分开，方向可以是**圆心连线的方向**，大小是**圆心距离**与**两半径和的差值一半**，代码如下：
```js
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
```
以上就解决了碰撞后的响应问题，两个球都会互相推动一小段距离，确保不**粘**在一起。当重新计算完坐标后，相关的元素都应按照最新位置重新计算一边，在此不做过多介绍。

最终如下：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac3bf976854e48fdbe112157d138a8b1~tplv-k3u1fbpfcp-watermark.image?)



## 最后
综上，介绍了在开发旭日图过程中的棘手问题以及「玩具」渲染引擎的实现，真正的渲染引擎远比这强大得多，比如 @antv/g，它是 Antv 全家桶中 G2、G2 plot 等的底层渲染引擎。

希望这篇文章能够让大家对平时出现在屏幕上的各类酷炫图表有更深的了解，并激起大家对前端可视化领域的兴趣。
