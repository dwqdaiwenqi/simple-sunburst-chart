export declare type IElementClick = (params: Record<string, any>) => void;
export declare type IData = { name: string, value: number, meta: Record<string, any> };
export declare type ISunburstInstance = {
  onElementClick: (fn: IElementClick) => void
  render: () => void
  autoResize: () => void
  tooltip:(param:IData & {rad:number}, i:number) => void
};
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
}>): ISunburstInstance;

export default SunburstChart;
