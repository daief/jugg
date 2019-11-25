import Toast from './Toast.vue';

// @ts-ignore
Toast.install = (Vue: any) => {
  Vue.component(Toast.name, Toast);
};

export default Toast;
