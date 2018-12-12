import { Plugin, Jugg } from '@jugg/jugg';

const p: Plugin = (jugg: Jugg, _: any) => {
  // tslint:disable
  console.log('jugg-plugin-react', jugg, _);

  return ({ config }) => {
    config.end();
  };
};

export default p;
