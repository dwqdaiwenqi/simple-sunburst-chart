const Group = ()=>{
  const that = {
    name:'',
    elements:[],
    userParams: {},
    add(element){
      if(this.c){
        element.c = this.c
      }
      this.elements.push(element)
    }
  }
  return that
}
export default Group