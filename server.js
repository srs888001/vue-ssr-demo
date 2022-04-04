
const Vue = require("vue");
const fs = require('fs')

// 3======》使用html模板
// const renderer = require("vue-server-renderer").createRenderer({
//     template: fs.readFileSync('./index.template.html', 'utf-8')
// });

// 4======》使用打包的配置启动
// const serverBundle = require('./dist/vue-ssr-server-bundle.json')
// const template = fs.readFileSync('./index.template.html', 'utf-8')
// const clientManifest = require('./dist/vue-ssr-client-manifest.json')
// const { createBundleRenderer } = require('vue-server-renderer')
// const renderer = require("vue-server-renderer").createBundleRenderer(serverBundle, {
//     template, 
//     clientManifest
// });

// 5======> 动态编译打包
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const express = require("express");
const app = express();

// 4 & 5======》使用打包的配置启动
// 处理静态资源中间件，   请求前缀 和 打包的出口一致(webpack里面出口)
app.use('/dist', express.static('./dist'));

// 5======> 动态编译打包
const isProd = process.env.NODE_ENV === 'production'
let renderer
let onReady
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  onReady = setupDevServer(app, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}


// 5======> 动态编译打包
const render = async (req, res) => {
    // 6======> 使用promise
    try {
      const html = await renderer.renderToString({
        title: 'JerrySSR',
        meta: `
          <meta name="description" content="描述">
        `,
        url: req.url
      })
      res.setHeader('Content-Type', 'text/html; charset=utf8')
      res.end(html)
    } catch (err) {
      res.status(500).end('Internal Server Error.')
    }
  }

  // 服务端路由设置为 *，意味着所有的路由都会进入这里
  app.get("*", async (req, res) => {
    if (isProd) {
        render(req, res)
    } else {
        // 等待有了 Renderer 渲染器以后，调用 render 进行渲染
        await onReady
        render(req, res)
    }
  })
  

// // 4======》使用打包的配置启动
// app.get("/", (req, res) => {
//     renderer.renderToString({
//         title: 'JerrySSR',
//         meta: `
//         <meta name='description' context='描述'/>
//         `
//     },(err, html) => {
//         if (err) {
//             return res.status(500).end("Internal Server Error");
//         };

//         // 处理乱码
//         res.setHeader('Content-Type', 'text/html; charset=utf8')
//         res.end(html); 
//     });

// });

app.listen(3000, () =>
    console.log("app listening at http://localhost:3000")
);

// 3======》使用html模板
// app.get("/", (req, res) => {
//     const app = new Vue({
//         template: `
//         <div id="app">
//             <h1> {{ message }} </h1>
//             <div>
//                 <input v-model="message">
//             </div>

//             <div>
//                 <button @click="onClick">点点点</button>
//             </div>
//         </div>
//     `,
//         data: {
//             message: "我是哈哈哈123",
//         },
//         methods: {
//             onClick() {
//                 console.log('Srs ====>')
//             }
//         }
//     });

//     renderer.renderToString(app, {
//         title: 'JerrySSR',
//         meta: `
//         <meta name='description' context='描述'/>
//         `
//     },(err, html) => {
//         if (err) {
//             return res.status(500).end("Internal Server Error");
//         };

//         // 处理乱码
//         res.setHeader('Content-Type', 'text/html; charset=utf8')
//         res.end(html); 
//     });

// });

// app.listen(3000, () =>
//     console.log("app listening at http://localhost:3000")
// );


// 2=======》与服务器集成
// app.get("/", (req, res) => {
//     const app = new Vue({
//         template: `
//         <div id="app">
//             <h1> {{ message }} </h1>
//         </div>
//     `,
//         data: {
//             message: "我是哈哈哈",
//         },
//     });

//     renderer.renderToString(app, (err, html) => {
//         if (err) {
//             return res.status(500).end("Internal Server Error");
//         };

//         // 处理乱码
//         res.setHeader('Content-Type', 'text/html; charset=utf8')
//         res.end(`
//             <!DOCTYPE html> 
//             <html lang="en"> 
//                 <head> 
//                     <title>Hello</title> 
//                     <meta charset="UTF-8"> 
//                 </head> 
//                 <body>
//                     ${html}
//                 </body> 
//             </html>
//          `
//         ); // => <div data-server-rendered="true">Hello World</div> 
//     });

// });


// 1====> template
// const app = new Vue({
//     template: `
//         <div id="app">
//             <h1> {{ message }} </h1>
//         </div>
//     `,
//     data: {
//         message: "Hello World",
//     },
// });

// renderer.renderToString(app, (err, html) => {
//     if (err) {
//         err
//     };
//     console.log(html); // => <div data-server-rendered="true">Hello World</div> 
// });
