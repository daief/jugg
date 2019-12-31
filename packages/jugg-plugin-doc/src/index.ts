/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2019-05-29 09:58:00
 * @Description:
 */
import { PluginAPI } from '@axew/jugg/types/PluginAPI';

export default function(api: PluginAPI, _ = {}) {
  api.registerCommand({
    command: 'doc',
    description: 'build documents',
    option: [],
    action: () => {
      // tslint:disable-next-line: no-console
      console.log('plugin doc');
    },
  });
}
