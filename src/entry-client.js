/**
 * 客户端入口
 */
 import { createApp } from './app'

 // 客户端特定引导逻辑……
 
 const { app, router, store } = createApp()
 
 if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

 // 防止异步加载组件
 router.onReady(() => {
    app.$mount('#app')
  })
  
//  app.$mount('#app')