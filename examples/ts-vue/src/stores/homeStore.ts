import { MutationTree, ActionTree } from 'vuex';
import { RootState } from '../store';

export interface IHomeState {
  title: string;
}

const state: IHomeState = {
  title: 'home title',
};

export enum TYPES {
  SET_TITLE = 'SET_TITLE',
}

const mutations: MutationTree<IHomeState> = {
  [TYPES.SET_TITLE](s, newTitle: string) {
    s.title = newTitle;
  },
};

const actions: ActionTree<IHomeState, RootState> = {
  setTitle({ commit }, ele) {
    commit(TYPES.SET_TITLE, ele);
  },
};

export const homeStore = {
  namespaced: true,
  state,
  mutations,
  actions,
};
