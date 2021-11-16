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
export default Text