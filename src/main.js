import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App';
import goods from './components/goods/goods.vue';
import ratings from './components/ratings/ratings.vue';
import seller from './components/sell/seller.vue';
import './common/stylus/index.styl';
// Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(VueResource);

var routes = [
  { path: '/goods', component: goods },
  { path: '/ratings', component: ratings },
  { path: '/seller', component: seller }
];
let router = new VueRouter({
  routes,
  linkActiveClass: 'active'
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',  // App.vue
  components: { App }
});
// router.push('/ratings');
