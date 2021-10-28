import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './Router'
import App from './App.vue'

let app = createApp(App);

app.use(ElementPlus)
app.use(router);
app.mount('#app');
