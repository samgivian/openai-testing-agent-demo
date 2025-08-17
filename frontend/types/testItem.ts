export interface TestItem {
  url: string;
  text: string;
  shouldClick: boolean;
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
   * Whether the supplied text should be matched exactly or as a substring.
   * Defaults to "contains" when omitted.
   */
  textMatch?: "exact" | "contains";
}
