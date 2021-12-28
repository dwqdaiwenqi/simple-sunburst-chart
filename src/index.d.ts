export declare type IElementClick = (params: Record<string, any>) => void;
export declare type IData = { name: string, value: number, meta: Record<string, any> };
export declare type ISunburstInstance = {
  onElementClick: (fn: IElementClick) => void
  render: () => void
  autoResize: () => void
  onElementCancel:(item:T)=>void
  updateData:(data:T[][])=>void
  updateTitle:(title:string)=>void
};
export declare type IVec = {x:number,y:number}
declare function SunburstChart<T extends IData>(config: Partial<{
  data: T[][];
  x: number;
  y: number;
  gap: number;
  min: number;
  levels: any[];
  labelMode: 'space-between' | '';
  radius: number
  resizeObserver: ResizeObserver
  $el: HTMLDivElement | null
  tooltip:(param:IData & {rad:number,color:string}, i:number) => void
  title:Partial<{
    text:string
    size:number
    x:number
    y:number
    color:string
  }>,
  processLine:(
    userParams:IData & Record<string,any>,
    axis: IVec,
    rt:(vec: IVec,rad:number)=> IVec)
  =>{axis: IVec,length:number}
  effect?:'toggleElement'
}>): ISunburstInstance;

export default SunburstChart;
