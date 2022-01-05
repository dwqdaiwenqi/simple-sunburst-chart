const Group = ()=>{
  const that = {
    name:'',
    elements:[],
    userParams: {},
    add(element){
      if(this.c){
        element.c = this.c
      }
      element.parent = this
      this.elements.push(element)
    },
    remove(){

    },
    findChild({name}={}){
      return this.elements.filter(n=>n.name===name)
    }
  }
  return that
}
export default Group