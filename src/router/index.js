import { createRouter, createWebHashHistory } from 'vue-router'; // Vue 3'te bu şekilde Vue Router'u import edin
import UserInformation from '@/components/UserInformation.vue';
import LoginPanel from '@/components/LoginPanel.vue';




const routes = [
  {
    path: '/',
    name: 'LoginPanel',
    component: LoginPanel
  },
  {
    path: '/user-information',
    name: 'UserInformation',
    component: UserInformation
  }
];

const router = createRouter({
  history: createWebHashHistory(), 
  routes
});

export default router;


