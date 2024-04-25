<template>
  <div class="container">
    <h2>LOGIN</h2>
    <!-- Error message display on login failure -->
    <div v-if="isLogin" class="alert alert-danger">
      {{ loginError }}
    </div>
    <!-- Login form with email and password fields -->
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">E-MAIL:</label>
        <input
          type="email"
          id="email"
          placeholder="E-mail"
          v-model="email"
          required
        />
      </div>
      <div>
        <label for="password">PASSWORD:</label>
        <input
          type="password"
          id="password"
          placeholder="Password"
          v-model="password"
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      email: "", // Email input bound to this variable
      password: "", // Password input bound to this variable
      accessToken: null, // To store the accessToken after successful login
      loginError: "Login failed. Please check your username and password.", // Default login error message
      isLogin: false, // Flag to show/hide the login error message
    };
  },
  methods: {
    // Vuex actions for setting the access token and fetching user info
    ...mapActions("user", ["setAccessToken", "fetchUserInfo"]),

    async handleSubmit() {
      // Handles the form submission for login
      try {
        // Requesting access token from the OAuth token endpoint
        const accessTokenResponse = await axios.post(
          "https://iapitest.eva.guru/oauth/token",
          {
            Email: this.email,
            Password: this.password,
            GrantType: "password",
            ClientId: "C0001",
            ClientSecret: "SECRET0001",
            RedirectUri: "https://api.eva.guru",
            Scope: "amazon_data",
          }
        );
        // Storing the access token and setting it in Vuex store
        this.accessToken = accessTokenResponse.data.Data.AccessToken;
        this.setAccessToken(this.accessToken);
        // Fetching user information using the access token
        const userInfoResponse = await axios.post(
          "https://iapitest.eva.guru/user/user-information",
          {
            email: this.email,
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
        // On successful user information retrieval, navigate to user information page
        if (userInfoResponse.status === 200) {
          this.fetchUserInfo(userInfoResponse.data.Data);
          this.$router.push({ name: "UserInformation" });
        } else {
          // If user information retrieval fails, display login error
          this.isLogin = true;
        }
      } catch (error) {
        // Log error and show login error message on any exception
        console.error("Error:", error);
        this.isLogin = true;
      }
    },
  },
};
</script>

<style scoped>
/* Styles for the login form and its components */
.container {
  max-width: 320px;
  margin: 100px auto;
  padding: 40px;
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  font-size: 30px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 400;
}

form {
  width: 100%;
}

label {
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
  text-align: left;
  width: 100%;
  color: #333;
}

input[type="email"],
input[type="password"] {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

button {
  padding: 10px 15px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

button:hover,
button:focus {
  background-color: #0056b3;
}

::placeholder {
  color: #999;
}

@media (max-width: 768px) {
  .container {
    width: calc(100% - 40px);
  }
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
}
</style>
