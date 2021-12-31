import M2 from './m2.js'

export default class Rect{
  constructor({x=0,y=0,color='black',scale=1,rotate=0,originX,originY,width=50,height=50}={}){
    this.x = x
    this.y = y
    this.color = color
    this.scale = scale
    this.rotate = rotate
    this.width = width
    this.height = height
    this.originX = originX ?? this.width*.5
    this.originY = originY ?? this.height*.5

    this.mat = new M2()
  }
  render(c){
    c.save()
    c.strokeStyle = this.color
    c.beginPath()
    
    {

      let transMat = new M2().translation(this.x,this.y)
      let rotMat = new M2().rotation(this.rotate)
      let scaleMat = new M2().scaling(this.scale)
      let originMat = new M2().translation(-this.originX,-this.originY)

      let mat = transMat
        .multiply(rotMat)
        .multiply(scaleMat)
        .multiply(originMat)
      
      this.mat = mat

      if(this.parent){
        this.mat = this.mat.multiply(this.parent.mat)
        console.log('this.mat:',this.mat)
      }

      c.setTransform(...this.mat.elements)
    }

    c.rect(0,0,this.width,this.height)
    c.closePath()
    c.stroke()
    c.restore()
  }
}