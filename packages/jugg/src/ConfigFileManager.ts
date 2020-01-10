import { existsSync, lstatSync } from 'fs';
import { Jugg } from '.';

/**
 * 管理配置文件，统一从这里读取
 */
export class ConfigFileManager {
  /**
   * ts 配置文件，不存在时为空
   */
  private tsconfig: string;
  private jugg: Jugg;

  constructor({ jugg }: { jugg: Jugg }) {
    this.jugg = jugg;
    this.resolveTs();
  }

  get Tsconfig() {
    return this.tsconfig;
  }

  resolveTs() {
    const { Utils } = this.jugg;
    this.tsconfig = Utils.getAbsolutePath(
      process.env.JUGG_TS_PROJECT || 'tsconfig.json',
    );
    // tsconfig 不存在，将值置空
    if (existsSync(this.tsconfig) && lstatSync(this.tsconfig).isFile()) {
      this.tsconfig = '';
    }
  }
}
