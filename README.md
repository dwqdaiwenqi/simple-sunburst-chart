# sunburst-chart
为了满足产品需求而手撕的一个旭日图，务必暂时按照 demo 的配置使用

demo 在线地址：https://dwqdaiwenqi.github.io/simple-sunburst-chart/demo/   

效果：
<img src="./preview1.png">
### 运行方式
1、安装依赖
```bash
npm i simple-sunburst-chart@latest
```

2、本地体验
```bash
http-server ./ -p 8888
```
本地地址：http://localhost:8888/demo

### 使用
```html
<div id="place" style="width:100%;height:500px;"></div>

<script type="module">
      import Sunburst from '../src/index.js'

    // let data = [
    //   [{name:'2021年',value:100,meta:{name:'2012'}}],
    //   [{name:'Q1',value:50,meta:{name:'q1'}},{name:'Q2',value:50,meta:{name:'q2'}},{name:'Q3',value:20,meta:{name:'q3'}},{name:'Q4',value:30,meta:{name:'q4'}}],
    //   [
    //     {name:'1月',value:19,meta:{name:'01'}},{name:'2月',value:15,meta:{name:'02'}},{name:'3月',value:10,meta:{name:'03'}},{name:'4月',value:10,meta:{name:'04'}},
    //     {name:'5月',value:10,meta:{name:'05'}},{name:'6月',value:15,meta:{name:'06'}},{name:'7月',value:10,meta:{name:'07'}},{name:'8月',value:10,meta:{name:'08'}},
    //     {name:'9月',value:10,meta:{name:'09'}},{name:'10月',value:15,meta:{name:'10'}},{name:'11月',value:10,meta:{name:'11'}},{name:'12月',value:1,meta:{name:'12'}}
    //   ],
    // ]

    let data = [[
      {"name":"2021年","value":150072,"meta":{"type":"year","value":1021,"title":"2021年","name":"2021年","format":"YYYY"}}],
      [{"name":"2021/1","value":37880,"meta":{"type":"season","value":123,"name":"2021/1","format":"YYYY/Q",
      "title":"2021/第1季度"}},
      {"name":"2021/2","value":100006,
      "meta":{"type":"season","value":2,
      "name":"2021/2","format":"YYYY/Q","title":"2021/第2季度"}},
      {"name":"2021/3","value":24137,"meta":{"type":"season","value":3,"name":"2021/3","format":"YYYY/Q",
      "title":"2021/第3季度"}},
      {"name":"2021/4","value":16719,"meta":{"type":"season","value":4,"name":"2021/4","format":"YYYY/Q",
      "title":"2021/第4季度"}}],
      [{"name":"2021/01","value":25463,"meta":{"type":"month","value":0,"name":"2021/01",
      "format":"YYYY/MM","title":"2021/01月"}},
      {"name":"2021/02","value":2077,"meta":{"type":"month","value":1,"name":"2021/02",
      "format":"YYYY/MM","title":"2021/02月"}},{"name":"2021/03","value":29940,"meta":{
        "type":"month","value":2,"name":"2021/03","format":"YYYY/MM","title":"2021/03月"}},
        {"name":"2021/04","value":12659,"meta":{"type":"month","value":3,"name":"2021/04",
        "format":"YYYY/MM","title":"2021/04月"}},{"name":"2021/05","value":33075,"meta":{
          "type":"month","value":4,"name":"2021/05","format":"YYYY/MM","title":"2021/05月"}},
          {"name":"2021/06","value":15552,"meta":{"type":"month","value":5,"name":"2021/06","format":"YYYY/MM","title":"2021/06月"}},{"name":"2021/07","value":20695,"meta":{"type":"month","value":6,"name":"2021/07","format":"YYYY/MM","title":"2021/07月"}},{"name":"2021/08","value":23420,"meta":
          {"type":"month","value":7,"name":"2021/08","format":"YYYY/MM","title":"2021/08月"}},{"name":"2021/09","value":52,"meta":{"type":"month","value":8,"name":"2021/09","format":"YYYY/MM","title":"2021/09月"}},
          {"name":"2021/10","value":11368,"meta":
          {"type":"month","value":9,"name":"2021/10","format":"YYYY/MM","title":"2021/10月"}},
          {"name":"2021/11","value":1401,"meta":{"type":"month","value":10,"name":"2021/11","format":"YYYY/MM","title":"2021/11月"}}]]

    onload = ()=>{
      let chart = Sunburst({
        data: [...data],
        $el: document.querySelector('#place'),
        gap: 10,
        levels: [
          { color: '#536686',font:{ shadowOffsetX:1,shadowOffsetY:1,shadowBlur:2,shadowColor:'rgba(0,0,0,.8)' } },
          { color: '#5284f5',font:{ shadowOffsetX:1,shadowOffsetY:1,shadowBlur:2,shadowColor:'rgba(0,0,0,.8)'  }},
          { color: '#b5cbfd' ,font:{ tx:20}},
        ],
        tooltip: (param) => {
          const wapSty = 'display:flex;align-items:center;'
          const nameSty = 'margin-right:16px;'
          const dotSty = `width:10px;height:10px;border-radius:5px;margin-right:7px;margin-top:2px;background:${param.color}`
          const valSty = 'margin-right:auto;font-weight:bold'
          return `
            <div style=${wapSty}>
              <div style=${dotSty}></div>
              <div style=${nameSty}>${param.name}</div>
              <div style=${valSty}>${param.value}</div>
            </div>
          `
        }
      });
  
      chart.autoResize();
      chart.onElementClick((params) => {
        console.log(params.meta)
        alert(params.name)
      });
    }


</script>

```