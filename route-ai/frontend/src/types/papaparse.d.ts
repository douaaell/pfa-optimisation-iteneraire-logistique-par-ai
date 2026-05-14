declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean;
    complete?: (results: ParseResult<any>) => void;
    error?: (error: any) => void;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  export function parse(input: any, config?: ParseConfig): void;
}
