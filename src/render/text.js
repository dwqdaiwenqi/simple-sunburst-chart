const Text = ({ text }) => {
  const that = {
    name: 'text',
    font: '14px Regular',
    textBaseline: 'middle',
    textAlign: 'center',
    fillStyle: 'white',
    shadowOffsetX:0,
    shadowOffsetY:0,
    shadowBlur:0,
    shadowColor:'rgba(0,0,0,0)',
    x: 0,
    y: 0,
    init() {
      this.text = text;
      return this;
    },
    getWidth () {
      let measureCtx = document.createElement('canvas').getContext('2d')
      return measureCtx.measureText(text).width
    },
    update(c) {
      c.save();
      c.font = this.font;
      c.fillStyle = this.fillStyle;
      c.textBaseline = this.textBaseline;
      c.textAlign = this.textAlign;

      c.shadowColor = this.shadowColor
      c.shadowOffsetX = this.shadowOffsetX
      c.shadowOffsetY = this.shadowOffsetY
      c.shadowBlur = this.shadowBlur

      c.fillText(text, this.x, this.y);

      c.restore();
    },
  };
  return that.init();
};
export default Text