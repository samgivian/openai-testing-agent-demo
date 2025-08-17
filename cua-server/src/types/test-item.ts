export interface TestItem {
  url: string;
  text: string;
  shouldClick: boolean;
  /** Optional HTML element tag, e.g. "button" or "h1". */
  elementType?: string;
  /**
   * Optional label associated with an input box. Used to locate the input by its
   * visible label.
   */
  inputLabel?: string;
  /** Optional test id used to locate an input box. */
  testId?: string;
  /** Value to enter into the located input box. */
  inputValue?: string;
  checkNavigation?: boolean;
  fontColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontType?: string;
  navigationUrl?: string;
  eventName?: string;
  /**
   * How text should be matched on the page. Defaults to substring matching
   * ("contains") when not specified.
   */
  textMatch?: "exact" | "contains";
}
