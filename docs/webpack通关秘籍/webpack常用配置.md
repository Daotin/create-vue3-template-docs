## entry

指定 webpack 的打包⼊⼝

单⼊⼝：entry 是⼀个字符串, 多⼊⼝：entry 是⼀个对象

```js
module.exports = {
  entry: './path/to/my/entry/file.js',
};

module.exports = {
  entry: {
    app: './src/app.js',
    adminApp: './src/adminApp.js',
  },
};
```

## output

告诉 webpack 如何将编译后的⽂件输出到磁盘。

```js
module.exports = {
	entry: './path/to/my/entry/file.js'
	output: {
		filename: 'bundle.js’,
		path: __dirname + '/dist'
	}
};

// 多出口配置
module.exports = {
	entry: {
		app: './src/app.js',
		search: './src/search.js'
	},
	output: {
		filename: '[name].js', // 通过占位符确保文件名称唯一
		path: __dirname + '/dist'
	}
};
```

## loaders

webpack 开箱即用只支持 JS 和 JSON 两种文件类型，通过 Loaders 去支持其它文件类型并且把它们转化成有效的模块，并且可以添加到依赖图中。

本身是一个函数，接受源文件作为参数，返回转换的结果。

语法：

```js
const path = require('path');
module.exports = {
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }, // 需要先npm i raw-loader -D
    ],
  },
};
```

## plugins

插件⽤于 bundle ⽂件的优化，资源管理和环境变量注⼊,作⽤于整个构建过程。

比如打包前，删除 dist 目录，自动生成 dist 下 html 文件等一些不属于 loader 做的事情。

用法：

```js
const path = require('path');
module.exports = {
  output: {
    filename: 'bundle.js',
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
```

### 常用 loader 和 plugin 配置

> ==注意：这些 loader 都需要先经过 npm i 安装！==

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      // 解析 ES6
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      // css-loader ⽤于加载 .css ⽂件，并且转换成 commonjs 对象导出
      // style-loader 将导出的样式通过 <style> 标签插⼊到 head 中
      // loader加载的顺序是右边先执行！
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // 解析less
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      // 解析图片，字体首选url-loader或者file-loader，url-loader比file-loader多了options配置，可以设置较⼩资源⾃动 base64
      {
        test: /\.(png|svg|jpg|gif)$/, // test: /\.woff|woff2|eot|ttf|otf)$/
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 10kB
            },
          },
        ],
      },
    ],
  },
};
```

> babel-loader 需要配置`.babelrc`：

```json
{
  "presets": [
    "@babel/preset-env" // 一个配置集合
  ],
  "plugins": [
    "@babel/proposal-class-properties" // 单独的配置
  ]
}
```

## 文件监听

两种方式：

- 启动 webpack 命令时，带上 --watch 参数
- 在配置 webpack.config.js 中设置 watch: true

缺点：页面需要手动刷新。

原理：**轮询判断⽂件的最后编辑时间是否变化。如果某个⽂件发⽣了变化，并不会⽴刻告诉监听者，⽽是先缓存起来，等 aggregateTimeout。**

```js
module.export = {
  //默认 false，也就是不开启
  watch: true,
  //只有开启监听模式时，watchOptions才有意义
  wathcOptions: {
    //默认为空，不监听的文件或者文件夹，支持正则匹配
    ignored: /node_modules/,
    //监听到变化发生后会等300ms再去执行，默认300ms
    aggregateTimeout: 300,
    //判断文件是否发生变化是通过不停询问系统指定文件有没有变化实现的，默认每秒问1000次
    poll: 1000,
  },
};
```

## 热更新

webpack-dev-server 优点：

- 不需要手动刷新页面
- 文件修改后的编译不输出文件到硬盘，而是到内存，速度更快

使用方式：使⽤ webpack 内置 HotModuleReplacementPlugin 插件，不需要额外安装。

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: 'development',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: './dist', // webpack-dev-server服务的目录
    hot: true, // 开启热更新
  },
};
```

另外，还有一个`webpack-dev-middleware`也可以热更新，当后端使用的是 Express 或另一个 Node.js 框架作为你的服务器，可以将 `webpack-dev-middleware` 集成到现有的 Node.js 服务器中，这样就不需要运行一个额外的服务器（如 `webpack-dev-server`）来处理前端的热更新。

但是，由于是前后端分离开发，专门让后端搞一个对后端来说没用的东西也不太合理，除非是前后端都是一个人开发。

所以，最好的选择还是 webpack-dev-server。

### 热更新原理

首先来看看一张图，如下：

![](images/img-20240513110552.png)

几个概念：

- `Webpack Compile`：将 JS 源代码编译成 bundle.js
- `HMR Server`：websocket 服务端，用来将热更新后的文件输出给 HMR Runtime
- `Bundle Server`：静态资源文件服务器，提供文件访问路径
- `HMR Runtime`：websocket 客户端，会被注入到浏览器，监听服务端更新文件的消息（在 HMR Runtime 和 HMR Server 之间建立 websocket，即图上 4 号线，用于实时更新文件变化）
- `bundle.js`：构建输出的文件（包含具体的源代码和 websocket 客户端）

上面图中，可以分成两个阶段：启动阶段和热更新阶段。

#### 启动阶段：1-2-A-B

主要过程包括以下几个步骤：

1. **Webpack 编译**：Webpack 开始编译项目源代码和 HMR Runtime，生成 bundle 文件。
2. **文件传输**：编译后的 bundle 文件传输到 Bundle Server，即静态资源服务器。
3. **服务启动**：Webpack-dev-server 启动并运行，包括一个提供静态资源的 Express 服务器和一个 WebSocket 服务器（HMR Server）。
4. **建立连接**：浏览器加载 bundle 文件，并通过 HMR Runtime 与 HMR Server 建立 WebSocket 连接。

这个过程确保了应用启动时，所有必要的资源都被加载并准备好，同时建立了必要的实时更新机制。

#### 热更新阶段：1-2-3-4

在热更新阶段的流程包括以下几个关键步骤：

1. **文件监听和编译**：Webpack 监听到文件的变化，对改动的文件重新编译，并生成新的 bundle 和和补丁文件，以及生成唯一的 hash 值，作为下一次热更新的标识。

记住两个 hash，一个是上一次的 hash 为 1240，一个为本次更新的 hash 为 2381。

补丁文件包括更新内容的（hot-update.js）和 manifest 文件（包含变化描述的 hot-update.json）。

![](images/img-20240513130540-1.png)

2. **通知客户端**：当文件变化的时候，HMR Server 通过 WebSocket 连接向浏览器的 HMR Runtime 发送通知，告知有模块更新。websocket 服务器会向浏览器推送一条消息（如下图），data 为最新改动的 hash 值。

![](images/img-20240513130549.png)

但是，这个最新的 hash 只是为了下一次更新使用的，而不是本次更新使用，本次更新使用的是上一次的 hash，也就是 hash 为 1240 的。

3. **请求文件**：此时，浏览器会创建一个 ajax 去想服务端请求说明变化内容的 manifest 文件，为了获得改动的模块名，在返回值的 c 字段可以拿到。（h 为最新的 hash 值，浏览器会默默保存，为了下次文件更新使用）

![](images/img-20240513130585.png)

4. 拿到了更新的模块名，结合之前的 hash，再发起 ajax 请求获取改动的文件内容，然后触发 render 流程，实现局部热加载。

![](images/img-20240513130503.png)

参考：

- https://juejin.cn/post/6844904134697549832
- https://vue3js.cn/interview/webpack/HMR.html

## 文件指纹

**什么是文件指纹？**

源代码在 webpack 打包后，生成的带有 hash 的文件名和后缀的就是文件指纹。

文件指纹可以由以下占位符组成：

```
占位符名称	含义
ext	资源后缀名
name	文件名称
path	文件的相对路径
folder	文件所在的文件夹
hash	每次webpack构建时生成一个唯一的hash值
chunkhash	根据chunk生成hash值，来源于同一个chunk，则hash值就一样
contenthash	根据内容生成hash值，文件内容相同hash值就相同
```

语法：

```js
filename: '[name]_[chunkhash:8].js';
```

**为什么要引入文件指纹？**

文件指纹（hashing）的引入主要是为了优化网络应用的缓存机制和提高资源加载效率。

在 Web 开发的早期阶段，当开发者更新网站上的 JavaScript、CSS 或其他静态资源时，用户的浏览器往往会因为缓存策略而继续使用旧版本的文件，导致网站显示不正常或功能异常。为了解决这个问题，引入文件指纹技术，通过在文件名中加入基于内容的唯一标识符（如哈希值），使得每次文件内容更新后文件名都会变化，从而强制浏览器加载新版本的文件，避免了缓存导致的问题。

**文件指纹分类**

1. **Hash**：针对整个构建过程生成的唯一标识。所有的输出文件都共享同一个`Hash`值。当任何一个文件修改，整个项目的 Hash 值将改变。适用于项目小或者不关注缓存优化时使用。
2. **Chunkhash**：根据不同的入口文件（Entry）生成的标识，每个入口文件（及其依赖的文件）构建出的结果有独立的`Chunkhash`。适用于那些文件引用不经常变化的项目，可以更好地利用缓存。
3. **Contenthash**：由文件内容产生的 Hash 值，仅当文件内容改变时`Contenthash`才会改变。这种方式特别适合用于 CSS 文件或其他在 Webpack 中单独抽离出的资源文件，确保内容实际改变时才重新请求文件。

> 注意： 如果你的 Webpack 配置只有一个 entry 点，且只生成一个 bundle 文件，那么使用`hash`和`chunkhash`生成的效果实际上是一样的。因为整个构建的输出仅有一个文件，所以无论使用哪种 hash 方法，该文件的 hash 值都会在内容变更后更新。
>
> 然而，一旦引入代码分割，生成多个 chunk（例如，通过动态导入或多个 entry 点），`hash`和`chunkhash`的行为就不再相同。
> `hash`会为所有文件生成相同的 hash 值，导致任何一个文件的更改都会使所有文件的 hash 值变化；而`chunkhash`为每个独立的 chunk 生成独立的 hash 值，仅当特定 chunk 的内容变化时，该 chunk 的 hash 值才会更新，这样更利于缓存管理和减少不必要的下载。

**各种文件指纹最佳实践**

一般使用 Chunkhash 和 Contenthash，Hash 的方式基本不使用。

在生产环境下，我们对打包的**js 文件**一般采用 `chunkhash`，对于**css，图片、字体**等静态文件，采用 `contenthash`，这样可以使得各个模块最小范围的改变打包 hash 值。

一方面，可以最大程度地利用浏览器缓存机制，提升用户的体验；另一方面，合理利用 hash 也减少了 webpack 再次打包所要处理的文件数量，提升了打包速度。

_提问：如果使用只有一个 entry 入口，并且采用 chunkhash+代码拆分，如果此时打包成 bundle1 和 bundle2 两个模块，如果 bundle1 对应的源代码有修改，bundle2 打包后的 chunkhash 会改变吗？_

在使用单个 entry 入口，并且通过代码拆分打包成`bundle1`和`bundle2`两个模块的情况下，如果`bundle1`的源代码有修改，通常`bundle2`打包后的`chunkhash`不会改变。`chunkhash`是基于 chunk 的内容生成的，所以只有当特定 chunk 的内容发生变化时，该 chunk 的 hash 值才会更新。如果`bundle2`的内容未发生改变，即使`bundle1`改变，`bundle2`的`chunkhash`也保持不变，这样有利于优化缓存和减少不必要的资源下载。

参考：

- https://www.cnblogs.com/skychx/p/webpack-hash-chunkhash-contenthash.html
- https://juejin.cn/post/6971987696029794312

## 代码压缩

### html 压缩

安装 html-webpack-plugin，设置压缩参数。

```js
plugins: [
  new HtmlWebpackPlugin({
    template: path.join(__dirname, 'src/index.html'), // 模板文件
    filename: 'index.html', // 输出文件的名称
    chunks: ['index'], // 指定要加入的entry中的chunk
    inject: true, // 将所有资产注入给定的template或templateContent - 当传递true或'body'时，所有javascript资源将放置在body元素的底部。'head'将放置在head元素中
    // 更多配置：https://github.com/terser/html-minifier-terser#options-quick-reference
    minify: {
      html5: true, // 根据HTML5规范解析输入
      collapseWhitespace: true, // 折叠空白字符
      preserveLineBreaks: false, // 保留换行符
      minifyCSS: true, // 压缩页面CSS
      minifyJS: true, // 压缩页面JS
      removeComments: false, // 移除注释
    },
  }),
];
```

### css 压缩

使⽤用 optimize-css-assets-webpack-plugin，同时使⽤用 cssnano

```js
'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
    }),
  ],
};
```

### js 压缩

内置了了 uglifyjs-webpack-plugin，并且自动压缩。

如果要自己配置，需要手动安装 uglifyjs-webpack-plugin 然后配置。
