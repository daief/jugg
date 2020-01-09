export interface IArgOpts {
  dev: boolean;
  build: boolean;
}

export interface IOptions {
  source?: Record<string, ISourceSchema>;
  title?: string;
  description?: string;
}

export type ISourceSchema = string | string[];
