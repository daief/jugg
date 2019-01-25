import Vue from 'vue';
import Vuex from 'vuex';
import { IHomeState, homeStore } from './stores/homeStore';

Vue.use(Vuex);

export interface RootState {
  homeStore: IHomeState;
}

export default new Vuex.Store<RootState>({
  modules: {
    homeStore,
  },
});
