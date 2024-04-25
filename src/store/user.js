
export default {
  namespaced: true,
  state: {
    userInfo: null, // State to hold user information.
    accessToken : null, // State to hold the user's access token.
  },
  mutations: {
    // Mutation to set the user information.
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
     // Mutation to set the access token.
    SET_ACCESS_TOKEN(state, token) {
      state.accessToken = token;
    },
  },
  actions: {
     // Action to update the userInfo state.
    fetchUserInfo({ commit }, payload) {
      commit("setUserInfo", payload);
    },
      // Asynchronous action to set the access token.
    async setAccessToken({ commit }, token) {
      commit('SET_ACCESS_TOKEN', token);
    }
  },
};
