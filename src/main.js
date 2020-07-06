window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js').default;
require('bootstrap');

import Vue from 'vue'
import App from './App.vue'

window.moment = require('moment');
import swal from 'sweetalert';

window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Vuex from 'vuex'
Vue.use(Vuex)

const moduleSidebar={
    namespaced: true,
    state:{
        statusSidebar: false
    },
    mutations: {
        open(state){
            state.statusSidebar=true;
        },
        close(state){
            state.statusSidebar=false;
        }
    }
}

window.store=new Vuex.Store({
    state: {
        cuenta: JSON.parse(localStorage.getItem('cuenta_sistema'))||null,
    },
    modules:{
        'sidebar': moduleSidebar
    },
    mutations: {
      auth_success(state,cuenta){
        state.cuenta=cuenta;
        localStorage.setItem('cuenta_sistema',JSON.stringify(state.cuenta));
        axios.defaults.headers.common['Authorization'] = state.cuenta.api_token;
      },
      auth_close(state){
        state.cuenta=null;
        localStorage.removeItem('cuenta_sistema');
      }
    },
    actions: {}
});
if (store.state.cuenta!=null) {
    axios.defaults.headers.common['Authorization'] = store.state.cuenta.api_token;
}



/**
 * Router
 */
import VueRouter from 'vue-router'
Vue.use(VueRouter)

var login=(to, from,next)=>{
  $('.modal-backdrop').remove();
  // $('.background-sidebar').remove();
  next();
};
var auth=(to, from,next)=>{
  $('.modal-backdrop').remove();
  store.state.sidebar.statusSidebar=false;
  if(store.state.cuenta===null){
      next('/login');
  }else{
      next(); 
  }
}


var routes =[
  {
    path: '/tareo',
    component: require('./view/tareo.vue').default,
    beforeEnter: auth  
  },
  {
    path: '/home',
    component: require('./view/home.vue').default,
    beforeEnter: auth  
  },
  {
    path: '/sincronizador',
    component: require('./view/sincronizador.vue').default,
    beforeEnter: auth  
  },
  {
    path: '/',
    redirect: '/tareo'
  },
  { 
    path: '/login', 
    component: require('./view/login.vue').default,
    beforeEnter: login,
    meta:{
      layout: "empty",
    },
  },
];
var router=new VueRouter({
  // mode: 'history',
  routes,
  linkActiveClass: 'active'
});

/**
 * dashboard
 */
Vue.component('empty',require("./layouts/empty.vue").default);
Vue.component('panel',require("./layouts/panel.vue").default);

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
