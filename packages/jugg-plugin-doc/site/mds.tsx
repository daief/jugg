/* 该文件自动生成，作为 md 文件的数据源以供项目中使用 */
import flatten from 'lodash/flatten';
import { mountReactGlobal } from './theme/template/utils';

mountReactGlobal();

const mds: Record<string, any> = {
  docs: {
    // 'README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/README.md'),
    // 'CONTRIBUTING.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/CONTRIBUTING.md'),
  },
  'dds-cli': {
    // 'devTools/dds-cli/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/dds-cli/README.md'),
    // 'devTools/dds-cli/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/dds-cli/CHANGELOG.md'),
  },
  'deps-check': {
    // 'devTools/deps-check/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/deps-check/README.md'),
    // 'devTools/deps-check/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/deps-check/CHANGELOG.md'),
  },
  doc: {
    // 'devTools/doc/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/doc/README.md'),
    // 'devTools/doc/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/doc/CHANGELOG.md'),
  },
  upup: {
    // 'devTools/upup/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/upup/README.md'),
    // 'devTools/upup/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/upup/CHANGELOG.md'),
  },
  'yarn-ws-pub': {
    // 'devTools/yarn-ws-pub/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/yarn-ws-pub/README.md'),
    // 'devTools/yarn-ws-pub/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/devTools/yarn-ws-pub/CHANGELOG.md'),
  },
  'antd-plus': {
    // 'packages/antd-plus/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/README.md'),
    // 'packages/antd-plus/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/CHANGELOG.md'),
    // 'packages/antd-plus/docs/BraftEditor.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/BraftEditor.md'),
    // 'packages/antd-plus/docs/DragableTable.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/DragableTable.md'),
    // 'packages/antd-plus/docs/DynamicCol.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/DynamicCol.md'),
    // 'packages/antd-plus/docs/HideContent.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/HideContent.md'),
    // 'packages/antd-plus/docs/ImageViewer.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/ImageViewer.md'),
    // 'packages/antd-plus/docs/MobileView.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/MobileView.md'),
    // 'packages/antd-plus/docs/RcImage.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/RcImage.md'),
    // 'packages/antd-plus/docs/Utils.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/antd-plus/docs/Utils.md'),
  },
  data: {
    // 'packages/data/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/data/README.md'),
    // 'packages/data/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/data/CHANGELOG.md'),
  },
  eros__types: {
    // 'packages/types/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/types/README.md'),
    // 'packages/types/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/types/CHANGELOG.md'),
  },
  logger: {
    // 'packages/logger/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/logger/README.md'),
    // 'packages/logger/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/logger/CHANGELOG.md'),
  },
  native: {
    // 'packages/native/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/native/README.md'),
    // 'packages/native/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/native/CHANGELOG.md'),
  },
  'next-config': {
    // 'packages/next-config/README.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/next-config/README.md'),
    // 'packages/next-config/CHANGELOG.md': require('/Users/daief/Documents/front-end/tasks/eros-npm/packages/next-config/CHANGELOG.md'),
  },
};

function getPageMap() {
  const map = new Map<string, any>(
    flatten(
      Object.keys(mds).map(category => {
        const item = mds[category];
        return Object.keys(item).map(itemK => {
          const md = item[itemK];
          const { metadata } = md;
          const { route } = metadata;
          md.category = category;
          return [
            '/' +
              encodeURIComponent(category) +
              '/' +
              encodeURIComponent(route || itemK),
            md,
          ];
        });
      }),
    ),
  );
  return map;
}

export default mds;
export const pageMap = getPageMap();
