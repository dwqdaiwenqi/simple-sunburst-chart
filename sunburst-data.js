let data = [
  [{name:'2021年',value:100}],
  [{name:'Q',value:50},{name:'Q2-50',value:50},{name:'Q3',value:20},{name:'Q4',value:30}],
  [
    {name:'1月',value:19},{name:'2月',value:15},{name:'3月',value:10},{name:'4月',value:10},
    {name:'5月',value:10},{name:'6月',value:15},{name:'7月',value:10},{name:'8月',value:10},
    {name:'9月',value:10},{name:'10月',value:15},{name:'11月',value:10},{name:'12月',value:1}
  ],
]



let minVal = .01
// 归一化数据
let wrappedData =  data.map(arr=>{
  let sumVal = arr.reduce((previousValue,currentValue)=>{
    return previousValue + currentValue.value
  },0)

  return [...arr].map((item)=>{
    // 0 - 1
    let fac = item.value/sumVal
    fac = Math.max(minVal,fac)
    return {
      ...item,
      // 0 - 2PI
      rad: fac*Math.PI*2
    }
  })
})



export default wrappedData