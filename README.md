# sunburst-chart
为了满足产品需求而手写（撕）的一个项目，务必暂时按照 demo 的配置使用

demo 在线地址：https://dwqdaiwenqi.github.io/sunburst-demo/demo/   

效果：
<img src="./preview1.png">
### 运行方式
1、安装依赖
```bash
npm i sunburst-chart@latest
```

2、本地体验
```bash
http-server ./ -p 8888
```
本地地址：http://localhost:8888/demo

### 使用
```html
<script type="module">
  import Sunburst from '../src/index.js'

  let chart = Sunburst({
    data: [...data],
    $el: document.querySelector('#place'),
    gap: 10,
    levels: [
      { color: '#536686' },
      { color: '#5284f5' },
      { color: '#b5cbfd' },
    ],
  });

  chart.autoResize();

  chart.onElementClick((params) => {
    console.log(params.meta)
  });

</script>

```