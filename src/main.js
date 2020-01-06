import Vue from 'vue'
import App from './App.vue'
import {keycloak_token} from './keycloak'

// eslint-disable-next-line no-unexpected-multiline
(async()=>{
  await keycloak_token
  Vue.config.productionTip = false
  new Vue({
    render: h => h(App),
  }).$mount('#app')
})()
