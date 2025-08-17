export interface TestItem {
  url: string;
  text: string;
  shouldClick: boolean;
  checkNavigation?: boolean;
  fontColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontType?: string;
  navigationUrl?: string;
  eventName?: string;
  /**
   * Whether the supplied text should be matched exactly or as a substring.
   * Defaults to "contains" when omitted.
   */
  textMatch?: "exact" | "contains";
}
