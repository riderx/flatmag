import { createApp } from 'vue'
import { createMetaManager } from 'vue-meta'
import App from './App.vue'
import router from './router'
import { pinia } from './store/mainStore'
import './index.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(createMetaManager())

app.mount('#app')
