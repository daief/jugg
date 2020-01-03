export interface IArgOpts {
  dev: boolean;
  build: boolean;
}

export interface IOptions {
  source?: Record<string, ISourceSchema>;
}

export type ISourceSchema = string | string[];
