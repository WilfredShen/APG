import Vue from 'vue'
import App from '@/App.vue'
import 'element-ui/lib/theme-chalk/index.css'
import DB from '@/static/js/indexedDB'

Vue.config.productionTip = false

Vue.prototype.$db = DB

DB.initDB();

import {
  Input,
  Radio,
  RadioGroup,
  Select,
  Option,
  OptionGroup,
  Button,
  Popover,
  Form,
  FormItem,
  Row,
  Col,
  Progress,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Link,
  MessageBox,
  Message,
} from 'element-ui';

Vue.use(Input);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Select);
Vue.use(Option);
Vue.use(OptionGroup);
Vue.use(Button);
Vue.use(Popover);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Row);
Vue.use(Col);
Vue.use(Progress);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Link);


Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message;

import router from './router'

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/register' || to.path === '/pwd') {
    next();
  } else {
    let storage = localStorage.getItem('apg-token')
    if (!storage || storage == '') {
      next('/login')
    } else {
      try {
        storage = JSON.parse(storage);
        if (!storage.username || !storage.time)
          next('/login')
      } catch (error) {
        next('/login')
      }
      var now = new Date().getTime()
      var diff = now - Number(storage.time)
      if (diff > 0 && diff <= 60 * 60 * 1000) {
        storage.time = now
        localStorage.setItem('apg-token', JSON.stringify(storage))
      } else {
        next('/login')
      }
    }
  }
  if (to.path === '/apg/paper') {
    if (!to.query || !to.query['difficulty'] || !to.query['number'] || !to.query['seed']) {
      next('/apg/nav')
    }
  }
  next()
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
