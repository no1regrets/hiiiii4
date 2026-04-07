declare module 'mammoth' {
    interface ExtractResult {
      value: string;
      messages: string[];
    }
  
    interface ExtractOptions {
      buffer: Buffer;
    }
  
    function extractRawText(options: ExtractOptions): Promise<ExtractResult>;
  }