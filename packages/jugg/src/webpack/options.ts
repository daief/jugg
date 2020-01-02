import * as fs from 'fs';
import merge from 'lodash/merge';
import { Jugg } from '..';
import { CHAIN_CONFIG_MAP } from '../env/chainCfgMap';
import { searchPlaces } from '../utils';
import { genUrlLoaderOptions, getStyleOpts, getTsOpts } from './opts';

export interface IConfigStore {
  [k: string]: (j: Jugg) => any;
}

/**
 * 用于统一管理 webpack 中插件、loader等等的配置项
 */
export class WebpackOptionsManager {
  jugg: Jugg;

  /**
   * 配置项存储对象
   */
  store: IConfigStore = {};

  /**
   * 维护的拦截层，用于干涉获取配置项时的值
   */
  private filters: Array<
    (id: string, preOpts: any, originalOpts: any) => any
  > = [];

  constructor({ jugg }: { jugg: Jugg }) {
    this.jugg = jugg;
    this.register(builtInOptions);
  }

  /**
   * 查找对应的配置项
   * @param id
   */
  findOpts(id: string) {
    const factory = this.store[id];
    const opts = typeof factory === 'function' ? factory(this.jugg) : void 0;
    return this.filters.reduce((result, filter) => {
      result = filter(id, result, opts);
      return result;
    }, opts);
  }

  /**
   * 注册配置项
   * @param id
   * @param factory
   */
  register(id: string | IConfigStore, factory?: (j: Jugg) => any) {
    if (typeof id === 'string') {
      this.store[id] = factory;
    } else {
      this.store = merge({}, this.store, id);
    }
  }

  /**
   * 添加拦截器
   * @param filter
   */
  addFilter(filter: (id: string, preOpts: any) => any) {
    this.filters.push(filter);

    return () => {
      // remove
      const idx = this.filters.findIndex(_ => _ === filter);
      if (idx > -1) {
        this.filters.splice(idx, 1);
      }
    };
  }
}

export const builtInOptions: IConfigStore = {
  [CHAIN_CONFIG_MAP.entry.INDEX]: () => {
    return './src/index';
  },
  [CHAIN_CONFIG_MAP.other.OUTPUT]: jugg => {
    const { IsProd } = jugg;
    const { publicPath, filename, outputDir } = jugg.JConfig;
    const o = {
      path: jugg.Utils.getAbsolutePath(outputDir),
      filename: '[name].[hash].js',
      chunkFilename: '[name].[chunkhash].js',
      publicPath,
    };

    if (IsProd) {
      return {
        ...o,
        filename: `${filename}.js`,
      };
    }

    return {
      ...o,
      filename: '[name].js',
      chunkFilename: '[name].js',
    };
  },
  [CHAIN_CONFIG_MAP.plugin.DEFINE_PLUGIN]: jugg => {
    const { define } = jugg.JConfig;
    // plugin options should return array
    return [
      Object.keys(define).reduce<any>((result, key) => {
        result[key] = JSON.stringify(define[key]);
        return result;
      }, {}),
    ];
  },
  [CHAIN_CONFIG_MAP.rule.IMAGES_RULE]: genUrlLoaderOptions,
  [CHAIN_CONFIG_MAP.rule.SVG_RULE]: () => ({
    name: 'static/[name].[hash:8].[ext]',
  }),
  [CHAIN_CONFIG_MAP.rule.MEDIA_RULE]: genUrlLoaderOptions,
  [CHAIN_CONFIG_MAP.rule.FONTS_RULE]: genUrlLoaderOptions,
  [CHAIN_CONFIG_MAP.rule.TS_RULE]: getTsOpts,
  [CHAIN_CONFIG_MAP.rule.TSX_RULE]: getTsOpts,
  [CHAIN_CONFIG_MAP.rule.JS_RULE]: getTsOpts,
  [CHAIN_CONFIG_MAP.rule.JSX_RULE]: getTsOpts,
  [CHAIN_CONFIG_MAP.plugin.FORK_TS_CHECKER_PLUGIN]: jugg => {
    const TS_CONFIG_FILE = jugg.Utils.getAbsolutePath(
      process.env.JUGG_TS_PROJECT || 'tsconfig.json',
    );
    return [
      {
        tsconfig: TS_CONFIG_FILE,
        checkSyntacticErrors: true,
        formatter: 'codeframe',
      },
    ];
  },
  [CHAIN_CONFIG_MAP.rule.IMAGES_IMAGE_WEBPACK_LOADER_RULE]: () => ({
    mozjpeg: {
      progressive: true,
      quality: 65,
    },
    // optipng.enabled: false will disable optipng
    optipng: {
      enabled: false,
    },
    pngquant: {
      quality: '65-90',
      speed: 4,
    },
    gifsicle: {
      interlaced: false,
    },
    // the webp option will enable WEBP
    // webp: {
    //   quality: 75,
    // },
  }),
  // --- style
  [CHAIN_CONFIG_MAP.rule.CSS_MODULE_RULE]: jugg => {
    const isModule = true;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: false,
    };
  },
  [CHAIN_CONFIG_MAP.rule.CSS_RULE]: jugg => {
    const isModule = false;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: false,
    };
  },
  [CHAIN_CONFIG_MAP.rule.CSS_IN_NODE_MODULES_RULE]: jugg => {
    const isModule = false;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: false,
    };
  },
  [CHAIN_CONFIG_MAP.rule.LESS_MODULE_RULE]: jugg => {
    const isModule = true;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: true,
    };
  },
  [CHAIN_CONFIG_MAP.rule.LESS_RULE]: jugg => {
    const isModule = false;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: true,
    };
  },
  [CHAIN_CONFIG_MAP.rule.LESS_IN_NODE_MODULES_RULE]: jugg => {
    const isModule = false;
    return {
      ...getStyleOpts(jugg, isModule),
      isModule,
      less: true,
    };
  },
  // --- style end
  [CHAIN_CONFIG_MAP.plugin.BASE_HTML_PLUGIN]: jugg => {
    const { Utils, JConfig, IsProd } = jugg;
    const userTpl = Utils.getAbsolutePath('src', 'document.ejs');
    const htmlOpt: any = {
      filename: 'index.html',
      inject: true,
    };
    if (fs.existsSync(userTpl)) {
      htmlOpt.template = 'src/document.ejs';
    }
    const minify = IsProd
      ? {
          caseSensitive: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: false,
          removeComments: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
        }
      : {};
    return [
      {
        minify,
        ...htmlOpt,
        ...JConfig.html,
      },
    ];
  },
  [CHAIN_CONFIG_MAP.plugin.BUNDLE_ANALYZER]: () => {
    return [
      {
        analyzerMode: 'server',
        analyzerPort: process.env.ANALYZE_PORT || 8888,
        openAnalyzer: true,
        // generate stats file while ANALYZE_DUMP exist
        generateStatsFile: !!process.env.ANALYZE_DUMP,
        statsFilename: process.env.ANALYZE_DUMP || 'stats.json',
      },
    ];
  },
  [CHAIN_CONFIG_MAP.plugin.HARD_SOURCE_PLUGIN]: jugg => {
    return [
      {
        environmentHash: {
          root: jugg.context,
          directories: ['config'],
          files: ['package-lock.json', 'yarn.lock', ...searchPlaces('jugg')],
        },
      },
    ];
  },
  [CHAIN_CONFIG_MAP.plugin.CLEAN_WEBPACK_PLUGIN]: jugg => {
    const { JConfig } = jugg;
    const { outputDir } = JConfig;
    return [
      [outputDir],
      {
        root: jugg.context,
      },
    ];
  },
  [CHAIN_CONFIG_MAP.plugin.MINI_CSS_EXTRACT]: jugg => {
    const { JConfig } = jugg;
    const { filename } = JConfig;
    return [
      {
        filename: `${filename}.css`,
        chunkFilename: `${filename}.css`,
      },
    ];
  },
  [CHAIN_CONFIG_MAP.minimizer.OPTIMIZE_CSS_ASSETS]: jugg => {
    const { JConfig } = jugg;
    const { sourceMap } = JConfig;
    return [
      {
        cssProcessorOptions: {
          // set to false if you want CSS source maps
          ...(sourceMap === true
            ? {
                map: { inline: false },
              }
            : {}),
        },
      },
    ];
  },
  [CHAIN_CONFIG_MAP.minimizer.UGLIFYJS_WEBPACK]: jugg => {
    const { JConfig } = jugg;
    const { sourceMap } = JConfig;
    return [
      {
        sourceMap,
        cache: true,
        parallel: true,
      },
    ];
  },
  [CHAIN_CONFIG_MAP.minimizer.SPLIT_CHUNKS]: () => ({
    cacheGroups: {
      vendors: {
        name: 'vendors',
        chunks: 'all',
        test: /[\\/]node_modules[\\/]/,
      },
      commons: {
        name: 'commons',
        chunks: 'async',
        minChunks: 2,
      },
    },
  }),
};
