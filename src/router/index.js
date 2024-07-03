// src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../components/LoginFirebase.vue';
import {auth} from "@/firebase";
import Gastos from "@/components/Dashboard.vue";


Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/inicio',
    name: 'Inicio',
    component: Gastos,
    meta: {requireAuth: true}
  },
];


const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  const requireAuth = to.matched.some(record => record.meta.requireAuth)
  const user = auth.currentUser
  if(requireAuth && !user) {
    next('/')
  } else {
    next()
  }
})

export default router;
