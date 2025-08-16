export interface TestItem {
  url: string;
  text: string;
  shouldClick: boolean;
  fontColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontType?: string;
  navigationUrl?: string;
  eventName?: string;
}
