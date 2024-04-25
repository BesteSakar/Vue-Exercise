
import { createStore } from 'vuex';
import axios from 'axios';
import user from './user'; // Importing the user module for managing user state.

export default createStore({
  modules: {
    user, // Registering the user module with the store.
  },
  state: {
    userInfo: null, // Initial state for storing user information
  },
  mutations: {
     // Mutation to update the userInfo state.
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
  },
  actions: {
     // Asynchronous action to fetch user information from the backend.
    async fetchUserInfo({ commit }, { accessToken, email }) {
      try {
        const response = await axios.post(
          "https://iapitest.eva.guru/user/user-information",
          { email },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        commit('setUserInfo', response.data.Data);
      } catch (error) {
        console.error("Cannot Get User Informations.", error);

      }
    },
  },
});
