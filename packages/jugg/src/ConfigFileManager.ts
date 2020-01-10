import { existsSync, lstatSync } from 'fs';
import { Jugg } from '.';

const fileExists = (file: string) =>
  existsSync(file) && lstatSync(file).isFile();

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

  /**
   * 设置 tsconfig file
   * 当且仅当文件存在时才能设置成功
   */
  set Tsconfig(file: string) {
    if (!fileExists(file)) {
      return;
    }
    this.tsconfig = file;
  }

  private resolveTs() {
    const { Utils } = this.jugg;
    this.tsconfig = Utils.getAbsolutePath(
      process.env.JUGG_TS_PROJECT || 'tsconfig.json',
    );
    // tsconfig 不存在，将值置空
    if (!fileExists(this.tsconfig)) {
      this.tsconfig = '';
    } else {
      Utils.logger.info(`[jugg] tsconfig at: ${this.tsconfig}`);
    }
  }
}
