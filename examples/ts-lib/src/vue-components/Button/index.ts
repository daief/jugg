import Button from './button.vue';

// @ts-ignore
Button.install = (Vue: any) => {
  Vue.component(Button.name, Button);
};

export default Button;
