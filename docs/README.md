# Hapi 中文文档

## 服务器 (Server)

服务器对象是主应用程序的容器。服务器管理所有传入的请求以及框架提供的所有设备【facilities】。每个服务器支持一个单独的连接（例如 监听到 80 端口）。

### <a name="server()" /> `server([options])`

创建一个新的 server 对象：

Creates a new server object where:
- `options` - (可选) 一个 [server 可配置对象](#server.options).

```js
const Hapi = require('hapi');

const server = Hapi.server({ load: { sampleInterval: 1000 } });
```

### <a name="server.options" /> Server options

options 控制服务器对象的行为。注意 options 对象是深拷贝的（除了 [`listener`](#server.options.listener) 属性是浅拷贝）并且不能包含任何不安全的值来执行【perform】深拷贝

所有的选项都是可选的。

#### <a name="server.options.address" /> `server.options.address`

默认值：`'0.0.0.0'` （所有可用的网络接口）

设置服务器所要监听的主机名或者 IP 地址。如果没有配置，默认会为已提供的 [`host`](#server.options.host) 选项，否则为所有可用的网络接口。设置 `'127.0.0.1'` 或 `'localhost'` 限制服务器仅来自同一主机。

#### <a name="server.options.app" /> `server.options.app`

默认值: `{}`.

提供特定于【specific】应用程序的配置，以后可以通过【via】它进行访问 [`server.settings.app`](#server.settings)。框架不与此对象交互【interact】。它只是提供一个随处可用的 `server` 的引用。

注意与 `server.settings.app` 的区别，它用于存储静态的配置值。[`server.app`](#server.app) 用于存储运行时的状态。

#### <a name="server.options.autolisten" /> `server.options.autoListen`

默认值: `true`.

用于禁用 [`listener`](#server.options.listener) 的自动初始化。值为 `false` 时，表示【indicates】框架外将手动开启 [`listener`](#server.options.listener)

不能与 [`port`](#server.options.port) 一起设置为 `false`

#### <a name="server.options.cache" /> `server.options.cache`

默认值: `{ provider: { constructor: require('catbox-memory'), options: { partition: 'hapi-cache' } } }`.

设置服务端缓存的提供者程序。每个服务器包含一个默认用于存储应用程序状态的缓存。默认情况下，创建了一个简单的基于内存的缓存，其容量和功能有限。

**hapi** 使用 [**catbox**](https://github.com/hapijs/catbox) 为其缓存实现【implementation】，包括对常见存储解决方案的支持（例如 Redis, MongoDB, Memcached, Riak 等等）。仅当 [methods](#server.methods) 和 [plugins](#plugins) 明确存储状态在缓存中时才使用缓存。

服务器缓存配置仅定义存储容器本身。配置可以指定一个或多个（数组）：

- 一个类或者原型方法（通常通过在 **catbox** 策略上调用 `require()` 来获得，例如 `require('catbox-redis')`）。一个新的  **catbox** [client](https://github.com/hapijs/catbox#client) 将使用此函数在内部【internally】创建。

- 配置对象具有以下内容：

    - `engine` - 一个类, 原型方法, 或 **catbox** 对象.
    
    - `name` - 稍后为 [server methods](#server.methods) 或 [plugins](#plugins) 提供或配置缓存时使用的标识符。每个缓存名称必须是惟一的。单一项可以省略定义默认缓存的 `name` 选项。如果每个缓存都包含 `name`，还会配置默认的内存缓存。

    - `provider` - a class, a constructor function, or an object with the following:

        - `constructor` - a class or a prototype function.

        - `options` - (optional) a settings object passed as-is to the `constructor` with the following:

            - `partition` - (optional) string used to isolate cached data. Defaults to `'hapi-cache'`.
            - other constructor-specific options passed to the `constructor` on instantiation.

    - `shared` - 如果为 `true`, 允许多个缓存用户共享同一个片段【segment】 (例如多个方法使用相同的缓存存储容器). 默认为 `false`.

    - One (and only one) of `engine` or `provider` is required per configuration object.

#### <a name="server.options.compression" /> `server.options.compression`

默认值: `{ minBytes: 1024 }`.

定义服务端控制的内容编码请求。如果 `false`，相应内容编码被禁用，并且服务器不执行【perform】压缩

##### <a name="server.options.compression.minBytes" /> `server.options.compression.minBytes`

默认值: '1024'.

设置最小响应有效负荷大小（以字节为单位），它是内容编码压缩所必须的。
如果有效负载大小低于限制，则不执行压缩。

#### <a name="server.options.debug" /> `server.options.debug`

默认值: `{ request: ['implementation'] }`.

确定【Determines】将哪些日志事件发送到控制台。仅用于开发模式并且不影响【affect】记录实际内部和收录的事件。设置 `false` 去关闭所有输出日志，或者传入一个对象：

- `log` - 当通过 [`server.log()`](#server.log()) 记录事件时，通过 `console.error()` 显示的服务器日志标记的字符串数组以及
        内部生成 [server logs](#server-logs)。 默认为无输出。

- `request` - 当通过 [`server.log()`](#server.log()) 记录事件时，通过 `console.error()` 显示的请求日志标记的字符串数组以及
        内部生成 [server logs](#server-logs)。 例如，想要展示所有错误，可以设置选项为 `['error']`。设置 false 关闭所有输出 debug 信息。设置 `'*'` 显示所有请求日志。
        默认为外部代码中抛出的未捕获错误（这些错误会自动处理并导致内部服务器错误响应）或由于开发人员导致的运行时错误

举个例子, 为了展示所有错误, 设置 `log` or `request` 为 `['error']`. 关闭所有输出，设置 `log` or `request` 为 `false`. 展示所有服务器日志, 设置 `log` or
`request` 为 `'*'`. 关闭所有服务器日志, 设置 `debug` 为 `false`.

#### <a name="server.options.host" /> `server.options.host`

默认值: 操作系统的主机名，如果不可用默认为 `'localhost'`。

公共主机名或 IP 。 用于设置 [`server.info.host`](#server.info) ，
[`server.info.uri`](#server.info) 和 [`address`](#server.options.address) 没有指定.

#### <a name="server.options.listener" /> `server.options.listener`

默认值: none.

可选的 node HTTP (或 HTTPS) [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server)
对象 (或具有兼容【compatible】接口的对象).

如果 `listener` 需要手动启动，设置 [`autoListen`](#server.options.autolisten) 为 `false`。

如果 `listener` 使用 TLS， 设置 [`tls`](#server.options.tls) 为 `true`。

#### <a name="server.options.load" /> `server.options.load`

默认值: `{ sampleInterval: 0, concurrent: 0 }`.

服务器过载【excessive】处理的限制，其中：

- `sampleInterval` - 采样频率，以毫秒为单位。 设置为 `0` 时，将忽略其他加载选项。 默认为 `0` (没有抽样).

- `maxHeapUsedBytes` - 使用 HTTP  Server Timeout (503) 响应拒绝传入请求的最大 V8 堆大小。 默认为 `0` (no limit).

- `maxRssBytes` - 使用 HTTP  Server Timeout (503) 响应拒绝传入请求的最大进程 RSS 大小。 默认为 `0` (no limit).

- `maxEventLoopDelay` - 使用 HTTP Server Timeout (503) 响应拒绝传入请求的最大事件循环延迟持续时间（以毫秒为单位）。 默认为 `0` (no limit).

- `concurrent` - 并行执行的最大请求数。这对于在实际处理程序计算负载较低的高负载部署中减少垃圾收集成本很有用。
  例如，主要等待上游数据的处理程序将允许许多传入请求一直排队到处理程序生命周期阶段。 
  这将触发重垃圾收集负载，试图整理许多待处理对象。
  减少正在处理的并发请求数可能会有所帮助。 这里没有建议的值 - 您需要测试哪种方法最适合您的特定部署。 默认为 `0` (no queue).

#### <a name="server.options.mime" /> `server.options.mime`

默认值: none.

生成服务器使用的 mime 数据库时传递给 [**mimos**](https://github.com/hapijs/mimos) 模块的选项 (并通过 [`server.mime`](#server.mime) 访问)：

- 一个对象哈希，被合并到指定 [here](https://github.com/jshttp/mime-db) 的内置 mime 信息中

- `override` - 一个对象哈希，被合并到指定 [here](https://github.com/jshttp/mime-db) 的内置 mime 信息中。 每个键值对代表一个单独的 mime 对象。
  每个覆盖值必须包含:

    - `key` - 小写的 mime-type 字符串 (例如 `'application/javascript'`).

    - `value` - 符合规范【specifications】的对象 [here](https://github.com/jshttp/mime-db#data-structure)。
      其他值包含:

        - `type` - 指定 `type` 的结果， 默认为 `key`。

        - `predicate` - 带签名的方法 `function(mime)` 当 mime 的类型在数据库中, 此函数执行以允许自定义

```js
const options = {
    mime: {
        override: {
            'node/module': {
                source: 'iana',
                compressible: true,
                extensions: ['node', 'module', 'npm'],
                type: 'node/module'
            },
            'application/javascript': {
                source: 'iana',
                charset: 'UTF-8',
                compressible: true,
                extensions: ['js', 'javascript'],
                type: 'text/javascript'
            },
            'text/html': {
                predicate: function(mime) {
                    if (someCondition) {
                        mime.foo = 'test';
                    }
                    else {
                        mime.foo = 'bar';
                    }
                    return mime;
                }
            }
        }
    }
};
```

#### <a name="server.options.operations" /> `server.options.operations`

默认值: `{ cleanStop: true }`.

定义服务器操作的服务器处理：

- `cleanStop` - 如果为 `true`, 服务器跟踪打开的连接，并在服务器停止时正确关闭它们。 在正常负载下，这不应该干扰服务器性能。
  但是，在严重的负载连接监控下，可能会消耗额外的资源并加剧这种情况。 如果服务器永远不会停止， 或者如果它被迫停止而不等待打开连接关闭， 将此设置为 `false` 可以节省未使用的资源。 默认为 `true`.

#### <a name="server.options.plugins" /> `server.options.plugins`

默认值: `{}`.

特定于插件的配置，以后可以通过 [`server.settings.plugins`](#server.settings) 访问。`plugins` 是一个对象，其中每个键是插件名称，值是配置。注意它与 [`server.settings.plugins`](#server.settings) 和 [`server.plugins`](#server.plugins) 的不同，前者用于存储静态配置值，后者用于存储运行时的状态。

#### <a name="server.options.port" /> `server.options.port`

默认值: `0` (一个无常【ephemeral】的端口).

服务器要监听的 TCP 端口. 默认为服务器启动后的下一个可用端口。(并分配给 [`server.info.port`](#server.info)).

如果 `port` 是一个包含 '/' 的字符串，它用作 UNIX 域的 socket 路径。
如果以 '\\.\pipe' 开头，它用作 Windows 命名管道。

#### <a name="server.options.query" /> `server.options.query`

默认值: `{}`.

定义服务器处理请求路径查询参数组件。

##### <a name="server.options.query.parser" /> `server.options.query.parser`

默认值: none.

使用签名` `function(searchParams)` 设置查询参数解析器方法，其中：

- `query` - 包含传入的 [`request.query`](#request.query) 参数的对象。
- 该方法必须返回一个对象，其中每个键是一个参数，匹配值是参数值。 如果抛出该方法，则在调用  [`request.setUrl()`](#request.setUrl()) 时将错误用作响应或返回。

```js
const Qs = require('qs');

const options = {
    query: {
        parser: (query) => Qs.parse(query)
    }
};
```

#### <a name="server.options.router" /> `server.options.router`

默认值: `{ isCaseSensitive: true, stripTrailingSlash: false }`.

控制传入请求URI与路由表的匹配方式：

- `isCaseSensitive` - 确定【determines】路径 '/example' 和 '/EXAMPLE' 是否被视为不同的资源。默认为 `true`.

- `stripTrailingSlash` - 删除传入路径上的尾部斜杠。默认为 `false`.

#### <a name="server.options.routes" /> `server.options.routes`

默认值: none.

一个 [route options](#route-options) 对象用于每个路由的默认配置。

#### <a name="server.options.state" /> `server.options.state`

默认值:
```js
{
    strictHeader: true,
    ignoreErrors: false,
    isSecure: true,
    isHttpOnly: true,
    isSameSite: 'Strict',
    encoding: 'none'
}
```

为每个状态（cookie）显式【explicitly】设置默认配置通过 `server.state()`](#server.state()) 或者 隐式(没有定义)使用 [state configuration](#server.state()) 对象

#### <a name="server.options.tls" /> `server.options.tls`

默认值: none.

用于创建 HTTPS 连接. `tls` 对象不变传递到 node HTTPS 服务器，如下所示 [node HTTPS documentation](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)。

当传入一个已配置 [`listener`](#server.options.listener) 对象为 `true` 时，直接使用 TLS

#### <a name="server.options.uri" /> `server.options.uri`

默认值: 由运行时的服务器信息构建

没有路径的完整公共 URI (例如 'http://example.com:8080'). 如果存在, 用作服务器的 [`server.info.uri`](#server.info), 否则由服务器设置构造.

### 服务器属性 (Server properties)

#### <a name="server.app" /> `server.app`

访问: 读 / 写.

提供了一个安全的地方来存储特定于服务器的运行时应用程序数据，而不与框架内部潜在【potential】冲突。数据可以在任何服务器可用状态下被访问。初始化为空对象。

```js
const server = Hapi.server();

server.app.key = 'value';

const handler = function (request, h) {

    return request.server.app.key;        // 'value'
};
```

#### <a name="server.auth.api" /> `server.auth.api`

访问: 指定的认证策略【strategy】。

一个对象，其中每个键都是一个身份验证策略名称，值是公开【exposed】的策略 API。仅当身份验证方案【scheme】通过实现函数返回对象中的 `api` 键来公开 API 时才可用。

```js
const server = Hapi.server({ port: 80 });

const scheme = function (server, options) {

    return {
        api: {
            settings: {
                x: 5
            }
        },
        authenticate: function (request, h) {

            const authorization = request.headers.authorization;
            if (!authorization) {
                throw Boom.unauthorized(null, 'Custom');
            }

            return h.authenticated({ credentials: { user: 'john' } });
        }
    };
};

server.auth.scheme('custom', scheme);
server.auth.strategy('default', 'custom');

console.log(server.auth.api.default.settings.x);    // 5
```

#### <a name="server.auth.settings.default" /> `server.auth.settings.default`

访问: 只读。

包含默认的身份认证配置，如果是默认的策略设置请通过 [`server.auth.default()`](#server.auth.default())

#### <a name="server.decorations" /> `server.decorations`

访问: 只读。

提供对已应用于各种框架接口修饰符的访问。对象不能直接被修改，但只能通过 [`server.decorate`](#server.decorate())。

包含：

- `request` - 装饰 [request object](#request).
- `toolkit` - 装饰 [response toolkit](#response-toolkit).
- `server` -装饰 [server](#server) 对象.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const success = function () {

    return this.response({ status: 'ok' });
};

server.decorate('toolkit', 'success', success);
console.log(server.decorations.toolkit);            // ['success']
```

#### <a name="server.events" /> `server.events`

访问: **podium** 公共接口.

服务器的事件触发器. 利用【Utilizes】 [**podium**](https://github.com/hapijs/podium) 支持的事件标准验证, 频道和过滤器。

使用下面方法与 `server.events` 进行交互：

- [`server.event(events)`](#server.event()) - 注册应用事件.
- [`server.events.emit(criteria, data)`](#server.events.emit()) - 触发服务器事件.
- [`server.events.on(criteria, listener)`](#server.events.on()) - 订阅服务器事件.
- [`server.events.once(criteria, listener)`](#server.events.once()) - 订阅

其他方法包含: `server.events.removeListener(name, listener)`,
`server.events.removeAllListeners(name)`, 和 `server.events.hasListeners(name)`。

##### <a name="server.events.log" /> `'log'` Event

`'log'` 事件类型触发由框架生成的内部服务器事件，以及使用 [`server.log()`](#server.log()) 记录的应用程序事件

`'log'` 事件处理程序使用函数签名 `function(event, tags)`，其中：

- `event` - 具有以下属性的对象：
    - `timestamp` - 事件时间戳.
    - `tags` - 标识事件的标签数组 (例如 `['error', 'http']`).
    - `channel` - 为内部生成的事件设置为 `'internal'`， 否则由 [`server.log()`](#server.log()) 生成 `'app'`。
    - `data` - 特定事件的信息。 当指定事件数据并且不是错误时可用。错误通过 `error` 传递。
    - `error` - 与事件相关的错误对象（如果适用）。不能与 `data` 同时出现。

- `tags` - 一个对象，其中每个 `event.tag` 是一个键，值为 `true`。有助于快速识别【identification】事件

```js
server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```

内部生成的事件是 (由它们 `tags` 识别):

- `load` - 由于 [high load](#server.options.load) 服务器拒绝请求时记录当前服务器负载测量值。事件数据包含流程负载指标【metrics】。

- `connection` `client` `error` -  从 HTTP 或 HTTPS 监听器收到的 `clientError` 事件。事件数据是收到的错误对象。

##### <a name="server.events.request" /> `'request'` Event

 `'request'` 事件类型触发由框架生成的内部请求事件以及使用[`request.log()`](#request.log())记录的应用程序事件。

`'request'` 事件处理程序使用函数签名 `function(request, event, tags)` 其中：

- `request` - [request object](#request).

- `event` - 具有以下属性的对象：
    - `timestamp` - 事件时间戳。
    - `tags` - 标识事件的标签数组 (例如 `['error', 'http']`).
    - `channel` - 其中之一：
        - `'app'` - [`server.log()`](#server.log()) 生成的事件.
        - `'error'` - 每当请求的响应 `500` 时触发。
        - `'internal'` - internally generated events.
    - `request` - request [identifier](#request.info.id).
    - `data` - 特定事件的信息。提供事件数据时可用且不是错误。 错误通过 `error` 传递。
    - `error` - 与事件相关的错误对象（如果适用）。 不能与 `data` 一起出现。

- `tags` - 一个对象，其中每个  `event.tag` 是一个键，值为 `true` 。 有助于快速识别事件。

```js
server.events.on('request', (request, event, tags) => {

    if (tags.error) {
        console.log(`Request ${event.request} error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```

仅监听一个频道, 使用事件的条件对象：

```js
server.events.on({ name: 'request', channels: 'error' }, (request, event, tags) => {

    console.log(`Request ${event.request} failed`);
});
```

内部生成的事件 (由 `tags` 标识):

- `accept-encoding` `error` - 收到的请求包含无效的 invalid Accept-Encoding header.
- `auth` `unauthenticated` - 没有 authentication scheme 包含在请求中.
- `auth` `unauthenticated` `response` `{strategy}` - 列出的身份验证策略返回了非错误响应 (例如 重定向到).
- `auth` `unauthenticated` `error` `{strategy}` - 请求未能通过列出的身份验证策略（无效凭据）。
- `auth` `unauthenticated` `missing` `{strategy}` - 请求未能通过列出的身份验证策略（未找到凭据）。
- `auth` `unauthenticated` `try` `{strategy}` - 请求未能在 `try` 模式下通过列出的身份验证策略，并将继续。
- `auth` `scope` `error` - 请求已通过身份验证但未能满足范围要求。
- `auth` `entity` `user` `error` - 请求经过身份验证但在需要用户实体时包含应用程序实体。
- `auth` `entity` `app` `error` - 请求经过身份验证但在需要应用程序实体时包含用户实体。
- `handler` `error` - 路由处理程序返回错误。 包括执行持续时间和错误消息。
- `pre` `error` - 执行 pre 方法并返回错误。 包括执行持续时间，分配键和错误。
- `internal` `error` - 为请求分配了 HTTP 500 错误响应。
- `internal` `implementation` `error` - 错误实现的 [lifecycle method](#lifecycle-methods).
- `request` `abort` `error` - 请求中止。
- `request` `closed` `error` - 请求提前结束。
- `request` `error` - 请求流发出错误。 包括错误。
- `request` `server` `timeout` `error` - 请求花了太长时间才能由服务器处理。 包括超时配置值和持续时间。
- `state` `error` - 该请求包含无效的 cookie。 包括 cookie 和错误详细信息。
- `state` `response` `error` - 响应包括无效的 cookie，阻止生成有效的 header。 包括错误。
- `payload` `error` - 处理请求有效负载失败。 包括错误。
- `response` `error` - 无法将响应写入客户端。 包含错误。
- `response` `error` `close` - 由于过早关闭连接而无法将响应写入客户端。
- `response` `error` `aborted` - 由于过早中止连接而无法将响应写入客户端。
- `response` `error` `cleanup` - 无法释放响应资源。
- `validation` `error` `{input}` - 输入 (例如 payload, query, params, headers) 验证失败。
  包含错误。
- `validation` `response` `error` - 响应认证失败. 包含错误信息。

##### <a name="server.events.response" /> `'response'` Event

当响应被发送回客户端，`'response'` 事件类型将被触发（或当客户端连接关闭并且没有响应发送，在这种情况下 [`request.response`](#request.response) 为 `null`)。
每个请求发出一个事件。`'response'` 事件控制使用的函数签名 `function(request)` 如下：

- `request` - the [request object](#request).

```js
server.events.on('response', (request) => {

    console.log(`Response sent for request: ${request.info.id}`);
});
```

##### <a name="server.events.route" /> `'route'` Event

当通过 [`server.route()`](#server.route()) 添加路由时，会发出 `'route'` 事件类型。
`'route'` 事件处理程序使用函数签名 `function(route)` ，其中：
- `route` - [route information](#request.route). 不得修改 `route` 对象

```js
server.events.on('route', (route) => {

    console.log(`New route added: ${route.path}`);
});
```

##### <a name="server.events.start" /> `'start'` Event

使用 [`server.start()`](#server.start()) 启动服务器时会发出 `'start'` 事件类型。
`'start'` 事件处理程序使用函数签名`function（）`。

```js
server.events.on('start', () => {

    console.log('Server started');
});
```

##### <a name="server.events.stop" /> `'stop'` Event

使用 [`server.stop()`](#server.stop()) 停止服务器时会发出 `'stop'` 事件类型。
`'stop'` 事件处理程序使用函数签名`function（）`。

```js
server.events.on('stop', () => {

    console.log('Server stopped');
});
```

#### <a name="server.info" /> `server.info`

访问： 只读。

一个包含如下服务器信息的对象：

- `id` - 唯一的服务器标识符 (使用格式 '{hostname}:{pid}:{now base36}').

- `created` - 服务器创建时间戳。

- `started` - 服务器启动时间戳（停止时为 `0`）。

- `port` - 连接端口基于以下规则：

    - 在服务器启动之前：配置的 [`port`](#server.options.port) 值。
    - 服务器启动后：未配置端口或设置为  `0` 时分配的实际端口。

- `host` - [`host`](#server.options.host) 配置的值

- `address` - 启动后连接绑定的活动IP地址。 在服务器启动或使用非 TCP 端口之前设置为 `undefined`  (例如 UNIX domain socket).

- `protocol` - 使用的协议：

    - `'http'` - HTTP.
    - `'https'` - HTTPS.
    - `'socket'` - UNIX domain socket or Windows named pipe.

- `uri` - 表示连接的字符串 (例如 'http://example.com:8080' 或
  'socket:/unix/domain/socket/path'). 如果设置，则包含 [`uri`](#server.options.uri) 值，
  否则根据可用设置构建。 如果 [`port`](#server.options.port) 没有配置或设置为 `0`, 在服务器启动之前，`uri` 将不包含端口组件。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

console.log(server.info.port);            // 80
```

#### <a name="server.listener" /> `server.listener`

访问： 只读和监听公共接口。

node HTTP 服务器对象。

```js
const Hapi = require('hapi');
const SocketIO = require('socket.io');

const server = Hapi.server({ port: 80 });

const io = SocketIO.listen(server.listener);
io.sockets.on('connection', (socket) => {

    socket.emit({ msg: 'welcome' });
});
```

#### <a name="server.load" /> `server.load`

访问： 只读。

包含流程负载指标的对象 (当 [`load.sampleInterval`](#server.options.load) 已启用):

- `eventLoopDelay` - 时间循环延迟毫秒.
- `heapUsed` - V8 堆使用情况.
- `rss` - RSS 内存使用情况.

```js
const Hapi = require('hapi');
const server = Hapi.server({ load: { sampleInterval: 1000 } });

console.log(server.load.rss);
```

#### <a name="server.methods" /> `server.methods`

访问： 只读。

服务器方法是在服务器中注册的功能，在整个应用程序中用作通用实用程序。 它们的优势在于能够将它们配置为使用内置缓存并在多个请求处理程序之间共享，而无需创建公共模块。

`sever.methods` 是一个对象，它提供对通过 [server.method()](#server.method()) 注册的方法的访问，其中每个服务器方法名称都是一个对象属性。

```js
const Hapi = require('hapi');
const server = Hapi.server();

server.method('add', (a, b) => (a + b));
const result = server.methods.add(1, 2);    // 3
```

#### <a name="server.mime" /> `server.mime`

访问： 只读且 **mimos** 公共接口。

提供对用于设置内容类型信息的服务器 MIME 数据库的访问。不能直接修改对象，只能通过 [`mime`](#server.options.mime)  服务器设置修改。

```js
const Hapi = require('hapi');

const options = {
    mime: {
        override: {
            'node/module': {
                source: 'steve',
                compressible: false,
                extensions: ['node', 'module', 'npm'],
                type: 'node/module'
            }
        }
    }
};

const server = Hapi.server(options);
console.log(server.mime.path('code.js').type)        // 'application/javascript'
console.log(server.mime.path('file.npm').type)        // 'node/module'
```

#### <a name="server.plugins" /> `server.plugins`

访问： 读 / 写.

包含每个注册插件公开的值的对象，其中每个键是一个插件名称，值是每个插件使用 [`server.expose()`](#server.expose()) 公开的属性. 插件可以直接或通过 `server.expose()` 方法设置 `server.plugins[name]` 对象的值

```js
exports.plugin = {
    name: 'example',
    register: function (server, options) {

        server.expose('key', 'value');
        server.plugins.example.other = 'other';

        console.log(server.plugins.example.key);      // 'value'
        console.log(server.plugins.example.other);    // 'other'
    }
};
```

#### <a name="server.realm" /> `server.realm`

访问： 只读。

realm 对象包含特定于每个插件或身份验证策略的沙盒服务器设置。
在注册插件或认证方案时，`server` 对象引用提供了一个特定于该注册的新 `server.realm` 容器。
它允许每个插件保持自己的设置，而不会泄漏并影响其他插件。

例如，插件可以为本地资源设置默认文件路径，而不会破坏其他插件的已配置路径。
当调用 [`server.bind()`](#server.bind()) 时，会设置的现有 reaml 的 `settings.bind` 属性，然后由在同一级别添加的路由和扩展使用（服务器根目录或插件）。

`server.realm` 对象包含：

- `modifiers` - 当服务器对象作为插件 `register()` 方法的参数提供时， `modifiers` 提供了通过 [`server.register()`](#server.register()) 方法传递的注册首选项，包括：

    - `route` - 路由偏好：

        - `prefix` - 从服务器调用  [`server.route()`](#server.route()) 时使用的路径路径前缀。 请注意，如果使用前缀并且路径路径设置为 `'/'`，则生成的路径将不包括尾部斜杠。
        - `vhost` - 从服务器调用 [`server.route()`](#server.route()) 时使用的路由虚拟主机设置。

- `parent` - 父服务器对象的 reaml，或根服务器的  `null` 。

- `plugin` - 活动插件名称（如果在服务器根目录，则为空字符串）。

- `pluginOptions` - 注册时传递的插件选项。

- `plugins` - 特定于插件的状态，仅在共享相同活动状态的活动之间共享。 `plugins` 是一个对象，其中每个键都是一个插件名称，值是插件状态。

- `settings` - 设置覆盖：

    - `files.relativeTo`
    - `bind`

`server.realm` 对象应该被认为是只读的，不能直接更改，除了 `plugins` 属性，可以由每个插件直接操作，在 `plugins[name]` 中设置它的属性。

```js
exports.register = function (server, options) {

    console.log(server.realm.modifiers.route.prefix);
};
```

#### <a name="server.registrations" /> `server.registrations`

访问： 只读。

当前注册的插件的对象，其中每个 key 对应注册的插件名称，值是包含的对象：

- `version` - 插件版本.
- `name` - 插件名称.
- `options` - (可选) 注册期间传递给插件的选项。

#### <a name="server.settings" /> `server.settings`

访问： 只读。

应用默认值后的服务器配置对象。

```js
const Hapi = require('hapi');
const server = Hapi.server({
    app: {
        key: 'value'
    }
});

console.log(server.settings.app);   // { key: 'value' }
```

#### <a name="server.states" /> `server.states`

访问： 只读和 **statehood** 公共接口.

服务器 cookies 管理器.

#### <a name="server.states.settings" /> `server.states.settings`

访问： 只读。

服务器 cookies 管理器设置. 设置基于 [`server.options.state`](#server.options.state) 中配置的值.

#### <a name="server.states.cookies" /> `server.states.cookies`

访问： 只读。

包含通过 [`server.state()`](#server.state()) 添加的每个cookie的配置的对象，其中每个 key 是 cookie 名称，值是配置对象。

#### <a name="server.states.names" /> `server.states.names`

访问： 只读。

包含所有已配置【configured】 cookie 的名称的数组。

#### <a name="server.type" /> `server.type`

访问： 只读。

一个字符串，标明【indicating】监听类型，其中：
- `'socket'` - UNIX domain socket or Windows named pipe.
- `'tcp'` - an HTTP listener.

#### <a name="server.version" /> `server.version`

访问： 只读。

**hapi** 版本号

```js
const Hapi = require('hapi');
const server = Hapi.server();

console.log(server.version);        // '17.0.0'
```

### <a name="server.auth.default()" /> `server.auth.default(options)`

设置应用于每个路由的默认认证策略【strategy】，其中：

- `options` - 其中之一:

    - 具有默认策略名称的字符串
    - 使用与 [route `auth` handler options](#route.options.auth) 相同格式的身份验证配置对象.

返回值: none.

当路由配置指定 `auth` 为 `false` 时，默认值不适用，或已配置身份验证策略 (包含 [`strategy`](#route.options.auth.strategy) 或 [`strategies`](#route.options.auth.strategies) 身份认证设置。否则，路由验证配置将应用于默认值。

请注意，如果路由配置了身份验证，则默认仅在添加路由时应用，而不是在运行时应用。
这意味着在添加具有一些身份验证配置的路由后调用 `server.auth.default()` 将不会影响之前添加的路由。
但是，如果这些路由缺少任何身份验证配置，则默认将应用于在调用 `server.auth.default()` 之前添加的路由。

可以通过 [`server.auth.settings.default`](#server.auth.settings.default) 访问默认的 auth 策略配置。
要获【obtain】取路由的主动身份验证配置，请使用 `server.auth.lookup(request.route)`.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.auth.scheme('custom', scheme);
server.auth.strategy('default', 'custom');
server.auth.default('default');

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return request.auth.credentials.user;
    }
});
```

### <a name="server.auth.scheme()" /> `server.auth.scheme(name, scheme)`

注册身份验证方案:

- `name` - 方案名称。
- `scheme` - 用签名 `function(server, options)` 实现该方案 其中:
    - `server` - 一个参考方案被添加到服务器对象。
    - `options` - (可选的) 当实例一个策略时， 传给 [`server.auth.strategy()`](#server.auth.strategy()) 的 `options` 参数.

返回值: none.

当调用时，`scheme` 函数必须返回一个 [authentication scheme object](#authentication-scheme)

#### 身份验证方案

身份验证方案是具有以下属性的对象：

- `api` - (可选) 通过 [`server.auth.api`](#server.auth.api) 公开的对象.

- `async authenticate(request, h)` - (必要) 为使用身份验证方案配置的每个传入请求调用 [lifecycle method](#lifecycle-methods) 函数。 方法提供了两个特殊的工具包方法，用于返回经过身份验证或未经身份验证的方法结果:
    - [`h.authenticated()`](#h.authenticated()) - 表示【indicate】请求已成功验证。
    - [`h.unauthenticated()`](#h.unauthenticated()) - 表示请求验证失败.

- `async payload(request, h)` - (可选) 用于验证请求有效负载的 [lifecycle method](#lifecycle-methods)。

- `async response(request, h)` - (可选) 一个 [lifecycle method](#lifecycle-methods) 用于写入响应头或有效负荷之前描述带有身份认证头的响应。

- `async verify(auth)` - (可选) 用于验证提供的身份验证凭据的方法仍然有效 (例如初始身份验证后未过期或撤消) 其中:
  - `auth` - [`request.auth`](#request.auth) 对象包含 `credentials` 和
    `artifacts` 对象，由 scheme's `authenticate()` 方法返回。
  - 当传递的凭据不再有效时，该方法抛出  `Error` (例如 过期或
  撤销). 请注意，该方法无法访问原始请求，只能访问 `authenticate()`  方法生成的凭证和 artifacts。

- `options` - (可选) 具有以下键的对象：
    - `payload` - 如果是 `true`，则需要将有效负载验证作为方案的一部分，并禁止路由禁用有效负载验证。 默认为 `false`。

当方案`authenticate（）`方法实现抛出错误或调用 [`h.unauthenticated()`](#h.unauthenticated()) 时，
错误的细节会影响是否尝试其他身份验证策略（如果为路由配置）。如果错误包含消息，则不会尝试其他策略。
如果 `err` 不包含消息但包含方案名称(例如 `Boom.unauthorized(null, 'Custom')`)，将按优先顺序尝试其他策略（在路由配置中定义）。
如果身份验证失败，方案名称将出现在 'WWW-Authenticate' header 中。

当 `payload（）` 方法抛出错误消息时，这意味着有 payload 验证因负载不良而失败。如果错误没有消息但包含 scheme 名称(例如
`Boom.unauthorized(null, 'Custom')`)，如果路由 [`auth.payload`](#route.options.auth.payload) 配置设置为  `'optional'`，则认证可能仍然成功。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const scheme = function (server, options) {

    return {
        authenticate: function (request, h) {

            const req = request.raw.req;
            const authorization = req.headers.authorization;
            if (!authorization) {
                throw Boom.unauthorized(null, 'Custom');
            }

            return h.authenticated({ credentials: { user: 'john' } });
        }
    };
};

server.auth.scheme('custom', scheme);
```

### <a name="server.auth.strategy()" /> `server.auth.strategy(name, scheme, [options])`

注册身份验证策略:

- `name` - 策略名称。
- `scheme` - 方案名称 (必须事先使用 [`server.auth.scheme()`](#server.auth.scheme())) 注册。
- `options` - 基于方案要求的方案选项。

返回值: none.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.auth.scheme('custom', scheme);
server.auth.strategy('default', 'custom');

server.route({
    method: 'GET',
    path: '/',
    config: {
        auth: 'default',
        handler: function (request, h) {

            return request.auth.credentials.user;
        }
    }
});
```

### <a name="server.auth.test()" /> `await server.auth.test(strategy, request)`

针对身份验证策略测试请求：

- `strategy` - 使用 [`server.auth.strategy()`](#server.auth.strategy()) 注册的策略名称.
- `request` - [request object](#request).

返回值: 如果身份验证成功，则包含身份验证 `credentials` 和 `artifacts` 的对象，否则会抛出错误。

请注意，`test()` 方法不考虑【take into account】路由验证配置。它也不执行【perform】有效负载认证。它仅限于【limited to】基本策略身份验证执行【execution】。它不包括验证范围，入口或其他路由属性。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.auth.scheme('custom', scheme);
server.auth.strategy('default', 'custom');

server.route({
    method: 'GET',
    path: '/',
    handler: async function (request, h) {

        try {
            const { credentials, artifacts } = await request.server.auth.test('default', request);
            return { status: true, user: credentials.name };
        }
        catch (err) {
            return { status: false };
        }
    }
});
```


### <a name="server.auth.verify()" /> `await server.auth.verify(request)`

根据身份验证策略验证请求的身份验证凭据，其中：

- `request` - [request object](#request).

返回值: 如果验证成功则无效，否则会抛出错误。

请注意，`verify()` 方法不考虑路由认证配置或来自请求的任何其他信息，而不是 `request.auth` 对象。它也不执行 payload 认证。它仅限于验证先前有效的凭据是否仍然有效（例如未被撤销或过期）.
它不包括验证范围，实体或其他路由属性。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.auth.scheme('custom', scheme);
server.auth.strategy('default', 'custom');

server.route({
    method: 'GET',
    path: '/',
    handler: async function (request, h) {

        try {
            const credentials = await request.server.auth.verify(request);
            return { status: true, user: credentials.name };
        }
        catch (err) {
            return { status: false };
        }
    }
});
```

### <a name="server.bind()" /> `server.bind(context)`

在添加路由或扩展时，设置用作默认绑定对象的全局上下文:

- `context` - the object used to bind `this` in [lifecycle methods](#lifecycle-methods) such as
  the [route handler](#route.options.handler) and [extension methods](#server.ext()). The context
  is also made available as [`h.context`](#h.context).

返回值: none.

在插件中设置上下文时，上下文仅应用于插件设置的方法。 请注意，上下文仅适用于设置后添加的路由和扩展。如果绑定的方法是箭头函数，则忽略。

```js
const handler = function (request, h) {

    return this.message;    // Or h.context.message
};

exports.plugin = {
    name: 'example',
    register: function (server, options) {

        const bind = {
            message: 'hello'
        };

        server.bind(bind);
        server.route({ method: 'GET', path: '/', handler });
    }
};
```

### <a name="server.cache()" /> `server.cache(options)`

规定[provision]服务器缓存设施中的缓存段：

- `options` - [**catbox** policy](https://github.com/hapijs/catbox#policy) 配置如下:

    - `expiresIn` - 自项目保存在缓存中，用毫秒表示的相对过期时间。 不能和 `expiresAt` 一起使用.

    - `expiresAt` - 使用 'HH:MM' 格式表示的时间, 此时所有缓存记录都将过期. 使用本地时间. 不能和 `expiresIn` 一起使用.

    - `generateFunc` - 如果在调用 `get()` 时未在缓存中找到一个缓存项，用于生成新缓存项的函数. 该方法的签名是 `async function(id, flags)` 其中:

          - `id` - 提供给 `get()` 方法的 `id` 字符串或对象。
          - `flags` - 用于将其他标志传递回缓存的对象，其中：
              - `ttl` - 缓存 ttl 值，以毫秒为单位。设置为 `0` 以跳过存储在缓存中。 默认为缓存全局策略。

    - `staleIn` - 当提供 `generateFunc` 时，存储在缓存中的项目标记为失效【stale】并尝试【attempt】重新生成它的毫秒数。 必须小于 `expiresIn`。

    - `staleTimeout` - 检查项目是否过时之前要等待的毫秒数.

    - `generateTimeout` - 当 `generateFunc` 函数超时毫秒数。最终返回值时, 它存储在缓存中以供将来请求使用. 当 `generateFunc` 指定是，该值是必要的。 设置 `false` 将禁用可能导致所有 `get()` 请求永远被卡住的超时。

    - `generateOnReadError` - 如果为 `false`, 上游缓存读取错误将停止 `cache.get()` 方法调用 generate 函数，而是传回缓存错误。默认为 `true`.

    - `generateIgnoreWriteError` - 如果为 `false`, 调用 `cache.get()` 时出现的上游缓存写入错误会被调用时返回. 默认为 `true`.

    - `dropOnError` - 如果为 `true`, `generateFunc` 中的错误或超时导致超时的值会从缓存中逐出。默认为 `true`.

    - `pendingGenerateTimeout` - 当指定 id 进程调用 `generateFunc` 时的毫秒数, 后续的 `generateFunc` 会被允许. 默认为 `0` (no
      blocking of concurrent `generateFunc` calls beyond `staleTimeout`).

    - `cache` - 配置在 [`server.cache`](#server.config.cache) 的缓存名称. 默认为默认的缓存名。

    - `segment` - segment 字符串名, 用于隔离【isolate】缓存分区【partition】中的缓存项目。在插件中调用时，默认为插件名称 '!name'。在服务器方法中, 默认为服务器方法名 '#name'。在插件外部调用时，该值是必要的。

    - `shared` - 如果为 `true`, 允许多个缓存共享同一个 segment。 默认为`false`.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    const cache = server.cache({ segment: 'countries', expiresIn: 60 * 60 * 1000 });
    await cache.set('norway', { capital: 'oslo' });
    const value = await cache.get('norway');
}
```

### <a name="server.cache.provision()" /> `await server.cache.provision(options)`

提供服务器缓存，如 [`server.cache`](#server.config.cache) 中所述，其中：

- `options` - 与服务器 [`cache`](#server.options.cache) 配置选项相同。

返回值: none.

请注意，如果服务器已初始化或已启动，则将自动启动缓存以匹配任何其他配置的服务器缓存的状态。

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    await server.initialize();
    await server.cache.provision({ provider: require('catbox-memory'), name: 'countries' });

    const cache = server.cache({ cache: 'countries', expiresIn: 60 * 60 * 1000 });
    await cache.set('norway', { capital: 'oslo' });
    const value = await cache.get('norway');
}
```

### <a name="server.control()" /> `server.control(server)`

每当调用当前服务器方法时，通过调用受控服务器 `initialize()`/`start()`/`stop()` 方法将另一个服务器链接到当前服务器的初始化/启动/停止状态，其中：

- `server` - 要控制的 **hapi** 服务器对象。

### <a name="server.decoder()" /> `server.decoder(encoding, decoder)`

注册一个自定义内容解码压缩器，以扩展对 `'gzip'` 和 '`deflate`' 的内置支持，其中：

- `encoding` - 解码器名称字符串。

- `decoder` - 使用签名  `function(options)`  的函数，其中  `options` 是路由 [`payload.compression`](#route.options.payload.compression)  配置选项中配置的编码特定选项，
 返回值是与节点输出兼容的对象 [`zlib.createGunzip()`](https://nodejs.org/api/zlib.html#zlib_zlib_creategunzip_options).

返回值: none.

```js
const Zlib = require('zlib');
const Hapi = require('hapi');
const server = Hapi.server({ port: 80, routes: { payload: { compression: { special: { chunkSize: 16 * 1024 } } } } });

server.decoder('special', (options) => Zlib.createGunzip(options));
```

### <a name="server.decorate()" /> `server.decorate(type, property, method, [options])`

使用自定义方法扩展各种框架接口，其中：

- `type` - 被装饰的接口。支持的类型：

    - `'handler'` - 添加一个新的处理程序类型，用于 [routes handlers](#route.options.handler)
    - `'request'` - 向 [Request object](#request) 添加方法。
    - `'server'` - 将方法添加到 [Server](#server) 对象。
    - `'toolkit'` - 将方法添加到 [response toolkit](#response-toolkit).

- `property` - 对象修饰键名称或符号。

- `method` - 扩展功能或其他值。

- `options` - (可选) 支持以下可选设置：
    - `apply` - 当 `type` 是 `'request'` 时，如果 `true`，则使用签名  `function(request)` 来调用 `method` 函数，其中 `request` 是当前的请求对象，返回的值被指定为 装饰。
    - `extend` - 如果是  `true`，则覆盖现有的装饰。  `method` 必须是一个带有签名`  `function(existing)`  的函数，其中：
        - `existing` - 是先前设置的装饰方法值。
        - 必须返回新的装饰功能或值。
        - 不能用于扩展处理程序的装饰。

返回值: none.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const success = function () {

    return this.response({ status: 'ok' });
};

server.decorate('toolkit', 'success', success);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return h.success();
    }
});
```

注册处理程序装饰时, `method` 必须使用签名的函数 `function(route, options)` 其中:

- `route` - [route information](#request.route).
- `options` - 处理程序配置中提供的配置对象。

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ host: 'localhost', port: 8000 });

    // Defines new handler for routes on this server

    const handler = function (route, options) {

        return function (request, h) {

            return 'new handler: ' + options.msg;
        }
    };

    server.decorate('handler', 'test', handler);

    server.route({
        method: 'GET',
        path: '/',
        handler: { test: { msg: 'test' } }
    });

    await server.start();
}
```

`method `函数可以有一个 `defaults` 对象或函数属性。 如果属性设置为对象，该对象用作使用此处理程序的路由的默认路由配置。 如果属性设置为函数，该函数使用签名  `function(method)` 并返回路由默认配置。

```js
const Hapi = require('hapi');
const server = Hapi.server({ host: 'localhost', port: 8000 });

const handler = function (route, options) {

    return function (request, h) {

        return 'new handler: ' + options.msg;
    }
};

// Change the default payload processing for this handler

handler.defaults = {
    payload: {
        output: 'stream',
        parse: false
    }
};

server.decorate('handler', 'test', handler);
```

### <a name="server.dependency()" /> `server.dependency(dependencies, [after])`

在插件中用于声明当前插件运行所需的其他 [plugins](#plugins)  所需的依赖项（列出的插件必须在服务器初始化或启动之前注册），其中：

- `dependencies` - 其中之一：
  - 单个插件名称字符串。
  - 一组插件名称字符串。
  - 一个对象，其中每个键是一个插件名称，每个匹配的值是 [version range string](https://www.npmjs.com/package/semver) ，它必须与注册的插件版本匹配。

- `after` - (可选) 在注册了所有指定的依赖项之后且在服务器启动之前调用的函数。仅在初始化或启动服务器时才调用该函数。 函数签名是 `async function(server)` 其中：

    - `server` - 服务器调用 `dependency()` 方法

返回值: none.

`after` 方法与在 `'onPreStart'` 上设置服务器扩展点相同【identical】。

如果检测【detected】到循环依赖关系，, 异常【exception】将会被抛出 (例如 两个插件各有一个可以在另一个之后调用的 `after` 函数)。

```js
const after = function (server) {

    // Additional plugin registration logic
};

exports.plugin = {
    name: 'example',
    register: function (server, options) {

        server.dependency('yar', after);
    }
};
```

依赖关系也可以通过插件 `dependencies` 属性设置(不支持设置 `after`)：

```js
exports.plugin = {
    name: 'test',
    version: '1.0.0',
    dependencies: {
        yar: '1.x.x'
    },
    register: function (server, options) { }
};
```

### <a name="server.encoder()" /> `server.encoder(encoding, encoder)`

注册一个自定义内容编码压缩器，以扩展对  `'gzip'` and `'deflate'` 的支持，其中：

- `encoding` - 编码器名称的字符串。

- `encoder` - 使用签名 `function(options)` 的函数，其中 `options` 是路由 [`compression`](#route.options.compression) 选项中配置的编码特定选项， 返回值为与 node 的[`zlib.createGzip()`](https://nodejs.org/api/zlib.html#zlib_zlib_creategzip_options) 输出兼容的对象。

返回值: none.

```js
const Zlib = require('zlib');
const Hapi = require('hapi');
const server = Hapi.server({ port: 80, routes: { compression: { special: { chunkSize: 16 * 1024 } } } });

server.encoder('special', (options) => Zlib.createGzip(options));
```

### <a name="server.event()" /> `server.event(events)`

注册自定义应用程序事件：

- `events` - 必须是以下之一：

    - 一个事件名称字符串.

    - 带有以下可选键的事件选项对象 (除非另有说明):

        - `name` - 事件名称字符串 (必须).

        - `channels` - 指定可用事件通道的字符串或字符串数组。
          默认为没有通道限制（事件更新可以指定通道或不指定通道）。

        - `clone` - 如果为 `true`, 传递给  [`server.events.emit()`](#server.events.emit()) 的` data` 对象在传递给侦听器之前被克隆 (除非每个监听器指定一个覆盖). 默认为 `false` (`data` 按原样传递).

        - `spread` - 如果为 `true`, 传递给 [`server.event.emit()`](#server.event.emit()) 的 `data` 对象必须是一个数组，并且调用 `listener` 方法，每个数组元素作为单独的参数传递（ 除非每个监听器指定一个覆盖）。 仅当已发射的数据结构已知且可预测时，才应使用此方法. 默认为 `false` (`data` 作为单个参数发出，无论其类型如何).

        - `tags` - 如果 `true` 和 `criteria` 对象传递给 [`server.event.emit()`](#server.event.emit()) 包括` tags`。 标记被映射到一个对象（其中每个标记字符串是键，值是 `true`），它被附加到末尾的参数列表中。 每个侦听器都可以设置配置覆盖。 默认为 `false`.

        - `shared` - 如果为 `true` ，则可以多次注册相同的事件 `name`，而忽略第二次注册。 请注意，如果在注册之间更改注册配置，则仅使用第一个配置。 默认为 `false` (重复注册会引发错误).

    - 一个 [**podium**](https://github.com/hapijs/podium) 触发器对象。

    - 包含上述任何内容的数组

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.event('test');
    server.events.on('test', (update) => console.log(update));
    await server.events.emit('test', 'hello');
}
```

### <a name="server.events.emit()" /> `await server.events.emit(criteria, data)`

向所有订阅的侦听器发出自定义应用程序事件，其中：

- `criteria` - 事件更新标准必须是以下之一：

    - 事件名称字符串。
    - 具有以下可选键的对象（除非另有说明）：
        - `name` - 事件名称字符串（必填）。
        - `channel` - 频道名称字符串。
        - `tags` - 标记字符串或标记字符串数组。

- `data` - 触发订阅的值. 如果 `data` 是一个函数, 函数签名为 `function()` 并且它调用一次来生成（返回值）发送给侦听器的实际数据。 如果没有侦听器匹配该事件，则不会调用 `data` 函数。

返回值: none.

请注意，必须先注册事件，然后才能通过调用 [`server.event(events)`](#server.event()) 来发出或订阅事件。
这样做是为了检测事件名称拼写错误和无效事件活动。

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.event('test');
    server.events.on('test', (update) => console.log(update));
    await server.events.emit('test', 'hello');          // await is optional
}
```

### <a name="server.events.on()" /> `server.events.on(criteria, listener)`

注册事件，其中：

- `criteria` - 订阅标准必须是以下之一：

    - 事件名称字符串，可以是 [built-in server events](#server.events) 中的任何一个，也可以是使用 [`server.event()`](#server.event()) 注册的自定义应用程序事件。

    - 带有以下可选键的条件对象（除非另有说明）：

        - `name` - (必要) 事件名称字符串。

        - `channels` - 一个字符串或字符串数组，指定要订阅的事件通道。
          如果事件注册指定了允许的通道列表， `channels` 数组必须与允许的通道匹配。 如果指定了 `channels`，则不包含任何通道指定的事件更新将不包含在订阅中。 默认为没有过滤.

        - `clone` - 如果是 `true`，则传递给 [`server.event.emit()`](#server.event.emit()) 的 `data` 对象在传递给 `listener` 方法之前被克隆。 默认为事件注册选项 (默认为 `false`).

        - `count` - 一个正整数，表示可以调用 `listener` 的次数，之后自动删除订阅。 计数 `1` 与调用 `server.events.once()` 相同。默认为没有限制

        - `filter` - 订阅的事件标记（如果存在）可以是以下之一：

            - tag 字符串。
            - tag 字符串数组。
            - 具有以下内容的对象：

                - `tags` - tag 字符串或字符串数组
                - `all` - 如果为 `true`, 必须存在所有 `tags` 才能使事件更新与订阅匹配。 默认为 `false` (至少匹配一个 tag).

        - `spread` - 如果是 `true` ，并且传递给 [`server.event.emit()`](#server.event.emit()) 的 `data` 对象是一个数组， 
        调用 `listener` 方法，每个数组元素作为单独的参数传递。 仅当触发的数据结构已知且可预测时，才应使用此方法。 默认为事件注册选项 (默认为 `false`).

        - `tags` - 如果 `true` 和 `criteria` 对象传递给  [`server.event.emit()`](#server.event.emit())  包含`tags`， 标记被映射到一个对象（其中每个标记字符串是键，值是 `true`），它被附加到末尾的参数列表中。 默认为事件注册选项 (默认为 `false`).

- `listener` - 处理程序方法设置为接收事件更新。 函数签名取决于事件参数，以及 `spread` 和 `tags` 选项。

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.event('test');
    server.events.on('test', (update) => console.log(update));
    await server.events.emit('test', 'hello');
}
```

### <a name="server.events.once()" /> `server.events.once(criteria, listener)`

与调用 [`server.events.on()`](#server.events.on()) 并将 `count` 选项设置为 `1` 相同。

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.event('test');
    server.events.once('test', (update) => console.log(update));
    await server.events.emit('test', 'hello');
    await server.events.emit('test', 'hello');       // Ignored
}
```

### <a name="server.events.once.await()" /> `await server.events.once(criteria)`

与调用 [`server.events.on()`](#server.events.on()) 并将 `count` 选项设置为 `1` 相同。

 返回值: 当事件被触发，一个 promise 会处于 resolve 状态

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.event('test');
    const pending = server.events.once('test');
    await server.events.emit('test', 'hello');
    const update = await pending;
}
```

### <a name="server.expose()" /> `server.expose(key, value)`

在插件中用于通过 [`server.plugins[name]`](#server.plugins)  公开属性，其中：

- `key` - 分配的 key ([`server.plugins[name][key]`](#server.plugins)).
- `value` - 分配的值

返回值: none.

```js
exports.plugin =
    name: 'example',
    register: function (server, options) {

        server.expose('util', () => console.log('something'));
    }
};
```

### <a name="server.expose.obj()" /> `server.expose(obj)`

将对象合并到 [`server.plugins[name]`](#server.plugins) 的现有内容中，其中：

- `obj` - 对象合并到公开的属性容器中。

返回值: none.

```js
exports.plugin = {
    name: 'example',
    register: function (server, options) {

        server.expose({ util: () => console.log('something') });
    }
};
```

请注意，`obj` 的所有属性都被深深地克隆到 [`server.plugins[name]`](#server.plugins) 中，
因此，请避免使用此方法公开克隆或单个对象（如数据库客户端对象）可能很昂贵的大对象。
使用 [`server.expose(key, value)`](#server.expose()) 替代，它只复制对 `value` 的引用。

### <a name="server.ext()" /> `server.ext(events)`

在 [request lifecycle](#request-lifecycle) 扩展中注册一个扩展函数，其中：

- `events` - 具有以下内容的对象或对象数组：

    - `type` - (必要) 扩展点事件名称。 可用的扩展点包括 [request extension points](#request-lifecycle) 以及以下服务器扩展点：

        - `'onPreStart'` - 当连接监听器启动之前调用
        - `'onPostStart'` - 当连接监听器启动之后调用
        - `'onPreStop'` - 当连接监听器停止之前调用
        - `'onPostStop'` - 当连接监听器停止之后调用

    - `method` - (必要的) 在请求处理期间在指定点执行的函数或函数数组。 所需的扩展功能签名是：

        - server extension points: `async function(server)` 其中:

            - `server` - server 对象
            - `this` - 通过 `options.bind` 提供的对象或 [`server.bind()`](#server.bind()) 设置的当前活动的上下文。

        - request extension points: a [lifecycle method](#lifecycle-methods).

    - `options` - (可选) 具有以下内容的对象：

        - `before` -此方法之前必须执行的插件名称的字符串或数组（在同一事件上）。否则，扩展方法按添加的顺序执行。

        - `after` - 此方法必须在（在同一事件上）之后执行的插件名称字符串或字符串数组。 否则，扩展方法按添加的顺序执行。

        - `bind` - 一个上下文对象在被调用时传递回提供的方法（通过 `this` ）。
           如果方法是箭头函数，则忽略。

        - `sandbox` - 如果在添加 [request extension points](#request-lifecycle) 时设置为“'plugin'”，则扩展仅添加到当前插件定义的路由中。 配置路由级扩展时不允许， 或添加服务器扩展时。 默认为
          `'server'` 适用于添加到服务器的任何路由，添加扩展名。

        - `timeout` - 返回超时错误之前等待 `method` 完成的毫秒数。 默认为无超时。

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });

    server.ext({
        type: 'onRequest',
        method: function (request, h) {

            // Change all requests to '/test'

            request.setUrl('/test');
            return h.continue;
        }
    });

    server.route({ method: 'GET', path: '/test', handler: () => 'ok' });
    await server.start();

    // All requests will get routed to '/test'
}
```

### <a name="server.ext.args()" /> `server.ext(event, method, [options])`


使用 [`server.ext(events)`](#server.ext()) 中使用的相同属性注册单个扩展事件，但作为参数传递。

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });

    server.ext('onRequest', function (request, h) {

        // Change all requests to '/test'

        request.setUrl('/test');
        return h.continue;
    });

    server.route({ method: 'GET', path: '/test', handler: () => 'ok' });
    await server.start();

    // All requests will get routed to '/test'
}
```

### <a name="server.initialize()" /> `await server.initialize()`

初始化服务器（启动缓存，完成插件注册）但不侦听连接端口。

返回值: none.

请注意，如果方法失败并抛出错误， 服务器被认为处于未定义状态，应该关闭。 
在大多数情况下，不可能完全恢复各种插件，缓存，和其他事件监听器会因重复尝试启动服务器或对环境的健康状态做出假设而感到困惑。
建议在服务器无法正常启动时中止该过程。 如果您在发生错误后必须尝试恢复， 
首先调用 [`server.stop()`](#server.stop()) 重置服务器状态。

```js
const Hapi = require('hapi');
const Hoek = require('hoek');

async function example() {

    const server = Hapi.server({ port: 80 });
    await server.initialize();
}
```

### <a name="server.inject()" /> `await server.inject(options)`

向服务器注入一个模拟传入HTTP请求的请求，而不进行实际的套接字连接。
Injection 对于测试目标以及没有网络堆栈的开销和限制的内部调用路由逻辑是很有用的。

该方法使用 [**shot**](https://github.com/hapijs/shot) 模块注入, 以及一些其他选项和响应属性：

- `options` - 可以为请求的 URI 分配一个字符串, 或一个对象:

    - `method` - (可选) 请求 HTTP 方法 (例如 `'POST'`). 默认为 `'GET'`.

    - `url` - (必要的) 请求 URL. 如果URI包含权限
      (例如 `'example.com:8080'`), 它用于自动设置HTTP 'HOST' 标头，除非在 `headers` 中指定了一个。

    - `headers` - (可选) 带有可选请求 header 的对象，其中每个键是 header 名称，值是 header内容。 默认为 没有添加 **shot** headers.

    - `payload` - (可选) 字符串, buffer 或 包含请求 payload 的对象. 如果是对象，它将被转换为字符串。 默认为 无 payload. 注意，如果没有提供 'Content-Type' header， payload
      处理 默认为 `'application/json'` 。

    - `auth` - (optional) 包含解析的身份验证凭据的对象，其中：

        - `strategy` - (必要) 与提供的验证身份验证策略匹配的名称。

        - `credentials` - (required) 包含身份验证信息的凭据对象。
          `credentials` 用于绕过默认的身份验证策略，
          并直接验证，就好像它们是通过身份验证方案收到的一样。

        - `artifacts` - (optional) 包含身份验证 artifacts 信息的 artifacts 对象。`artifacts` 用于绕过默认的身份验证策略，
          并直接验证，就好像它们是通过身份验证方案收到的一样。
          默认没有 artifacts.

    - `app` - (可选) 设置 `request.app` 的初始值, 默认为 `{}`.

    - `plugins` - (可选) 设置 `request.plugins` 的初始值, 默认为 `{}`.

    - `allowInternals` - (可选) 设置`true`，允许访问 `config.isInternal` 的路由。
      默认为 `false`.

    - `remoteAddress` - (可选) 设置传入连接的远程地址。

    - `simulate` - (可选) 带有用于模拟客户端请求流条件以进行测试的选项的对象：

        - `error` - 如果为 `true`, payload 传输后触发 `'error'` 事件 (if any).
          默认为 `false`.

        - `close` - 如果为 `true`, payload 传输后触发 `'close'` 事件 (if any).
          默认为 `false`.

        - `end` - 如果为 `false`, 不会结束流。 默认为 `true`.

        - `split` - 指示请求 payload 是否将拆分为块。 默认为
          `undefined`, 意味着 payload 不会被分块。

    - `validate` - (可选) 如果为 `false`, `options` 输入未经过验证。 推荐在运行时使用 `inject()`，可以在单独测试输入验证情况下执行得更快。

返回值: 具有以下属性的响应对象：

- `statusCode` - HTTP 状态码.

- `headers` - 包含 header 的对象。

- `payload` - 响应 payload 字符串.

- `rawPayload` - 原始响应的 payload buffer

- `raw` -具有注入请求和响应对象的对象：

    - `req` - 模拟节点请求对象。
    - `res` - 模拟节点响应对象。

- `result` - 在序列化传输之前，原始处理程序响应 (例如 不是 stream 或视图时) 。
    如果不可用，则将值设置为 `payload`。 用于检查和重用返回的内部对象 (而不是解析响应字符串).

- `request` - the [request object](#request).

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    server.route({ method: 'GET', path: '/', handler: () => 'Success!' });

    const res = await server.inject('/');
    console.log(res.result);                // 'Success!'
}
```

### <a name="server.log()" /> `server.log(tags, [data, [timestamp]])`

记录无法与特定请求关联【associated】的服务器事件。当被调用时，服务器发出一个 `'log'` 事件，可以被其他侦听器或 [plugins](#plugins) 用来将信息或输出记录到控制台。参数有：

- `tags` - (必须) 字符串或字符串数组 (例如 `['error', 'database', 'read']`) 用于识别事件. 使用标签代替日志级别，并为描述和过滤事件提供更具表现力的机制【mechanism】。服务器内部生成的任何日志都包含 `'hapi'` 标签以及特定于事件的信息。

- `data` - (可选) 记录应用程序数据的消息字符串或对象。 如果 `data` 为一个函数, 函数签名为 `function()` 并且它调用一次来生成 (返回值) 发送给侦听器的实际数据。 如果没有侦听器匹配该事件，则不会调用 `data` 函数。

- `timestamp` - (可选) 以毫秒表示的时间戳。 默认为 `Date.now()` (当前).

返回值: none.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(event);
    }
});

server.log(['test', 'error'], 'Test event');
```

### <a name="server.lookup()" /> `server.lookup(id)`

查找路径配置 其中：

- `id` - the [route identifier](#route.options.id).

返回值: 找到的 [route information](#request.route), 否则为 `null`。

```js
const Hapi = require('hapi');
const server = Hapi.server();
server.route({
    method: 'GET',
    path: '/',
    config: {
        id: 'root',
        handler: () => 'ok'
    }
});

const route = server.lookup('root');
```

### <a name="server.match()" /> `server.match(method, path, [host])`

查找路径配置 其中：

- `method` - HTTP 方法 (例如 'GET', 'POST')。
- `path` - 请求的路径 (必须以 '/' 开头)。
- `host` - (可选) hostname (匹配针对带有 `vhost` 的路由).

返回值: 找到的 [route information](#request.route), 否则为 `null`。

```js
const Hapi = require('hapi');
const server = Hapi.server();
server.route({
    method: 'GET',
    path: '/',
    config: {
        id: 'root',
        handler: () => 'ok'
    }
});

const route = server.match('get', '/');
```

### <a name="server.method()" /> `server.method(name, method, [options])`

注册一个 [server method](#server.methods) 其中：

- `name` - 用于通过 [`server.methods[name]`](#server.method) 调用方法的唯一方法名称。

- `method` - 方法函数带有签名 `async function(...args, [flags])` 其中：
    - `...args` - 方法函数参数（可以是任意数量的参数或无）。
    - `flags` - 启用缓存时，用于设置可选方法结果标志的对象。 此参数是自动提供的，只能在方法功能中访问/修改。 它不能作为参数传递。
        - `ttl` - `0` 结果有效，但无法缓存。默认为缓存策略。

- `options` - (可选) 配置对象：

    - `bind` - 一个上下文对象在被调用时传递给方法函数（通过 `this` ）。
      当方法已经注册，默认为 当前上下文 (通过 [`server.bind()`](#server.bind() 设置)。 如果方法是箭头函数，则忽略。

    - `cache` - [`server.cache()`](#server.cache()) 中使用的缓存配置相同。
      `generateTimeout` 选项是必需的。

    - `generateKey` - 用于从传递给方法函数的参数生成唯一键（用于缓存）的函数（ `flags` 参数不作为输入传递）。 如果函数的参数都是 `'string'`, `'number'` 或 `'boolean'` 类型，服务器将自动生成一个唯一键。 但是，如果该方法使用其他类型的参数，
      必须提供密钥生成函数，该函数采用与函数相同的参数并返回唯一字符串 (如果不能生成密钥，则为 `null`)。

返回值: none.

方法名称可以嵌套 (举例 `utils.users.get`) 它将自动在 [`server.methods`](#server.methods) (举例 通过 `server.methods.utils.users.get` 访问) 下创建完整路径.

配置启用缓存时, `server.methods[name].cache` 被赋予一个具有以下属性和方法的对象:
    - `await drop(...args)` - 一个函数，可用于清除给定键的缓存。
    - `stats` - 具有缓存统计信息的对象, 请参阅 **catbox** 获取统计文档。

单个参数的例子:

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });

    const add = (a, b) => (a + b);
    server.method('sum', add, { cache: { expiresIn: 2000, generateTimeout: 100 } });

    console.log(await server.methods.sum(4, 5));          // 9
}
```

对象参数的例子:

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });

    const addArray = function (array) {

        let sum = 0;
        array.forEach((item) => {

            sum += item;
        });

        return sum;
    };

    const options = {
        cache: { expiresIn: 2000, generateTimeout: 100 },
        generateKey: (array) => array.join(',')
    };

    server.method('sumObj', addArray, options);

    console.log(await server.methods.sumObj([5, 6]));     // 11
}
```

### <a name="server.method.array()" /> `server.method(methods)`

使用配置对象注册服务器方法函数，如 [`server.method()`](#server.method()) 中所述，其中：

- `methods` - 对象或对象数组，其中每个对象包含：

    - `name` - 方法名称.
    - `method` - 方法函数.
    - `options` - (可选) 设置.

返回值: none.

```js
const add = function (a, b) {

    return a + b;
};

server.method({
    name: 'sum',
    method: add,
    options: {
        cache: {
            expiresIn: 2000,
            generateTimeout: 100
        }
    }
});
```

### <a name="server.path()" /> `server.path(relativeTo)`

设置用于在使用相对路径时定位静态资源（文件和视图模板）的路径前缀：

- `relativeTo` - 路径前缀，附加到任意带有 `'.'` 的相对文件路径。

返回值: none.

请注意，在插件中设置路径仅适用于插件方法访问的资源。如果未设置路径，则服务器默认为 [route configuration](#server.options.routes) 使用
[`files.relativeTo`](#route.options.files) 设置. 该路径仅适用于设置后添加的路径。

```js
exports.plugin = {
    name: 'example',
    register: function (server, options) {

        // Assuming the Inert plugin was registered previously

        server.path(__dirname + '../static');
        server.route({ path: '/file', method: 'GET', handler: { file: './test.html' } });
    }
};
```

### <a name="server.register()" /> `await server.register(plugins, [options])`

注册一个插件 其中:

- `plugins` - 一个或多个数组：

    - 一个 [plugin object](#plugins).

    - 一个对象 如下：
        - `plugin` - 一个 [plugin object](#plugins)。
        - `options` - (可选) 注册期间传递给插件的选项。
        - `once`, `routes` - (可选) 特定于插件的注册选项，如下所述。

- `options` - (可选) 注册选项（与传递给注册功能的选项不同）：

    - `once` - 如果 `true`, 在没有错误时，跳过相同插件的后续注册。不能与插件选项一起使用。默认为 `false`。
      如果未设置为 `false` ，则第二次在服务器上注册插件时将引发错误。

    - `routes` - 应用于插件添加的每个路由的修饰符：

        - `prefix` - 字符串作为前缀添加到任何路由路径 (必须以 `'/'` 开头)。如果插件注册子插件，则 `prefix`  将传递给子节点或添加到子节点前缀前面。
        - `vhost` - 添加到每个路由的虚拟 host 字符串 (或字符串数组). 最外层的 `vhost` 覆盖任意的嵌套配置.

返回值: none.

```js
async function example() {

    await server.register({ plugin: require('plugin_name'), options: { message: 'hello' } });
}
```

### <a name="server.route()" /> `server.route(route)`

添加路由：

- `route` - 路由配置对象或配置对象数组，其中每个对象包含：

    - `path` - (必要) 用于匹配传入请求的绝对路径（必须以'/'开头）。
      根据服务器的
      [`router`](#server.options.router) 配置将传入请求与配置的路径进行比较。
      该路径可以包括括在 `{}` 中的命名参数，它将与请求中的文字值进行匹配，如 [Path parameters](#path-parameters) 中所述。

    - `method` - (必要) HTTP 方法. 通常是其中之一 'GET', 'POST', 'PUT', 'PATCH',
      'DELETE', or 'OPTIONS'. 允许任何 非 'HEAD' 的 HTTP 方法。 使用 `'*'` 匹配任何 HTTP 方法 (仅当未找到完全匹配时，与特定方法的任何匹配将优先于通配符匹配). 可以分配一组方法，这些方法与手动添加具有不同方法的相同路径具有相同的结果。

    - `vhost` - (可选) 域字符串或域字符串数组，用于将路由限制为仅具有匹配主机头字段的请求。 匹配仅针对 header 的主机名部分（不包括端口）。. 默认为 所有 hosts.

    - `handler` - (必要 当 [`handler`](#route.options.handler) 没有设置) 调用路由处理函数以在成功进行身份验证和验证后生成响应。

    - `options` - 额外的 [route options](#route-options). 
    `options` 值可以是使用签名 `function(server)` 返回对象的对象或函数，其中 `server` 是添加路由的服务器，`this`绑 定到当前 [realm](#server.realm) 的 `bind` 选项。

    - `rules` - route 自定义规则对象. 该对象被传递给使用 [`server.rules()`](#server.rules()) 注册的每个规则处理器。如果定义了
      [`route.options.rules`](#route.options.rules)，则无法使用。

返回值: none.

请注意，`options` 对象被深度克隆（除了浅层复制的 `bind`）并且不能包含任何不安全的值来执行深层复制。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

// Handler in top level

server.route({ method: 'GET', path: '/status', handler: () => 'ok' });

// Handler in config

const user = {
    cache: { expiresIn: 5000 },
    handler: function (request, h) {

        return { name: 'John' };
    }
};

server.route({ method: 'GET', path: '/user', config: user });

// An array of routes

server.route([
    { method: 'GET', path: '/1', handler: function (request, h) { return 'ok'; } },
    { method: 'GET', path: '/2', handler: function (request, h) { return 'ok'; } }
]);
```

#### 路径参数

通过将命名参数与该路径段处的传入请求路径的内容进行匹配来处理参数化路径。
例如， `'/book/{id}/cover'` 将匹配 `'/book/123/cover'` ，`request.params.id` 将被设置为 `'123'`。
每个路径段（开头 `'/'` 和关闭 `'/'` 之间的所有内容，除非它是路径的末尾）只能包含一个命名参数。
参数可以覆盖整个段(`'/{param}'`)或段的一部分(`'/file.{ext}'`)。
路径参数可能只包含字母，数字和下划线，例如 `'/{file-name}'` 是无效的， `'/{file_name}'` 有效

参数名后面的可选 `'?'` 后缀表示可选参数（仅当参数位于路径的末尾或仅覆盖段的一部分时才允许，如 `'/a{param?}/b'`）。
例如，路由 `'/book/{id?}'` 匹配 `'/book/'`，其中 `request.params.id` 的值设置为空字符串 `''` 。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const getAlbum = function (request, h) {

    return 'You asked for ' +
        (request.params.song ? request.params.song + ' from ' : '') +
        request.params.album;
};

server.route({
    path: '/{album}/{song?}',
    method: 'GET',
    handler: getAlbum
});
```

除了可选的 `?` 后缀之外，参数名称也可以使用 `*` 后缀指定匹配段的数量， 后跟一个大于 1 的数字。如果预期部分的数字可以是任何东西，然后使用没有数字的 `*`（匹配任意数量的段只能在最后一个路径段中使用）。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const getPerson = function (request, h) {

    const nameParts = request.params.name.split('/');
    return { first: nameParts[0], last: nameParts[1] };
};

server.route({
    path: '/person/{name*2}',   // Matches '/person/john/doe'
    method: 'GET',
    handler: getPerson
});
```

#### Path matching order

路由器在每个传入请求上遍历路由表，并执行第一个（也是唯一的）匹配路由。
路由匹配是基于请求路径和 HTTP 方法的组合完成的（例如'GET，'POST'）。
查询从路由逻辑中排除。
请求以确定性顺序匹配，其中添加路由的顺序无关紧要。

根据在传入请求路径的每个段上评估的路由的特异性来匹配路由。
每个请求路径都被拆分为其段（由 `'/'` 分隔的部分）。
这些段一次一个地与路由表进行比较，并与最具体的路径进行匹配，直到找到匹配为止。
如果未找到匹配项，则尝试下一次匹配。

匹配路由时，字符串文字（无路径参数）具有最高优先级，
然后是混合参数(`'/a{p}b'`)，参数 (`'/{p}'`) ，最后是通配符(`/{p*}`)。

请注意，混合参数比较慢，因为它们无法进行散列，并且需要对表示每个路由表节点上的各种混合参数的所有正则表达式进行数组迭代。

#### Catch all route

如果应用程序需要覆盖默认的 Not Found（404）错误响应，它可以为特定方法或所有方法添加 catch-all 路由。只能定义一个 catch-all 路由。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const handler = function (request, h) {

    return h.response('The page was not found').code(404);
};

server.route({ method: '*', path: '/{p*}', handler });
```

### <a name="server.rules()" /> `server.rules(processor, [options])`

定义路由规则处理器，用于将路由规则对象转换为路由配置：

- `processor` - 使用签名  `function(rules, info)` 的函数，其中：
    - `rules` - [custom object](#route.options.rules) 定义在你的路由配置中，以便你使用这个值
    - `info` - 具有以下属性的对象：
        - `method` - route 方法.
        - `path` - route 路径.
        - `vhost` - route 虚拟 host (如果有的定义的话).
    - 返回路由配置对象。

- `options` - 可选设置:
    - `validate` - 规则对象验证：
        - `schema` - **joi** 格式.
        - `options` - 可选的 **joi** 验证选项. 默认为 `{ allowUnknown: true }`.

请注意，根服务器和每个插件服务器实例只能注册一个规则处理器。如果在配置规则后添加路由，则不会包含规则配置。插件添加的路由将规则应用于从根到路由域的每个父域规则。
这意味着如果它们重叠【overlap】，插件定义的处理器会覆盖根处理器生成的配置。
如果重叠，路由 `config` 会覆盖规则配置。


### <a name="server.start()" /> `await server.start()`

通过监听已配置端口上的传入请求来启动服务器（除非连接配置了 [`autoListen`](#server.options.autoListen) 为 `false`）。

返回值: none.

请注意，如果方法失败并引发错误, 服务器被认为处于未定义状态，应该关闭。 在大多数情况下，不可能像各种插件一样完全恢复，缓存，和其他事件监听器会因重复尝试启动服务器或对环境的健康状态做出假设而感到困惑
建议在服务器无法正常启动时中止该过程。 如果您在发生错误后必须尝试恢复，首先调用 [`server.stop()`](#server.stop()) 来重置服务器状态。

如果再次启动已启动的服务器, 第二次调用 `server.start()` 会被忽略。不会发出任何事件，也不会调用任何扩展点。

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    await server.start();
    console.log('Server started at: ' + server.info.uri);
}
```

### <a name="server.state()" /> `server.state(name, [options])`

[HTTP state management](https://tools.ietf.org/html/rfc6265) 使用客户端 cookie 在多个请求中保持状态。 注册 cookie 定义，如下:

- `name` - cookie 名称字符串。

- `options` - 是可选的 cookie 设置：

    - `ttl` - 以毫秒为单位的生存时间（time-to-live） 默认为 `null` (session 生命周期 - 浏览器关闭时会删除 cookie).

    - `isSecure` - 设置 'Secure' 标识. 默认为 `true`.

    - `isHttpOnly` - 设置 'HttpOnly' 标识. 默认为 `true`.

    - `isSameSite` - 设置 ['SameSite' flag](https://www.owasp.org/index.php/SameSite).  该值必须是其中之一:

        - `false` - 没有标识。
        - `'Strict'` - 设置值为 `'Strict'` (这是默认值).
        - `'Lax'` - 设置值为 `'Lax'`.

    - `path` - path 范围. 默认为 `null` (没有 path).

    - `domain` - domain 范围. 默认为 `null` (没有 domain).

    - `autoValue` - 如果存在并且未从客户端接收cookie或由路由处理程序显式设置, cookie 将自动添加到具有提供值的响应中。
      该值可以是具有签名 `async function（request）` 的函数，其中：

        - `request` - [request object](#request).

    - `encoding` - 编码在序列化之前对提供的值执行 encode。 选项包括：

        - `'none'` - 不 encoding. 使用时，cookie 值必须是字符串。这是默认值。
        - `'base64'` - 字符串值使用 Base64 编码。
        - `'base64json'` - 对象值是 JSON 字符串化，然后使用 Base64 编码。
        - `'form'` - 使用 _x-www-form-urlencoded_ 方法对对象值进行编码。
        - `'iron'` - 加密和签名值使用
          [**iron**](https://github.com/hueniverse/iron).

    - `sign` - 用于计算用于 cookie 完整性验证的 HMAC 的对象。这不提供隐私, 只是意味着验证 cookie 值是由服务器生成的。
      使用 `'iron'` 编码时冗余。 选项包括：

        - `integrity` - 算法选项. 默认为
          [`require('iron').defaults.integrity`](https://github.com/hueniverse/iron#options).
        - `password` - 用于 HMAC 密钥生成的密码（长度必须至少为32个字符）。

    - `password` - 用于 `'iron'` 编码的密码（必须至少32个字符）。

    - `iron` - `'iron'` 编码的选项. 默认为
       [`require('iron').defaults`](https://github.com/hueniverse/iron#options).

    - `ignoreErrors` - 如果 `true`, 错误被忽略并被视为缺少 cookie。

    - `clearInvalid` - 如果 `true`, 自动指示客户端删除无效的 cookie。 默认为 `false`.

    - `strictHeader` - 如果 `false`, 允许任何 cookie 值，包括违反 [RFC 6265](https://tools.ietf.org/html/rfc6265) 的值. 默认为 `true`.

    - `passThrough` - 用于代理插件 (例如 [**h2o2**](https://github.com/hapijs/h2o2)).

返回值: none.

State 默认可以通过 [server.options.state](#server.options.state) 配置选项修改.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

// Set cookie definition

server.state('session', {
    ttl: 24 * 60 * 60 * 1000,     // One day
    isSecure: true,
    path: '/',
    encoding: 'base64json'
});

// Set state in route handler

const handler = function (request, h) {

    let session = request.state.session;
    if (!session) {
        session = { user: 'joe' };
    }

    session.last = Date.now();

    return h.response('Success').state('session', session);
};
```

注册的 cookie 在收到时会自动解析。 解析规则取决于路由
[`state.parse`](#route.options.state) 配置。 如果传入的已注册cookie无法解析，它不会包含在 [`request.state`](#request.state) 中, 无论
[`state.failAction`](#route.options.state.failAction) 的设置. 当 [`state.failAction`](#route.options.state.failAction)
设置为 `'log'` 并且接收到不可用的 cookies 时, 服务器将触发 [`'request'` event](#server.events.request). 要捕获这些错误，请在 channels `'internal'` 上注册 `'request'` 事件，并过滤 `'error'` 和 `'state'` 标签：

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.events.on({ name: 'request', channels: 'internal' }, (request, event, tags) => {

    if (tags.error && tags.state) {
        console.error(event);
    }
});
```

### <a name="server.states.add()" /> `server.states.add(name, [options])`

访问： 只读。

于调用 [`server.state()`](#server.state()) 相同。

### <a name="server.states.format()" /> `await server.states.format(cookies)`

基于 [`server.options.state`](#server.options.state) 格式化HTTP 'Set-Cookie' header
其中:

- `cookies` - 单个对象或对象数组，每个对象包含：
    - `name` - cookie 名.
    - `value` - cookie 值.
    - `options` - cookie 配置以覆盖服务器设置。

返回值: 一个 header 字符串.

请注意，这个工具类使用服务器配置，但不会改变服务器的状态。它用于手动 cookie 解析(例如禁用服务器解析时).

### <a name="server.states.parse()" /> `await server.states.parse(header)`

转换 HTTP 'Cookies' header 基于 [`server.options.state`](#server.options.state) 其中:

- `header` - HTTP header.

返回值: 一个对象，其中每个键都是 cookie 名称，值是解析后的 cookie。

请注意，这个工具类使用服务器配置，但不会改变服务器的状态。它用于手动 cookie 解析(例如禁用服务器解析时).

### <a name="server.stop()" /> `await server.stop([options])`

通过拒绝接受任何新连接或请求来停止服务器的侦听器（现有连接将一直持续到关闭或超时），其中：

- `options` - (可选) 对象 其中:

    - `timeout` - 在强制终止在服务器停止接受新连接之前到达的任何打开的连接之前，以毫秒为单位设置超时。 超时仅适用于等待现有连接关闭，
        而不是任何 [`'onPreStop'` or `'onPostStop'` server extensions](#server.ext.args())，它可以无限期地延迟或阻止停止操作。
        如果 [`server.options.operations.cleanStop`](#server.options.operations)  为 `false` 则忽略。
        请注意，如果服务器设置为 [group controller](#server.control())，超时是每个受控服务器和控制服务器本身。默认为 `5000`（5秒）。

返回值: none.

```js
const Hapi = require('hapi');

async function example() {

    const server = Hapi.server({ port: 80 });
    await server.start();
    await server.stop({ timeout: 60 * 1000 });
    console.log('Server stopped');
}
```

### <a name="server.table()" /> `server.table([host])`

返回路由表的副本，其中：

- `host` - (可选) 指定路由匹配一个指定的虚拟 host。 默认为所有虚拟 host.

返回值: 路由数组，每个路由包含：
- `settings` - 默认添加的路由配置。
- `method` - 小写的 HTTP 方法
- `path` - route 地址

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });
server.route({ method: 'GET', path: '/example', handler: () => 'ok' });

const table = server.table();
```

## Route options

每个路由可进行定制，以改变请求生命周期的默认行为。

### <a name="route.options.app" /> `route.options.app`

应用程序特定的路由配置状态。 不应该被 [plugins](#plugins) 使用，应该用 `options.plugins[name]` 替代。

### <a name="route.options.auth" /> `route.options.auth`

路由验证配置。 值可以是：

- 如果设置了默认的验证策略，则为 `false` 以关闭身份验证

- 字符串。使用 [`server.auth.strategy()`](#server.auth.strategy()) 注册的验证名称。该策略将被设置为 `'required'` 模式

- [authentication configuration object](#authentication-options).

#### <a name="route.options.auth.access" /> `route.options.auth.access`

默认值: none.

指定路由访问规则的对象或对象数组。 每个规则针对传入的请求判断，如果规则中至少一个相匹配则允许访问。每个规则至少包含一个 [`scope`](#route.options.auth.access.scope) 或 [`entity`](#route.options.auth.access.entity)。

#### <a name="route.options.auth.access.scope" /> `route.options.auth.access.scope`

默认值: `false` (没有范围要求【requirement】).

访问路由所需的应用程序范围。值可以是一个范围的字符串或者是一个范围字符串的的数组。当身份认证时，凭证对象 `scope` 属性必须包含至少一个已定义的用于访问路由的范围。

如果作用域字符串以 `+` 开头，则该作用域是必需的。如果作用域字符串以 `!` 开头，则禁止该作用域。例如，`['!a', '+b', 'c', 'd']` 表示 传入的请求凭证的 `scope` 必须不包含 'a', 必须包含 'b', 而且必须需要包含 'c' 或者 'd' 其中一个。

你还可以访问请求对象上的属性(`query`, `params`, `payload`, 和 `credentials`)，使用属性名包含 '{' 和 '}' 字符填充动态范围，例如 `'user-{params.id}'`。

#### <a name="route.options.auth.access.entity" /> `route.options.auth.access.entity`

默认值: `'any'`.

所需认证的实体【entity】类型. 如果设置，则必须匹配请求身份验证凭据的 `entity` 值。可选值：

- `'any'` - 身份验证可以代表【behalf】用户或应用程序。
- `'user'` - 身份验证必须代表用户，该用户通过身份验证策略返回的 `credentials` 对象中存在【presence】`'user'` 属性来识别。
- `'app'` - 身份验证必须代表一个应用程序，该应用程序由身份验证策略返回的 `credentials` 对象中缺少的 `user` 属性来识别。

#### <a name="route.options.auth.mode" /> `route.options.auth.mode`

默认值: `'required'`.

身份验证模式。 可用值：

- `'required'` - 身份验证是必需的。
- `'optional'` - 身份验证是可选的 - 请求必须包含有效凭据或根本不包含凭据。
- `'try'` - 类似于【similar】`'optional'`, 任何请求凭据都是尝试身份验证, 但如果凭证无效, 无论身份验证错误如何，请求都会继续。

#### <a name="route.options.auth.payload" /> `route.options.auth.payload`

默认值: `false`, 除非该方案需要有效 payload 认证。

如果设置，则在处理传入请求有效 payload 后对其进行身份验证。需要具有有效 payload 身份验证支持的策略 (例如 [Hawk](#https://github.com/hueniverse/hawk))。当方案将认证 `options.payload` 设置为 `true` 时，不能将其设置为 `'required'` 以外的值。

可用值：

- `false` - 没有 payload 身份认证.
- `'required'` - 需要有效的 payload 身份认证.
- `'optional'` - 仅在客户端包含有效 payload 认证信息时执行有效 payload 认证 （例如在 Hawk 中带有 `hash` 属性）。

#### <a name="route.options.auth.strategies" /> `route.options.auth.strategies`

默认值: 默认的策略，通过设置 [`server.auth.default()`](#server.auth.default()).

包含策略名称字符串的数组，它们会被按顺序尝试认证。不能与 [`strategy`](#route.options.auth.strategy) 一同使用

#### <a name="route.options.auth.strategy" /> `route.options.auth.strategy`

默认值: 默认的策略，通过设置 [`server.auth.default()`](#server.auth.default()).

策略名称 - 字符串。不能与 [`strategies`](#route.options.auth.strategies) 一同使用

### <a name="route.options.bind" /> `route.options.bind`

默认值: `null`.

一个对象在被调用时传递回提供的 `handler`（通过 `this` ）。 如果方法是箭头函数，则忽略。

### <a name="route.options.cache" /> `route.options.cache`

默认值: `{ privacy: 'default', statuses: [200], otherwise: 'no-cache' }`.

如果路由方法是 'GET' ，则可以将路由配置为在响应中包含 HTTP 缓存指令。可以使用具有以下选项的对象自定义缓存：

- `privacy` - 使用 'Cache-Control' header 确定客户端缓存中包含的隐私标志。 值为:

    - `'default'` - 没有隐私标志。
    - `'public'` - 将响应标记为适合公共缓存。
    - `'private'` - 将响应标记为仅适用于私有缓存。

- `expiresIn` - 毫秒数表示的自缓存以来相对到期时间。 不能与 `expiresAt` 一起使用。

- `expiresAt` - 使用 'HH:MM' 格式以 24 小时表示的时间， 此时路由的所有缓存记录都将过期。 不能与 `expiresIn` 一起使用。

- `statuses` - HTTP 响应状态码数字的数组 (例如 `200`), 允许包含有效的缓存指令。

- `otherwise` - 禁用缓存时具有  'Cache-Control' header 头值的字符串。

通过将 `cache` 设置为 `false`，可以禁用默认的 `Cache-Control: no-cache` header。

### <a name="route.options.compression" /> `route.options.compression`

一个对象，其中每个键是内容编码名称，每个值是具有所需【desired】编码器设置的对象。注意，解码器设置是在 [`compression`](#route.options.payload.compression) 中设置。

### <a name="route.options.cors" /> `route.options.cors`

默认值: `false` (无跨域头).

[Cross-Origin Resource Sharing](https://www.w3.org/TR/cors/) 协议允许浏览器进行跨域 API 调用。运行在浏览器中的 Web 应用程序需要 CORS，这些 Web 应用程序是从与 API 服务器不同的域加载的。要启用，请将 `cors` 设置为 `true`，或者将对象设置为具有以下选项：

- `origin` - 允许的源服务器字符串数组 ('Access-Control-Allow-Origin'). 该数组可以包含完全限定原点的任意组合以及包含通配符 `'*'` 字符的原始字符串，, 或单独的 `'*'` 原始字符串。 如果设置为 `'ignore'` ，则忽略任何传入的 Origin header (无论是否提供) 并且 'Access-Control-Allow-Origin' header 被设置为
  `'*'`. 默认为 any origin `['*']`。

- `maxAge` - 浏览器应缓存 CORS 响应的秒数
  ('Access-Control-Max-Age').值越大，浏览器检查策略更改之前所需的时间越长。 默认为 `86400` (one day).

- `headers` - 允许的 header 的字符串数组 ('Access-Control-Allow-Headers'). 默认为
  `['Accept', 'Authorization', 'Content-Type', 'If-None-Match']`.

- `additionalHeaders` - 一个字符串数组的 additional headers 到 `headers`。 使用此选项可保留默认标头。

- `exposedHeaders` - 一个 expose header 的字符串数组 ('Access-Control-Expose-Headers').
  默认为 `['WWW-Authenticate', 'Server-Authorization']`.

- `additionalExposedHeaders` - 一个字符串数组的额外 header 到 `exposedHeaders` 。 使用此选项可保留默认 header。

- `credentials` - 如果是 `true`, 则允许发送用户凭证
  ('Access-Control-Allow-Credentials'). 默认为 `false`.

### <a name="route.options.description" /> `route.options.description`

默认值: none.

用于生成文档的路由描述（字符串）。

使用 [`server.options.routes`](#server.options.routes) 设置服务器路由默认值时，此设置不可用。

### <a name="route.options.ext" /> `route.options.ext`

默认值: none.

路由级别 [request extension points](#request-lifecycle) 通过将选项设置为具有每个所需扩展点的键的对象 (`'onRequest'` 是不被允许的), 并且该值与 [`server.ext(events)`](#server.ext()) `event` 参数相同。

### <a name="route.options.files" /> `route.options.files`

默认值: `{ relativeTo: '.' }`.

定义访问文件的行为：

- `relativeTo` - 确定要解析的文件夹相对路径。

### <a name="route.options.handler" /> `route.options.handler`

默认值: none.

路由处理函数执行【performs】路由的主要业务逻辑并设置响应。
`handler` 可以被指定为:

- [lifecycle method](#lifecycle-methods).

- 一个具有单个属性的对象，使用 [`server.decorate()`](#server.decorate()) 方法注册的处理程序类型名称。匹配的属性值作为选项传递给已注册的处理程序生成器。

```js
const handler = function (request, h) {

    return 'success';
};
```

注意：使用箭头函数的处理程序不能绑定到任何 `bind` 属性。相反，绑定上下文在 [`h.context`](#h.context) 下可用。

### <a name="route.options.id" /> `route.options.id`

默认值: none.

用于使用 [`server.lookup()`](#server.lookup()) 查找路由的可选唯一标识符。
无法分配给添加了方法数组的路由。

### <a name="route.options.isInternal" /> `route.options.isInternal`

默认值: `false`.

如果为 `true`, 路由不能通过 HTTP 侦听器访问，而只能通过 [`server.inject()`](#server.inject()) 接口访问，并且 `allowInternals` 选项设置为 `true`。
用于外部世界无法访问的内部路由。

### <a name="route.options.json" /> `route.options.json`

默认值: none.

在将对象或错误响应转换为字符串有效内容或在字符串化后转义它时，可选参数传递给  `JSON.stringify()` 。支持以下内容：

- `replacer` - replacer 函数或数组。 默认为无操作。

- `space` - 缩进嵌套对象 key 的空格数。 默认为无缩进。

- `suffix` - 转换为JSON字符串后添加字符串后缀。 默认为无后缀。

- `escape` - 转换为 JSON 字符串后调用 [`Hoek.jsonEscape()`](https://github.com/hapijs/hoek/blob/master/API.md#escapejsonstring)。 默认为 `false`.

### <a name="route.options.jsonp" /> `route.options.jsonp`

默认值: none.

启用 JSONP 支持，通过将值设置为包含用于包装相应有效内容的函数名称的查询参数名称。

举个例子，如果值为 `'callback'`，请求过来带着 `'callback=me'`，那么 JSON 相应是 `'{ "a":"b" }'`，有效内容将为 `'me({ "a":"b" });'`。不能用于流相应。

'Content-Type' 响应头设置为 `'text/javascript'` 和 'X-Content-Type-Options' 相应头设置为 `'nosniff'`，并且即使由 [`response.type()`](#response.type()) 显式设置，也会覆盖这些头。

### <a name="route.options.log" /> `route.options.log`

默认值: `{ collect: false }`.

请求日志选项：

- `collect` - 如果为 `true`, 请求级别 日志 (内部和应用) 会通过 [`request.logs`](#request.logs) 收集.

### <a name="route.options.notes" /> `route.options.notes`

默认值: none.

用于生成文档的路由注释（字符串或字符串数组）。

使用 [`server.options.routes`](#server.options.routes) 设置服务器路由默认值时，此设置不可用。

### <a name="route.options.payload" /> `route.options.payload`

确定【Determines】如何处理请求有效内容。

#### <a name="route.options.payload.allow" /> `route.options.payload.allow`

默认值:允许解析以下 mime 类型：
- application/json
- application/*+json
- application/octet-stream
- application/x-www-form-urlencoded
- multipart/form-data
- text/*

字符串或字符串数组，其中包含网络节点允许的 mime 类型。使用此设置可限制允许的 mime 类型集。请注意，允许上面未列出的其他 mime 类型将无法解析它们，如果 [`parse`](#route.options.payload.parse) 是 `true`，那么请求
将导致错误响应。

#### <a name="route.options.payload.compression" /> `route.options.payload.compression`

默认值: none.

一个对象，其中每个键是内容编码名称，每个值是具有所需解码器设置的对象。请注意编码器在 [`compression`](#server.options.compression) 中设置。

#### <a name="route.options.payload.defaultContentType" /> `route.options.payload.defaultContentType`

默认值: `'application/json'`.

如果缺少 'Content-Type' 请求头，则为默认内容类型。

#### <a name="route.options.payload.failAction" /> `route.options.payload.failAction`

默认值: `'error'` (返回错误请求（400）错误响应)。

[`failAction` value](#lifecycle-failAction) 它确定如何处理有效负载解析错误。

#### <a name="route.options.payload.maxBytes" /> `route.options.payload.maxBytes`

默认值: `1048576` (1MB).

将传入有效负载的大小限制为指定的字节数。 允许非常大的有效负载可能导致服务器内存不足。

#### <a name="route.options.payload.multipart" /> `route.options.payload.multipart`

默认值: none.

覆盖多部分请求的有效负载处理. 值可以是以下之一：:

- `false` - 禁用多部分处理

- 具有以下必需选项的对象：

    - `output` - 与 [`output`](#route.options.payload.output) 选项相同，带有额外值的选项：
        - `annotated` - 使用以下键将每个多部分包装在对象中：

            - `headers` - header 部分 .
            - `filename` - file name 部分.
            - `payload` - 处理过的 payload 部分。

#### <a name="route.options.payload.output" /> `route.options.payload.output`

默认值: `'data'`.

处理的有效载荷格式。 该值必须是其中之一：

- `'data'` - 传入的 payload 完全读入内存。 如果 [`parse`](#route.options.payload.parse)
  为 `true`, 基于 'Content-Type' header 解析 payload (JSON, form-decoded, multipart) . 如果 [`parse`](#route.options.payload.parse) is `false`, 会返回原始的 `Buffer` 。

- `'stream'` - 传入的有效负载通过 `Stream.Readable` 接口提供。 如果
  payload 为 'multipart/form-data' 并且 [`parse`](#route.options.payload.parse) 为 `true`, 字段值以文本形式显示，而文件以流形式提供。来自 'multipart/form-data' 上传的文件流也将具有包含 `filename` 和 `headers` 属性的 `hapi` 属性。
  请注意，多个 payload 的 plyaload 流是在加载到内存中的整个多内容之上创建的合成接口。为避免将大型多个 payload 加载到内存中，将 [`parse`](#route.options.payload.parse)  设置为 `false` 并使用流解析器处理处理程序中的多 payload (例如 [**pez**](https://github.com/hapijs/pez))。



- `'file'` - 传入的有效负载被写入 [`uploads`](#route.options.payload.uploads) 设置指定的目录中的临时文件。
    如果有效载荷是 'multipart/form-data' 并且 [`parse`](#route.options.payload.parse) 为 `true` 时，
    文件保存到磁盘时，字段值设置为文本。
    请注意，清除框架生成的文件是应用程序的唯一责任。这可以通过跟踪使用哪些文件来完成(例如
    使用 `request.app` 对象), 并监听服务器 `'response'` 事件以执行清理。

#### <a name="route.options.payload.override" /> `route.options.payload.override`

默认值: none.

mime 类型字符串，覆盖收到的 'Content-Type' 值。

#### <a name="route.options.payload.parse" /> `route.options.payload.parse`

默认值: `true`.

确定传入的有效负载是否已处理或以原始方式显示。 可用值：

- `true` - 如果请求  'Content-Type' 匹配 [`allow`](#route.options.payload.allow)  设置的允许 mime 类型（对于整个 payload 以及部分），尽可能将 payload 转换为对象。
    如果格式未知，则发送 Bad Request (400) 错误响应。 任何已知的内容编码进行解码。

- `false` - 原始 payload 未经修改就返回。

- `'gunzip'` - 任何已知的内容编码都被解码，未经修改地返回原始 payload 。

#### <a name="route.options.payload.protoAction" /> `route.options.payload.protoAction`

默认值: `'error'`.

设置对可能包含原型中毒【Prototype Poisoning 】安全攻击的传入 payload 的处理。 可用值：

- `'error'` - 当 payload 包含 prototype 时，返回 `400` bad request 错误。

- `'remove'` - 清理 payload 移除 prototype。

- `'ignore'` - 禁用保护并允许 payload 按原样传递。 仅当您确定此类传入数据不会对您的应用程序造成任何风险时，才使用此选项。

#### <a name="route.options.payload.timeout" /> `route.options.payload.timeout`

默认值: to `10000` (10 seconds).

设置客户端在放弃和响应 Request Timeout (408) 错误响应之前传输请求 payload (body) 所允许的最长时间。

设置为 `false` 以禁用。

#### <a name="route.options.payload.uploads" /> `route.options.payload.uploads`

默认值: `os.tmpdir()`.

用于写入文件上传的目录。

### <a name="route.options.plugins" /> `route.options.plugins`

默认值: `{}`.

特定于插件的配置。 `plugins` 是一个对象，其中每个键都是一个插件名称和值
是插件配置。

### <a name="route.options.pre" /> `route.options.pre`

默认值: none.

`pre` 选项允许定义在调用处理程序之前执行操作的方法。 这些方法允许将处理程序逻辑分解为更小的，可以跨路由共享的可重用组件，以及提供先决条件操作的更清晰的错误处理(例如从数据库加载所需的参考数据).

`pre` 被赋予一个有序的方法数组，这些方法按顺序被串行调用。如果 `pre` 数组包含另一个方法数组作为其元素之一， 这些方法是并行调用的。
请注意，在并行执行期间， 如果任何方法错误， 返回一个
[takeover response](#takeover-response), 或终止信号, 其他并行方法将继续执行，但一旦完成将被忽略。

`pre` 可以分配一个混合数组：

- 包含下面列出的元素的数组，它们是并行执行的。

- 一个对象带有:
    - `method` - [lifecycle method](#lifecycle-methods).
    - `assign` - 用于在 [`request.pre`](#request.pre)
      和 [`request.preResponses`](#request.preResponses中分配方法响应的键名。
    - `failAction` - 一个 [`failAction` value](#lifecycle-failAction)，用于确定预处理程序方法抛出错误时要执行的操作。如果指定 `assign` 并且` failAction` 设置不是 `'error'`，那么错误将会被分配。

- 方法函数 - 与包含单个 `method` 键的对象相同。

请注意，预处理程序方法的行为与返回值时其他 [lifecycle methods](#lifecycle-methods) 的行为方式不同。
该值用于分配相应的 [`request.pre`](#request.pre) 和 [`request.preResponses`](#request.preResponses)（＃request.preResponses）属性，而不是该值成为新的响应 payload。
否则，错误处理，takeover response](#takeover-response) 或中止信号的行为与任何其他 [lifecycle methods](#lifecycle-methods) 的行为相同。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const pre1 = function (request, h) {

    return 'Hello';
};

const pre2 = function (request, h) {

    return 'World';
};

const pre3 = function (request, h) {

    return request.pre.m1 + ' ' + request.pre.m2;
};

server.route({
    method: 'GET',
    path: '/',
    config: {
        pre: [
            [
                // m1 and m2 executed in parallel
                { method: pre1, assign: 'm1' },
                { method: pre2, assign: 'm2' }
            ],
            { method: pre3, assign: 'm3' },
        ],
        handler: function (request, h) {

            return request.pre.m3 + '!\n';
        }
    }
});
```

### <a name="route.options.response" /> `route.options.response`

处理传出响应的规则。

#### <a name="route.options.response.disconnectStatusCode" /> `route.options.response.disconnectStatusCode`

 Default value: `499`.

默认 HTTP 状态代码，用于在完全传输响应之前关闭或中止请求时设置响应错误。值可以是大于或等于 `400` 的任何整数。
默认值 `499` 基于非标准 nginx "CLIENT CLOSED REQUEST" 错误。该值仅用于请求已结束的日志记录。

#### <a name="route.options.response.emptyStatusCode" /> `route.options.response.emptyStatusCode`

 默认值: `200`.

当有 payload 为空时的默认 HTTP 状态代码。值可以是 `200` 或 `204`。注意，仅在响应传输时将  `200` 状态代码转换为 `204`（除非手动设置，否则响应状态代码将在整个请求生命周期内保持为  `200` ）。

#### <a name="route.options.response.failAction" /> `route.options.response.failAction`

默认值: `'error'` (返回一个 Internal Server Error (500) 错误响应).

一个 [`failAction` value](#lifecycle-failAction)，它定义了响应失败有 payload 验证时要执行的操作。

#### <a name="route.options.response.modify" /> `route.options.response.modify`

默认值: `false`.

如果为 `true` ，则将验证规则更改应用于响应有效内容。

#### <a name="route.options.response.options" /> `route.options.response.options`

默认值: none.

[**joi**](https://github.com/hapijs/joi) 选项对象传递给验证函数.用于设置全局选项，例如 `stripUnknown` 或 `abortEarly` (完整的列表如下
[here](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback)).
如果通过 [`schema`](#route.options.response.schema) 或 [`status`](#route.options.response.status) 定义自定义验证函数，则 `options` 可以是任意对象 传递给这个函数作为第二个参数。

#### <a name="route.options.response.ranges" /> `route.options.response.ranges`

默认值: `true`.

如果为“false”，则禁用 payload [range](https://tools.ietf.org/html/rfc7233#section-3)支持。

#### <a name="route.options.response.sample" /> `route.options.response.sample`

默认值: `100` (all responses).

验证响应有效负载的百分比 (0 - 100). 设置为 `0` 以禁用所有验证。

#### <a name="route.options.response.schema" /> `route.options.response.schema`

默认值: `true` (no validation).

默认响应 payload 验证规则（针对所有非错误响应）表示为以下之一：

- `true` - 允许的任何 payload（无验证）。

- `false` - 不允许 payload。

- 一个 [**joi**](https://github.com/hapijs/joi) 验证对象. [`options`](#route.options.response.options) 以及请求上下文（ (`{ headers, params, query, payload, state, app, auth }`) 被传递给验证函数。

- 使用签名 `async function(value, options)`  的验证函数，其中：

    - `value` - 挂起的响应 payload。
    - `options` - The [`options`](#route.options.response.options) 以及请求上下文
      (`{ headers, params, query, payload, state, app, auth }`).

    - 如果函数返回一个值并且 [`modify`](#route.options.response.modify)  为`true`，该值用作新响应。
        如果原始响应是错误的，返回值用于覆盖原始错误 `output.payload`。如果抛出错误，
        根据 [`failAction`](#route.options.response.failAction) 处理错误。

#### <a name="route.options.response.status" /> `route.options.response.status`

默认值: none.

特定 HTTP 状态代码的验证模式。 使用默认的 [`schema`](#route.options.response.schema) 验证与列出的状态代码不匹配的响应（不包括错误）。

`status` 设置为一个对象，其中每个键是一个 3 位 HTTP 状态代码，该值与 [`schema`](#route.options.response.schema). 具有相同的定义。

### <a name="route.options.rules" /> `route.options.rules`

默认值: none.

自定义规则对象，传递给每个 [`server.rules()`](#server.rules())  注册的规则处理器。

### <a name="route.options.security" /> `route.options.security`

默认值: `false` (security headers disabled).

设置公共安全头。 要启用，请将 `security` 设置为 `true` 或使用以下选项设置对象：

- `hsts` - 控制 'Strict-Transport-Security' header, 其中:

    - `true` - header 将被设置为 `max-age=15768000`. 这是默认值.
    - a number - maxAge 参数将设置为提供的值。

    - 包含以下字段的对象：
        - `maxAge` - max-age 部分, 作为数字. 默认为 `15768000`.
        - `includeSubDomains` - 一个布尔值，指定是否将“ `includeSubDomains` 标志添加到 header 中。
        - `preload` - 一个布尔值，指定是否添加 `'preload'`  标志 (用于提交域列入 Chrome's HTTP Strict Transport Security (HSTS) 预加载列表) 到 header

- `xframe` - 控制 'X-Frame-Options' header, 其中:

    - `true` - header 将被设置为 `'DENY'`. 这是默认值.
    - `'deny'` - header 将被设置为 `'DENY'` 。
    - `'sameorigin'` - header 将被设置为 `'SAMEORIGIN'`.

    - 指定 'allow-from' 规则的对象, 如下:
        - `rule` - 其中之一:
            - `'deny'`
            - `'sameorigin'`
            - `'allow-from'`
        - `source` - 当 `rule` 为 `'allow-from'` 这用于形成 header 的其余部分，否则该字段将被忽略。
          如果 `rule` 为 `'allow-from'`，但 `source` 没有设置, 规则将自动设为 `'sameorigin'`.

- `xss` - boolean 控制 Internet Explorer 的 'X-XSS-PROTECTION' header . 默认为
  `true` 与设置 header 为 `'1; mode=block'` 相同.
    - 注意: 此设置可能会在 Internet Explorer 8 以下版本中创建安全漏洞, 以及 IE8 的未修补版本。 查看 [here](https://hackademix.net/2009/11/21/ies-xss-filter-creates-xss-vulnerabilities/)
      和 [here](https://technet.microsoft.com/library/security/ms10-002) 获取更多信息。 如果您积极支持旧版本的IE， 明确将此标志设置为 `false`, 可能是明智之举。

- `noOpen` - boolean 控制 Internet Explorer 的 'X-Download-Options' header,阻止从您的上下文执行。 默认为 `true` 设置 header 为 `'noopen'`.

- `noSniff` - boolean 控制 'X-Content-Type-Options' header. 默认为 `true` 设置 header 为唯一的默认选项, `'nosniff'`.

- `referrer` - 控制 ['Referrer-Policy'](https://www.w3.org/TR/referrer-policy/) header, 它具有以下可能的值。
    - `false` - 'Referrer-Policy' header 不会带着响应发送至客户端. 这是默认值.
    - `''` - 指示客户端 Referrer-Policy 为 [defined elsewhere](https://www.w3.org/TR/referrer-policy/#referrer-policy-empty-string), 例如在 meta 标签中。
    - `'no-referrer'` - 指示客户端在发出请求时从不包含 referrer header 。 
    - `'no-referrer-when-downgrade'` - 指示客户端在从 HTTPS 导航到 HTTP 时从不包含 referrer。
    - `'same-origin'` - 指示客户端仅在当前站点源上包含引用者。
    - `'origin'` - 指示客户端包含引用者但删除路径信息，以便该值仅为当前源。
    - `'strict-origin'` - 与  `'origin'` 相同，但指示客户端在从 HTTPS 转到 HTTP 时省略 referrer header。
    - `'origin-when-cross-origin'` - 指示客户端在 referrer header 中包含同源请求的完整路径，但只包含 URL 的原始组件以用于跨源请求。
    - `'strict-origin-when-cross-origin'` - 与 `'origin-when-cross-origin'` 相同，但是当从 HTTPS 转到 HTTP 时，客户端被指示省略引用者。
    - `'unsafe-url'` - 指示客户端始终包含带有完整 URL 的引用者。

### <a name="route.options.state" /> `route.options.state`

默认值: `{ parse: true, failAction: 'error' }`.

HTTP状态管理（cookie）允许服务器在客户端上存储信息，每次请求都会将信息发送回服务器 (如 [RFC 6265](https://tools.ietf.org/html/rfc6265) 所定义).
`state` 支持一下选项:

- `parse` - 确定是否解析传入的 'Cookie' header 并储存在
  [`request.state`](#request.state) 对象中.

- `failAction` - [`failAction` value](#lifecycle-failAction) 确定如何处理 cookie 解析错误。 默认为 `'error'` (返回 a Bad Request (400) 错误响应).

### <a name="route.options.tags" /> `route.options.tags`

默认值: none.

用于生成文档的路径标记（字符串或数组）。

使用 [`server.options.routes`](#server.options.routes) 设置服务器路由默认值时，此设置不可用。

### <a name="route.options.timeout" /> `route.options.timeout`

默认值: `{ server: false }`.

处理超时。

#### <a name="route.options.timeout.server" /> `route.options.timeout.server`

默认值: `false`.

响应超时（以毫秒为单位）。 设置服务器在放弃并回复 Service Unavailable (503)错误响应之前传入请求所允许的最长时间。

#### <a name="route.options.timeout.socket" /> `route.options.timeout.socket`

默认值: none (使用 node 默认为 2 分钟).

默认情况下，node socket 在 2 分钟后自动超时。 使用此选项可覆盖此行为。 设置为 `false` 禁用 socket 超时。

### <a name="route.options.validate" /> `route.options.validate`

默认值: `{ headers: true, params: true, query: true, payload: true, failAction: 'error' }`.

每个请求组件的请求输入验证。

#### <a name="route.options.validate.errorFields" /> `route.options.validate.errorFields`

默认值: none.

一个可选对象，其错误字段被复制到每个验证错误响应中。

#### <a name="route.options.validate.failAction" /> `route.options.validate.failAction`

默认值: `'error'` (返回 Bad Request (400) 错误).

[`failAction` value](#lifecycle-failAction) 它确定如何处理失败的验证。
当为函数时, `err` 参数包括 `err.output.payload.validation.source` 下的错误验证类型.

#### <a name="route.options.validate.headers" /> `route.options.validate.headers`

默认值: `true` (没有验证).

传入请求 header 的验证规则：

- `true` - 允许任何 header（未执行验证）。

- [**joi**](https://github.com/hapijs/joi) 验证对象。

- 使用签名 `async function(value, options)` 的验证函数，其中：

    - `value` - [`request.headers`](#request.headers) 包含请求 header 对象。
    - `options` - [`options`](#route.options.validate.options).
    - 如果有返回值，该值用作新的 [`request.headers`](#request.headers) 值，原始值存储在 [`request.orig.headers`](#request.orig) 中。
      否则，header 保持不变。 如果抛出错误，则根据 [`failAction`](#route.options.validate.failAction) 处理错误。

请注意，所有 header 字段名称必须为小写，以匹配按节点规范化的 header。

#### <a name="route.options.validate.options" /> `route.options.validate.options`

默认值: none.

传递给 [**joi**](https://github.com/hapijs/joi) 规则或自定义验证方法的选项对象。用于设置全局选项，例如 `stripUnknown` 或 `abortEarly` (可用的完整列表 [here](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback))

如果定义了自定义验证函数（参见上面的 `headers`, `params`, `query`, 或 `payload`），则 `options` 可以将任意对象作为第二个参数传递给该函数。

其他输入值 (i.e. `headers`, `query`, `params`, `payload`, `state`, `app`, and `auth`)
被添加到验证 `context` 下的 `options` 对象中 (参考规则`Joi.ref('$query.key')`)。

请注意，验证按顺序执行 (i.e. headers, params, query, and payload)， 并且如果使用类型转换 (例如 转换一个字符串为数字), 尚未验证的输入值将返回原始值，未经验证和未经修改的值。

如果在服务器  [`routes`](#server.options.routes) 级别和路由级别定义了 `headers`, `params`, `query`, 和 `payload` 的验证规则，单个路由设置会覆盖路由默认值（规则未合并）。

#### <a name="route.options.validate.params" /> `route.options.validate.params`

默认值: `true` (no validation).

传入请求路径参数的验证规则， 将路径与路径匹配后，提取任何参数， 并存储在 [`request.params`](#request.params)， 其中:

- `true` - 允许任何 path 参数 (没有进行验证).

- 一个 [**joi**](https://github.com/hapijs/joi) 验证对象

- 使用签名 `async function(value, options)` 的验证函数，其中：

    - `value` - the [`request.params`](#request.params) object containing the request path
      parameters.
    - `options` - [`options`](#route.options.validate.options).
    - 如果返回一个值， 则该值用作新的 [`request.params`](#request.params)
      值，原始值存储在 [`request.orig.params`](#request.orig). 否则，path 参数保持不变 如果抛出错误，则根据 [`failAction`](#route.options.validate.failAction) 处理错误 。

请注意，未将验证规则与路径路径参数定义匹配将导致所有请求失败。

#### <a name="route.options.validate.payload" /> `route.options.validate.payload`

默认值: `true` (no validation).

传入请求 payload（request body）的验证规则，其中：

- `true` - 允许任何 payload  (没有进行验证).

- `false` - 不允许任意 payload 

- 一个 [**joi**](https://github.com/hapijs/joi) 验证对象
    - 请注意，空的 payload 由 `null`值表示。 如果提供了验证模式并且允许空 payload， 必须通过将规则设置 **joi** 格式允许为 `null` (例如
      `Joi.object({ /* keys here */ }).allow(null)`).

- 使用签名 `async function(value, options)` 的验证函数，其中：

    - `value` - 包含请求 payload 的 [`request.payload`](#request.payload) 对象。
    - `options` - [`options`](#route.options.validate.options).
    - 如果返回一个值， 则该值用作新的 [`request.payload`](#request.payload)
      值，原始值存储在 [`request.orig.payload`](#request.orig). 否则，payload 值保持不变 如果抛出错误，则根据 [`failAction`](#route.options.validate.failAction) 处理错误 。

请注意，验证大型 payload 并修改它们将导致 payload 的内存重复（因为保留了 payload）, 以及验证大量数据的显着性能成本。

#### <a name="route.options.validate.query" /> `route.options.validate.query`

默认值: `true` (no validation).

传入请求 URI 查询组件的验证规则（'?' 和 '#' 之间的 URI 的键值部分）。查询被解析为其各自的键值对，解码，在验证之前存储在 [`request.query`](#request.query)中。其中：

- `true` - 允许的任何 query 参数值 (没有进行验证).

- `false` -不允许 query 参数值。

- a [**joi**](https://github.com/hapijs/joi) validation object.

- 使用签名 `async function(value, options)` 的验证函数，其中：

    - `value` - 包含请求 query 参数的 [`request.query`](#request.query) 对象。
    - `options` - [`options`](#route.options.validate.options).
    - 如果返回一个值， 则该值用作新的 [`request.query`](#request.query) 值，
      原始值存储在 [`request.orig.query`](#request.orig)。 否则，query 参数保持不变。如果抛出错误，则根据 [`failAction`](#route.options.validate.failAction) 处理错误 。
      .

请注意，对查询参数的更改不会反映在 [`request.url`](#request.url) 中。

#### <a name="route.options.validate.state" /> `route.options.validate.state`

默认值: `true` (不验证).

Validation rules for incoming cookies. The `cookie` header is parsed and decoded into the
[`request.state`](#request.state) prior to validation. Where: 

- `true` - 任何 cookie 值都允许 (没有进行验证)。

- `false` - 不允许使用 cookie。

- [**joi**](https://github.com/hapijs/joi) 验证对象

- 使用签名 `async function(value, options)` 的验证函数，其中：

    - `value` - the [`request.state`](#request.state) object containing all parsed cookie values.
    - `options` - [`options`](#route.options.validate.options).
    - 如果返回一个值， 则该值用作新的 [`request.state`](#request.state) 值
      原始值存储在 [`request.orig.state`](#request.orig). 否则，cookie 值保持不变。如果抛出错误，则根据 [`failAction`](#route.options.validate.failAction) 处理错误 。

## Request lifecycle

每个传入请求都会通过请求生命周期。 具体步骤因服务器和路由配置而异, 但执行适用步骤的顺序始终相同。 以下是请求可以执行的完整步骤列表：

- _**onRequest**_
    - 通常当 `onRequest` 扩展存在时被调用。
    - 请求路径和方法可以通过 [`request.setUrl()`](#request.setUrl())
      和 [`request.setMethod()`](#request.setMethod()) 方法修改. 对请求路径或方法的更改将影响请求的路由方式，并可用于重写规则。
    - [`request.route`](#request.route) 是未分配的。
    - [`request.url`](#request.url) 如果传入的请求路径无效，可能是 `null`。
    - [`request.path`](#request.path) 可能是无效的路由
    - 从扩展点返回的任何响应都会忽略 JSONP 配置，因为尚未匹配任何路由且 JSONP 配置不可用。

- _**Route lookup**_
    - 基于 `request.path` 和 `request.method` 的查找。
    - 如果没有找到路由或路径违反 HTTP 规范， 跳到 _**onPreResponse**_。

- _**JSONP processing**_
    - 基于路由的 [`jsonp`](#route.options.jsonp) 选项.
    - 从 [`request.query`](#request.query) 解析 JSON 参数.
    - 当错误时，跳到 _**Response validation**_ 。

- _**Cookies processing**_
    - 基于路由的 [`state`](#route.options.state) 选项.
    - 基于 [`failAction`](#route.options.state.failAction) 的错误处理。

- _**onPreAuth**_
    - 无论是否执行认证，都会调用。

- _**Authentication**_
    - 基于路由的 [`auth`](#route.options.auth) 选项.

- _**Payload processing**_
    - 基于路由的 [`payload`](#route.options.payload) 选项.
    - 基于 [`failAction`](#route.options.payload.failAction) 的错误处理。

- _**Payload authentication**_
    - 基于路由的 [`auth`](#route.options.auth) 选项.

- _**onCredentials**_
    - 仅在执行身份验证时调用。

- _**Authorization**_
    - 基于路由的 authentication [`access`](#route.options.auth.access) 选项.

- _**onPostAuth**_
    - 无论是否执行认证，都会调用。

- _**Headers validation**_
    - 基于路由的 [`validate.headers`](#route.options.validate.headers) 选项.
    - 基于 [`failAction`](#route.options.validate.failAction) 的错误处理。

- _**Path parameters validation**_
    - 基于路由的 [`validate.params`](#route.options.validate.params) 选项.
    - 基于 [`failAction`](#route.options.validate.failAction) 的错误处理。

- _**JSONP cleanup**_
    - 基于路由的 [`jsonp`](#route.options.jsonp) 选项.
    - 从 [`request.query`](#request.query) 中删除 JSON 参数.

- _**Query validation**_
    - 基于路由的 [`validate.query`](#route.options.validate.query) 选项.
    - 基于 [`failAction`](#route.options.validate.failAction) 的错误处理。

- _**Payload validation**_
    - 基于路由的 [`validate.payload`](#route.options.validate.payload) 选项.
    - 基于 [`failAction`](#route.options.validate.failAction) 的错误处理。

- _**State validation**_
    - 基于路由的 [`validate.state`](#route.options.validate.state) 选项.
    - 基于 [`failAction`](#route.options.validate.failAction) 的错误处理。

- _**onPreHandler**_

- _**Pre-handler methods**_
    - 基于路由 [`pre`](#route.options.pre) 选项.
    - 基于每个预处理程序方法的 `failAction` 设置的错误处理。

- _**Route handler**_
    - 执行路由 [`handler`](#route.options.handler).

- _**onPostHandler**_
    - 可以修改包含在 [`request.response`](#request.response) 中的响应 (但是不能指定一个新值)。返回不同的响应类型 (例如, 用 HTML 响应替换错误), 返回一个新的响应值。

- _**Response validation**_
    - 基于 [`failAction`](#route.options.response.failAction) 的错误处理。

- _**onPreResponse**_
    - 通常被调用, 触发请求终止。
    - 可以修改包含在 [`request.response`](#request.response) 中的响应 (但是不能指定一个新值). 返回不同的响应类型 (例如, 用 HTML 响应替换错误), 返回一个新的响应值。 请注意，生成的任何错误都不会传递回 _**onPreResponse**_ 以防止无限循环。

- _**Response transmission**_
    - 可能在 `'error'` 频道触发 [`'request'` event](#server.events.request) 。

- _**Finalize request**_
    - 触发 `'response'` 事件.

### Lifecycle methods

生命周期方法是框架和应用程序之间的接口。 许多请求生命周期步骤: [extensions](#server.ext()), [authentication](#authentication-scheme),
[handlers](#route.options.handler), [pre-handler methods](#route.options.pre), 和
[`failAction` function values](#lifecycle-failAction) 是由开发人员提供并由框架执行的生命周期方法。

每个生命周期方法都是一个带有签名 `await function(request, h, [err])` 函数，其中:

- `request` - [request object](#request).
- `h` - [response toolkit](#response-toolkit) 处理程序必须调用以设置响应并将控制权返回给框架。.
- `err` - 仅当该方法用作 [`failAction` value](#lifecycle-failAction)是才可用的错误对象。

每个生命周期方法都必须返回一个值或一个解析为值的promise。如果生命周期方法返回没有值或解析为 `undefined` 值， an Internal Server Error (500) 错误

返回值必须是以下之一

- 基本值:
    - `null`
    - string
    - number
    - boolean
- `Buffer` 对象
- `Error` 对象
    - 基本的 `Error`.
    - [`Boom`](https://github.com/hapijs/boom) 对象.
- `Stream` 对象
    - 必须与 "streams2" API兼容，而不是在 `objectMode` 。
    - 如果流对象具有  `statusCode` 属性， 该状态代码将用作基于 [`passThrough`](#response.settings.passThrough) 选项的默认响应代码。
    - 如果流对象具有 `headers` 属性，, 头部将根据 [`passThrough`](#response.settings.passThrough) 选项包含在响应中。
    - 如果流对象具有函数属性 `setCompressor(compressor)` 并且响应通过压缩器，压缩器流的引用将通过此方法传递给响应流。
- 任意对象或数组
    - 不得包含循环引用。
- 工具包签名：
    - [`h.abandon`](#h.abandon) - 中止处理请求。
    - [`h.close`](#h.close) -中止处理请求并调用 `end()` 以确保响应被关闭。 
    - [`h.continue`](#h.continue) - 继续处理请求生命周期而不更改响应。
- 工具包方法响应：
    - [`h.response()`](#h.response()) - 通过 [response object](#response-object) 包装一个简单的响应.
    - [`h.redirect()`](#h.redirect()) - 使用重定向指令包装一个简单的响应。
    - [`h.authenticated()`](#h.authenticated()) - 表示请求已成功验证
      (auth scheme only).
    - [`h.unauthenticated()`](#h.unauthenticated()) - 表示请求无法进行身份验证
      (auth scheme only).
- 一个 promise 对象，可以解析为上述任何值

生命周期方法抛出的任何错误都将用作响应对象。 虽然可以返回错误和有效值，建议抛出错误。 抛出非错误值 Bad Implementation (500) 的错误响应。

```js
const handler = function (request, h) {

    if (request.query.forbidden) {
        throw Boom.badRequest();
    }

    return 'success';
};
```

如果路由使用 [`bind`](#route.options.bind) 选项或者 [`server.bind()`](#server.bind()) 被调用, 生命周期方法将通过 `this` 绑定到提供的上下文，也可以通过 [`h.context`](#h.context) 访问。

#### Lifecycle workflow

每个生命周期步骤之间的流程取决于每个生命周期方法返回的值，如下所示:

- an error:
    - 生命周期跳到 _**Response validation**_ 阶段.
    - 如果被 _**onRequest**_ 阶段返回， 将跳到 _**onPreResponse**_ 阶段.
    - 如果 _**Response validation**_ 阶段返回， 将跳到 _**onPreResponse**_ 阶段.
    - 如果 _**onPreResponse**_ 阶段返回， 将跳到 _**Response transmission**_ 阶段.

- 一个终止信号 ([`h.abandon`](#h.abandon) 或 [`h.close`](#h.close)):
    - 跳到 _**Finalize request**_ 阶段.

- 一个 [`h.continue`](#h.continue) 信号:
    - 继续处理请求生命周期而不更改请求响应。
    - 不能被 [`authenticate()`](#authentication-scheme) 方法使用

- [takeover response](#takeover-response):
    - 使用提供的值覆盖请求响应，并跳到
      _**Response validation**_ 阶段。
    - 如果被 _**Response validation**_ 阶段返回， 将跳到 _**onPreResponse**_ 阶段。
    - 如果被 _**onPreResponse**_ 阶段返回，将跳到 _**Response transmission**_ 阶段。

- 任何其他的响应:
    - 使用提供的值覆盖请求响应，并继续处理请求生命周期。
    - 无法从 _**Pre-handler methods** 阶段之前的任何步骤返回。

[`authenticate()`](#authentication-scheme) 方法可以访问两个额外的返回值:
    - [`h.authenticated()`](#h.authenticated()) - 表示请求已成功验证。
    - [`h.unauthenticated()`](#h.unauthenticated()) - 表示请求验证失败。

请注意，在 [pre-handler method](#route.options.pre) 中使用时，这些规则的应用有所不同。

#### Takeover response

接替响应 [`response object`](#response-object) 是 [`response.takeover()`](#response.takever()) 被调用签名 [lifecycle method](#lifecycle-methods) 的返回值。应设置为响应并跳过以立即验证和传输值， 绕过其他生命周期步骤。

#### <a name="lifecycle-failAction" /> `failAction` 配置

各种配置选项允许定义错误的处理方式。 例如，当收到无效的有效负载或格式错误的 cookie 时，而不是返回错误，框架可以配置为执行另一个操作。 当支持 `failAction` 选项时， 支持以下值:

- `'error'` - 将错误对象作为响应返回。
- `'log'` - 报告错误但继续处理请求。
- `'ignore'` - 不采取任何行动并继续处理请求。

- [lifecycle method](#lifecycle-methods) 带有签名函数 `async function(request, h, err)`:
    - `request` - [request object](#request).
    - `h` - [response toolkit](#response-toolkit).
    - `err` - 错误对象。

#### Errors

**hapi** 使用 [**boom**](https://github.com/hapijs/boom) 错误第三方库去显示内部的错误生成. **boom** 提供了一个表达式接口来返回 HTTP 错误. [lifecycle method](#lifecycle-methods)抛出的任何错误都将转换为 **boom** 对象，如果错误不是 **boom** 对象， 默认为 `500` 状态码。

当错误发送回客户端时，response 包含一个带有 `statusCode`, `error`, 和 `message` 键的 JSON 对象。

```js
const Hapi = require('hapi');
const Boom = require('boom');

const server = Hapi.server();

server.route({
    method: 'GET',
    path: '/badRequest',
    handler: function (request, h) {

        throw Boom.badRequest('Unsupported parameter');     // 400
    }
});

server.route({
    method: 'GET',
    path: '/internal',
    handler: function (request, h) {

        throw new Error('unexpect error');                  // 500
    }
});
```

##### Error transformation

可以通过更改其 `output` 内容来自定义错误。**boom** 错误对象包含以下属性：

- `isBoom` - 如果是 `true`, 表示【indicates】这是一个 `Boom` 对象实例。

- `message` - 错误信息.

- `output` - 格式化的 response. 可以在对象构造后直接操作返回自定义错误响应. 允许的根节点:

    - `statusCode` - HTTP 状态码 (typically 4xx or 5xx).

    - `headers` - 包含任何 HTTP 头的对象，其中每个键都是 header 名称，值是 header 内容。

    - `payload` - 用作响应有效负载的格式化对象 (字符串化). 可以直接操作，但如果调用 `reformat()`， 任何更改都将丢失。 允许的任何内容，默认情况下包括以下内容：

        - `statusCode` - HTTP 状态码, 派生于 `error.output.statusCode`.

        - `error` - 派生自 statusCode` 的错误信息 (例如 'Bad Request', 'Internal Server Error')。

        - `message` - 派生自【derived from】 `error.message` 的错误信息。

- 继承 `Error` 属性.

它还支持以下方法:

- `reformat()` - 使用其他对象属性重新构建 `error.output`.

```js
const Boom = require('boom');

const handler = function (request, h) {

    const error = Boom.badRequest('Cannot feed after midnight');
    error.output.statusCode = 499;    // Assign a custom error code
    error.reformat();
    error.output.payload.custom = 'abc_123'; // Add custom key
    throw error;
});
```

当需要不同的错误表示时， 例如 HTML 页面或不同的 payload 格式, `'onPreResponse'` 扩展点可以用于识别错误并且用不同的 response 对象替换它们, 就像在这个例子中使用 [Vision's](https://github.com/hapijs/vision)
`.view()` [response toolkit](#response-toolkit) 属性.

```js
const Hapi = require('hapi');
const Vision = require('vision');

const server = Hapi.server({ port: 80 });
server.register(Vision, (err) => {
    server.views({
        engines: {
            html: require('handlebars')
        }
    });
});

const preResponse = function (request, h) {

    const response = request.response;
    if (!response.isBoom) {
        return h.continue;
    }

    // Replace error with friendly HTML

      const error = response;
      const ctx = {
          message: (error.output.statusCode === 404 ? 'page not found' : 'something went wrong')
      };

      return h.view('error', ctx).code(error.output.statusCode);
};

server.ext('onPreResponse', preResponse);
```

### Response Toolkit

访问： 只读。

response toolkit 是传递给每个
[lifecycle method](#lifecycle-methods) 的属性和工具类的集合。 它有点难以定义，因为它提供了用于操作响应以及其他信息的两个实用程序。 由于工具包是作为函数参数传递的, 
开发人员可以随意命名. 出于本文档的目的，使用 `h` 表示法. 它以 RethinkDB `r` 方法的命名精神, `h` 代表
**h**api.

#### Toolkit properties

##### <a name="h.abandon" /> `h.abandon`

访问： 只读。

response 标识. 当由生命周期方法返回时, 请求生命周期跳转到最终化步骤，而无需与节点响应流进一步交互。 是由开发人员直接通过 [`request.raw.res`](#request.raw) 编写和结束相应的.

##### <a name="h.close" /> `h.close`

访问： 只读。

response 标识。 当由生命周期方法返回时, 在调用 `request.raw.res.end())` 关闭节点响应流之后，请求生命周期跳到最终步骤。

##### <a name="h.context" /> `h.context`

访问： 读 / 写 (如果对象被修改，将影响共享上下文).

response 标识。 通过设置的路由[`bind`](#route.options.bind) 选项或 [`server.bind()`](#server.bind())，提供访问路由和服务器上下文。

##### <a name="h.continue" /> `h.continue`

访问： 只读。

response 标识。 当生命周期方法返回时，请求生命周期将继续，而不会更改响应。

##### <a name="h.realm" /> `h.realm`

访问： 只读。

与匹配路由关联的 [server realm](#server.realm)  默认为 _**onRequest**_ 阶段的根服务器 realm.

##### <a name="h.request" /> `h.request`

访问：只读和公共请求接口。

[request] 对象。  `request` 生命周期函数参数副本用于
[toolkit decorations](#server.decorate()) 访问当前的请求

#### <a name="h.authenticated()" /> `h.authenticated(data)`

用于 [authentication] 函数传回有效凭证，其中:

- `data` - 一个对象:

    - `credentials` - (required) 表示已验证实体对象
    - `artifacts` - (可选) 认证 artifacts 对象确定认证结构

返回值: 一个内部的认证对象

#### <a name="h.entity()" /> `h.entity(options)`

设置响应的 'ETag' and 'Last-Modified' 头，并检查任何条件请求头以确定是否符合 HTTP 304 (Not Modified)。如果实体值与请求条件匹配， `h.entity()` 返回生命周期方法的响应对象，以返回其值，该值将设置 304 响应。 否则，它设置提供的实体头并返回
 `undefined`. 方法参数如下：

- `options` - 一个必选的配置:
    - `etag` - ETag 字符串. 如果 `modified` 没有指定，那么为必须值. 默认为 no header.
    - `modified` - Last-Modified 头部值. 如果 `etag` 没有指定，那么为必须值。 默认为
      no header.
    - `vary` - 与 [`response.etag()`](#response.etag()) 选项相同. 默认为 `true`.

返回值:
    - [response object](#response-object) 如果响应没有发生了变化。
    - `undefined` 如果响应发生了变化。

如果返回 `undefined`， 开发人员必须返回有效的生命周期方法值。 如果返回一个响应， 它应该被用作返回值 (但可以使用响应方法进行自定义).

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.route({
    method: 'GET',
    path: '/',
    config: {
        cache: { expiresIn: 5000 },
        handler: function (request, h) {

            const response = h.entity({ etag: 'abc' });
            if (response) {
                response.header('X', 'y');
                return response;
            }

            return 'ok';
        }
    }
});
```

#### <a name="h.redirect()" /> `h.redirect(uri)`

将客户端重定向到指定的 URI。 与调用 `h.response().redirect(uri)` 相同.

返回一个 [response object](#response-object).

```js
const handler = function (request, h) {

    return h.redirect('http://example.com');
};
```

#### <a name="h.response()" /> `h.response([value])`

包含提供的值并且返回一个 `response`](#response-object) 对象，允许自定义响应 (例如 设置 HTTP 状态码, 自定义 headers, 等等.), 其中:

- `value` - (可选) 返回值. 默认为 `null`.

返回 [response object](#response-object).

```js
// Detailed notation

const handler = function (request, h) {

    const response = h.response('success');
    response.type('text/plain');
    response.header('X-Custom', 'some-value');
    return response;
};

// Chained notation

const handler = function (request, h) {

    return h.response('success')
        .type('text/plain')
        .header('X-Custom', 'some-value');
};
```

#### <a name="h.state()" /> `h.state(name, value, [options])`

设置响应 cookie， 使用 [`response.state()`](#response.state()) 相同的参数。

返回值: none.

```js
const ext = function (request, h) {

    h.state('cookie-name', 'value');
    return h.continue;
};
```

#### <a name="h.unauthenticated()" /> `h.unauthenticated(error, [data])`

 [authentication] 方法用于指示身份认证失败，并将收到的凭证传回：

- `error` - (必选) 认证错误.
- `data` - (可选) 一个对象:
    - `credentials` - (必选) 表示已验证实体的对象。
    - `artifacts` - (可选) 认证 artifacts 对象确定认证结构

该方法用于传递身份验证错误和凭据。例如，如果请求包括过期的凭证，它允许该方法传回用户信息 (结合 `'try'` 认证 [`mode`](#route.options.auth.mode) )作为错误定制

如果没有传递认证，抛出的错误或将其传递给 `h.unauthenticated()` 方法没有区别，但它可能仍然有助于代码清晰度。

#### <a name="h.unstate()" /> `h.unstate(name, [options])`

清除响应 cookie，使用 [`response.unstate()`](#response.unstate()) 相同的参数。

```js
const ext = function (request, h) {

    h.unstate('cookie-name');
    return h.continue;
};
```

### Response object

响应对象包含请求响应值以及各种 HTTP 头 和 标识
当 [lifecycle method](#lifecycle-methods) 返回一个值时, 该值将包含在响应对象中，以及一些默认标识（例如 `200` 状态码）。提供了 [`h.response()`](#h.response()) 方法，为了在返回之前自定义响应,。

#### Response properties

##### <a name="response.app" /> `response.app`

访问： 读 / 写.

默认值: `{}`.

应用程序特定的状态. 提供存储应用程序数据的安全位置，而不会与框架发生潜在【potential】冲突. 不应该使用 [plugins](#plugins)，应使用 [`plugins[name]`](#response.plugins).

##### <a name="response.events" /> `response.events`

访问： 只读 并且是公共的 **podium** 接口.

`response.events` 对象支持以下对象:

- `'peek'` - 为回写客户端连接的每个数据块触发. 事件签名为 `function(chunk, encoding)`.

- `'finish'` - 当响应完成写入单在客户端连接结束之前触发. 事件签名为 `function ()`.

```js
const Crypto = require('crypto');
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const preResponse = function (request, h) {

    const response = request.response;
    if (response.isBoom) {
        return null;
    }

    const hash = Crypto.createHash('sha1');
    response.events.on('peek', (chunk) => {

        hash.update(chunk);
    });

    response.events.once('finish', () => {

        console.log(hash.digest('hex'));
    });

    return h.continue;
};

server.ext('onPreResponse', preResponse);
```

##### <a name="response.headers" /> `response.headers`

访问： 只读。

默认值: `{}`.

包含响应头的对象，其中每个键是 header 字段名称，值是字符串的 header 值或字符串数组

请注意，这是一个不完整的 header 列表，要包含在响应中。 一旦响应准备好传输，将添加其他 header。

##### <a name="response.plugins" /> `response.plugins`

访问： 读 / 写.

默认值: `{}`.

插件特定的状态. 提供存储和传递请求级插件数据的位置。 `plugins` 是一个对象，其中每个键是一个插件名称，值是状态。

##### <a name="response.settings" /> `response.settings`

访问： 只读。

包含响应处理标志的对象。

###### <a name="response.settings.passThrough" /> `response.settings.passThrough`

访问： 只读。

默认值: `true`.

如果为 `true` 并且 [`source`](#response.source) 为一个 `Stream`, 将流对象的 `statusCode` and `headers` 属性复制到出站响应

###### <a name="response.settings.stringify" /> `response.settings.stringify`

访问： 只读。

默认值: `null` (use route defaults).

当 [`source`](#response.source) 值需要字符串化时，覆盖路由 [`json`](#route.options.json) 选项使用。

###### <a name="response.settings.ttl" /> `response.settings.ttl`

访问： 只读。

默认值: `null` (use route defaults).

如果设置, 覆盖路由的 [`cache`](#route.options.cache) 具有到期值（以毫秒为单位）。

###### <a name="response.settings.varyEtag" /> `response.settings.varyEtag`

默认值: `false`.

如果为 `true`, 当HTTP 'Vary' 头出现时，后缀将在传输时自动添加到 'ETag' 标题中（由 `'-'` 字符分隔）。

##### <a name="response.source" /> `response.source`

访问： 只读。

[lifecycle method](#lifecycle-methods) 返回的原始值.

##### <a name="response.statusCode" /> `response.statusCode`

访问： 只读。

默认值: `200`.

HTTP 相应状态码。

##### <a name="response.variety" /> `response.variety`

访问： 只读。

一个字符串，指示[`source`](#response.source) 类型具有以下可用值：

- `'plain'` - 一个简单的相应，如 字符串, 数字, `null`, 或简单对象.
- `'buffer'` - a `Buffer`.
- `'stream'` - a `Stream`.

#### <a name="response.bytes()" /> `response.bytes(length)`

HTTP 'Content-Length' 头 (避免分块传输编码) :

- `length` - header 值。 必须与实际 payload 大小匹配。

返回值: 当前相应对象.

#### <a name="response.charset()" /> `response.charset(charset)`

设置 'Content-Type' HTTP header 'charset' 属性:

- `charset` -charset 属性值

返回值: 当前相应对象.

#### <a name="response.code()" /> `response.code(statusCode)`

设置 HTTP 状态码:

- `statusCode` - HTTP 状态码 (例如 200).

返回值: 当前相应对象。

#### <a name="response.message()" /> `response.message(httpMessage)`

设置 HTTP 状态信息:

- `httpMessage` - the HTTP status message (例如 'Ok' for status code 200).

返回值: 当前相应对象。

#### <a name="response.created()" /> `response.created(uri)`

将 HTTP 状态代码设置为Created（201）和 HTTP 'Location' 头，其中：

- `uri` - 用作 'Location' 值的绝对或相对 URI。

返回值: 当前相应对象。

#### <a name="response.encoding()" /> `response.encoding(encoding)`

将用于串行数据的字符串编码方案设置为 HTTP 有效负载，其中：

- `encoding` - 编码属性值 (see [node Buffer encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)).

返回值: 当前相应对象。

#### <a name="response.etag()" /> `response.etag(tag, options)`

设置标识 [entity tag](https://tools.ietf.org/html/rfc7232#section-2.3) :

- `tag` - 没有双引号的实体标记字符串。

- `options` - (可选) 设置如下:

    - `weak` - 如果为 `true`, 标识将以 `'W/'` 弱标识符为前缀. 为了确定 304 响应状态，弱标签将无法匹配相同的标签。 默认为 `false`.

    - `vary` - 如果为 `true` 并且内容编码被设置或应用于相应 (例如 'gzip' or
      'deflate'), 编码名称将在传输时自动添加到标记中
      (以`'-'` 分割的字符串). 忽略 `weak` 为 `true`. 默认为 to `true`.

返回值: 当前相应对象。

#### <a name="response.header()" /> `response.header(name, value, options)`

设置 HTTP header:

- `name` - header 名称.

- `value` - header 值.

- `options` - (可选) 对象:

    - `append` - 如果 `true`, 使用 `separator` 将值附加到任何现有的 header 值中.
      默认为 `false`.

    - `separator` - 附加到现有值时用作分隔符的字符串。 默认为 `','`.

    - `override` - 如果为 `false`, 如果存在现有值，则不设置 header 值。 默认为 `true`.

    - `duplicate` - 如果 `false`, 如果已包含提供的值，则不会修改 header值. 当 `append` 为 `false` 或 如果 `name` 为 `'set-cookie'` 不会被添加.
      默认为 `true`.

返回值: 当前相应对象。

#### <a name="response.location()" /> `response.location(uri)`

设置 HTTP 'Location' header:

- `uri` - 用作 'Location' 值的绝对或相对 URI。

返回值: 当前相应对象。

#### <a name="response.redirect()" /> `response.redirect(uri)`

设置 HTTP 重定向响应（302）并使用其他方法修饰响应：

- `uri` - 用于将客户端重定向到另一个资源的绝对或相对 URI。

返回值: 当前相应对象。

使用 [`response.temporary()`](#response.temporary()) 来装饰响应对象,
[`response.permanent()`](#response.permanent()), 和 [`response.rewritable()`](#response.rewritable())
方法 轻松更改默认重定向代码 (302).

|                |  Permanent | Temporary |
| -------------- | ---------- | --------- |
| Rewritable     | 301        | 302       |
| Non-rewritable | 308        | 307       |

#### <a name="response.replacer()" /> `response.replacer(method)`

设置 `JSON.stringify()` `replacer` 参数:

- `method` - replacer 函数或数组. 默认为 none.

返回值: 当前相应对象。

#### <a name="response.spaces()" /> `response.spaces(count)`

设置 `JSON.stringify()` `space` 参数:

- `count` - 缩进嵌套对象键的空格数。 默认为 没有缩进.

返回值: 当前相应对象。

#### <a name="response.state()" /> `response.state(name, value, [options])`

设置 HTTP cookie:

- `name` - cookie 名称.

- `value` - cookie 值. 如果没有定义 `options.encoding` , 必须是字符串类型. 参阅
  [`server.state()`](#server.state()) 以获取支持的 `encoding` 的值.

- `options` - (可选) 可配置的. 如果状态之前已使用 [`server.state()`](#server.state()) 在服务器上注册,  `options` 中的指定键将与默认服务器定义合并。

返回值: 当前相应对象。

#### <a name="response.suffix()" /> `response.suffix(suffix)`

当相应通过 `JSON.stringify()` 处理时设置字符串前缀:

- `suffix` - 字符串前缀.

返回值: 当前相应对象。

#### <a name="response.ttl()" /> `response.ttl(msec)`

覆盖此响应实例的默认路由缓存过期规则:

- `msec` - 生存时间值，以毫秒为单位.

返回值: 当前相应对象。

#### <a name="response.type()" /> `response.type(mimeType)`

设置 HTTP 的 'Content-Type' header:

- `value` - is the mime type.

返回值: 当前相应对象。

应该仅用于覆盖每种响应类型的内置默认值。

#### <a name="response.unstate()" /> `response.unstate(name, [options])`

通过设置过期值清除 HTTP cookie:
- `name` - cookie 名称.
- `options` - (可选) 过期 cookie 的配置. 如果状态之前已使用 [`server.state()`](#serverstatename-options) 在服务器上注册, `options` 中的指定键将与默认服务器定义合并。

返回值: 当前相应对象。

#### <a name="response.vary()" /> `response.vary(header)`

通过 HTTP 'Vary' 头将提供的标头添加到影响响应生成的输入列表中:

- `header` - HTTP 请求头名称.

返回值: 当前相应对象。

#### <a name="response.takeover()" /> `response.takeover()`

标记相应对象为一个 [takeover response](#takeover-response)。

返回值: 当前相应对象。

#### <a name="response.temporary()" /> `response.temporary(isTemporary)`

设置状态码为 `302` 或 `307` (基于 [`response.rewritable()`](#response.rewriteable())
设置) :

- `isTemporary` - 如果为 `false`, 将状态设置为永久. 默认为 `true`.

返回值: 当前相应对象。

仅在调用 [`response.redirect()`](#response.redirect()) 方法后才可用.

#### <a name="response.permanent()" /> `response.permanent(isPermanent)`

设置状态码为 `301` 或 `308` (基于[`response.rewritable()`](#response.rewritable()) 设置) :

- `isPermanent` - 如果 `false`, 将状态设置为临时. 默认为 `true`.

返回值: 当前相应对象。

仅在调用 [`response.redirect()`](#response.redirect()) 方法后才可用.

#### <a name="response.rewritable()" /> `response.rewritable(isRewritable)`

设置状态码为 `301`/`302` 为可重写 (允许将请求方法从 'POST' 更改为 'GET') 或 `307`/`308` 为不可重写 (不允许将请求方法从 'POST' 更改为 'GET'). 精确代码基于 [`response.temporary()`](#response.temporary()) or
[`response.permanent()`](#response.permanent()) 设置. 参数:

- `isRewritable` - 如果 `false`, 设置为不可重写. 默认为 `true`.

返回值: 当前相应对象。

仅在调用 [`response.redirect()`](#response.redirect()) 方法后才可用.

## 请求

在内部为每个传入请求创建请求对象。它与从节点HTTP服务器回调接收的对象不同 (可以通过 [`request.raw.req`](#request.raw))。请求属性在 [request lifecycle](#request-lifecycle) 中发生改变。

### 请求属性

#### <a name="request.app" /> `request.app`

访问： 读 / 写.

应用程序特定的状态. 提供存储应用程序数据的安全位置，而不会与框架发生潜在冲突。 不应该被 [plugins](#plugins) 使用， 应该使用 `plugins[name]`.

#### <a name="request.auth" /> `request.auth`

访问： 只读。

认证信息:

- `artifacts` - 从身份验证策略接收的对象，用于与身份验证相关的操作。

- `credentials` - 在身份验证过程中收到的 `credential` 对象。 对象的存在并不意味着成功的身份验证。

- `error` - 模式设置为`'try'` 失败时认证的错误.

- `isAuthenticated` -  如果请求已成功验证设置为 `true`, 否则为 `false`.

- `isAuthorized` - `true` 是请求已成功授权对路由认证 [`access`](#route.options.auth.access) 配置. 如果路由未定义访问规则或请求授权失败, 设置为 `false`.

- `isInjected` - `true` 是如果请求已经通过 [`server.inject()`](#server.inject()) `auth` 选项被认证， 否则为 `undefined`.

- `mode` - 路由认证的模式.

- `strategy` - 所用策略的名称。

#### <a name="request.events" /> `request.events`

访问： 只读并且是公共 **podium** 接口.

`request.events` 支持一下事件:

- `'peek'` - 为从客户端连接读取的每个有效负载数据块触发。 事件方法签名是 `function(chunk, encoding)`.

- `'finish'` - 请求有效负责完成读取时发出. 事件方法签名是
  `function ()`.

- `'disconnect'` - 当请求错误或意外终止时触发.

```js
const Crypto = require('crypto');
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const onRequest = function (request, h) {

    const hash = Crypto.createHash('sha1');
    request.events.on('peek', (chunk) => {

        hash.update(chunk);
    });

    request.events.once('finish', () => {

        console.log(hash.digest('hex'));
    });

    request.events.once('disconnect', () => {

        console.error('request aborted');
    });

    return h.continue;
};

server.ext('onRequest', onRequest);
```

#### <a name="request.headers" /> `request.headers`

访问： 只读。

原始请求头 (参考 `request.raw.req.headers`).

#### <a name="request.info" /> `request.info`

访问： 只读。

请求信息:

- `acceptEncoding` - 请求的编码

- `completed` - 请求处理完成的时间戳 (`0` 表示还在处理中).

- `cors` - 请求的 CORS 信息 (尽在 `'onRequest'` 扩展之后可用，因为每个路由配置了 CORS, 并且在请求生命周期中这个点上没有做出路由决策）, 如下:
    - `isOriginMatch` - 如果果请求 'Origin' 头与匹配的 CORS 限制【restrictions】匹配则为 `true`。 如果未找到 'Origin' 头或者不匹配，则设置为 `false`

- `host` -  HTTP 'Host' 头 (例如 'example.com:8080').

- `hostname` - 'Host' 头部的 hostname 部分 (例如 'example.com').

- `id` - 唯一请求标识符 (using the format '{now}:{connection.info.id}:{5 digits counter}').

- `received` - 请求接收时间戳.

- `referrer` - HTTP 'Referrer' (or 'Referer') 头.

- `remoteAddress` - 远程客户端 IP 地址.

- `remotePort` - 远程客户端端口.

- `responded` - 请求的相应时间 (`0` 标识尚未响应或者 `completed` 被设置但响应失败).

请注意， `request.info` 对象不能被修改

#### <a name="request.logs" /> `request.logs`

访问： 只读。

一个数组包含日志请求事件。

注意如果路由 [`log.collect`](#route.options.log) 被设置为 `false`, 数组将为空。

#### <a name="request.method" /> `request.method`

访问： 只读。

小写的请求方法 (例如 `'get'`, `'post'`).

#### <a name="request.mime" /> `request.mime`

访问： 只读。

解析后的 content-type 头. 仅在启用有效负载解析且未发生错误时可用

#### <a name="request.orig" /> `request.orig`

访问： 只读。

在进行任何验证修改之前, 包含 `params`, `query`, `payload` 和 `state` 值的对象。仅在执行输入验证时设置。

#### <a name="request.params" /> `request.params`

访问： 只读。

一个对象，其中每个键都是具有匹配值的路径参数名称，如 [Path parameters](#path-parameters) 中所述.

#### <a name="request.paramsArray" /> `request.paramsArray`

访问： 只读。

一个数组，包含它们在路径中出现的顺序的所有路径 `params` 的值。

#### <a name="request.path" /> `request.path`

访问： 只读。

请求 URI 的 [pathname](https://nodejs.org/api/url.html#url_urlobject_pathname) 组件.

#### <a name="request.payload" /> `request.payload`

访问： 只读。

请求 payload 基于路由 `payload.output` 和 `payload.parse` 的设置.

#### <a name="request.plugins" /> `request.plugins`3
123

访问： 读 / 写.

插件特定的状态。 提供存储和传递请求级插件数据的位置。`plugins` 是一个对象，其中每个键都是一个插件名称，值是状态。

#### <a name="request.pre" /> `request.pre`

访问： 只读。

一个对象，其中每个键是由 [route pre-handler methods](#route.options.pre) 函数指定的名称。值会被作为原始值提供给后续函数作为参数。对于包装响应对象，使用 `responses`。

#### <a name="request.response" /> `request.response`

访问： 读 / 写 (see limitations below).

对象可以被修改，但不能为其分配另一个对象

设置时的响应对象。 对象可以被修改，但不能为其分配另一个对象。从 [extension point](#server.ext()) 中替换另一个响应，返回一个新的相应值。当没有设置响应时，会为 `null`（例如，当客户端断开连接时请求过早终止）。

#### <a name="request.preResponses" /> `request.preResponses`

访问： 只读。

与 `pre` 相同，但表示为 pre 方法创建的响应对象。

#### <a name="request.query" /> `request.query`

访问： 只读。

一个对象，其中每个键是查询参数名称，每个匹配值是参数值，如果参数重复，则为值数组。 可以通过
[request.setUrl](#request.setUrl()) 间接【indirectly】修改.

#### <a name="request.raw" /> `request.raw`

访问： 只读。

包含Node HTTP服务器对象的对象。 **不建议与这些原始对象直接交互**

- `req` - node 请求对象.
- `res` - node 相应对象.

#### <a name="request.route" /> `request.route`

访问： 只读。

请求路由信息, 如下:
- `method` - 路由的 HTTP 请求方法.
- `path` - 路由地址.
- `vhost` - 如果配置.
- `realm` - 与路由相关的 [active realm](#server.realm).
- `settings` - [route options](#route-options) 对象应用的默认设置
- `fingerprint` - 路由内部规范化字符串，表示规范化路径。

#### <a name="request.server" /> `request.server`

访问： 只读并且为公有服务器接口

服务器对象.

#### <a name="request.state" /> `request.state`

访问： 只读。

包含已解析的HTTP状态信息（cookie）的对象，其中每个键是cookie名称和值，是使用任何已注册的cookie定义处理后的匹配cookie内容。

#### <a name="request.url" /> `request.url`

访问： 只读。

解析后的请求 URI.

### <a name="request.generateResponse()" /> `request.generateResponse(source, [options])`

Returns a [`response`](#response-object) which you can pass into the [reply interface](#response-toolkit) where:
- `source` - the value to set as the source of the [reply interface](#response-toolkit), optional.
- `options` - optional object with the following optioal properties:
    - `variety` - a sting name of the response type (例如 `'file'`).
    - `prepare` - a function with the signature `async function(response)` used to prepare the
      response after it is returned by a [lifecycle method](#lifecycle-methods) such as setting a
      file descriptor, where:
        - `response` - the response object being prepared.
        - must return the prepared response object (new object or `response`).
        - may throw an error which is used as the prepared response.
    - `marshal` - a function with the signature `async function(response)` used to prepare the
      response for transmission to the client before it is sent, where:
        - `response` - the response object being marshaled.
        - must return the prepared value (not as response object) which can be any value accepted
          by the [`h.response()`](#h.response()) `value` argument.
        - may throw an error which is used as the marshaled value.
    - `close` - a function with the signature `function(response)` used to close the resources
      opened by the response object (例如 file handlers), where:
        - `response` - the response object being marshaled.
        - should not throw errors (which are logged but otherwise ignored).

### <a name="request.active()" /> `request.active()`

当请求处于活动状态时返回 `true` 并且当请求提前终止或完成其生命周期时，处理应继续并返回 `false`。 当请求处理是资源密集型操作时很有用，如果请求不再有效（例如客户端断开连接或提前中止），则应提前终止。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

server.route({
    method: 'POST',
    path: '/worker',
    handler: function (request, h) {

        // Do some work...

        // Check if request is still active
        if (!request.active()) {
            return h.close;
        }

        // Do some more work...

        return null;
    }
});
```

### <a name="request.log()" /> `request.log(tags, [data])`

记录特定于请求的事件. 当被调用时，服务器在被 `'app'` 使用的其他监听器或 [plugins](#plugins) 上触发 [`'request'` event](#server.events.request)。 参数如下:

- `tags` - 用于标识事件的字符串或字符串数组 (例如. `['error', 'database', 'read']`)。 使用 tags 代替日志级别，并为描述和过滤事件提供更具表现力的机制。
- `data` - (可选) 记录应用程序数据的消息字符串或对象。 如果 `data` 是一个函数, 函数签名为 `function()` 并且它调用一次已生成返回值发送给监听器的实际数据。

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80, routes: { log: { collect: true } } });

server.events.on({ name: 'request', channels: 'app' }, (request, event, tags) => {

    if (tags.error) {
        console.log(event);
    }
});

const handler = function (request, h) {

    request.log(['test', 'error'], 'Test event');
    return null;
};

请注意，服务器内部生成的任何日志都将使用 `'internal'` 上的 [`'request'` event](#server.events.request).

```js
server.events.on({ name: 'request', channels: 'internal' }, (request, event, tags) => {

    console.log(event);
});
```

### <a name="request.route.auth.access()" /> `request.route.auth.access(request)`

验证针对路由的身份验证 [`access`](#route.options.auth.access) 配置的请求, 其中:

- `request` - the [request object](#request).

返回值:  如果` request` 已经通过了路由的访问要求，则为 `true`

请注意，路由的身份验证模式和策略将被忽略。 唯一匹配是 `request.auth.credentials` 和实体信息以及路由的 [`access`](#route.options.auth.access) 配置.

如果路由使用动态作用域, 作用域是根据 [`request.query`](#request.query),
[`request.params`](#request.params) 构建的, [`request.payload`](#request.payload), 和
[`request.auth.credentials`](#request.auth) 路由与请求路由之间可能匹配也可能不匹配. 如果使用未经过身份验证的请求调用此方法（尚未完成）, 如果路由需要任何身份验证，它将返回 `false`。

### <a name="request.setMethod()" /> `request.setMethod(method)`

在路由器开始处理请求之前更改请求方法，其中：

- `method` - 请求 HTTP 方法 (例如 `'GET'`).

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const onRequest = function (request, h) {

    // Change all requests to 'GET'
    request.setMethod('GET');
    return h.continue;
};

server.ext('onRequest', onRequest);
```

只能从 `'onRequest'` 扩展方法调用。

### <a name="request.setUrl()" /> `request.setUrl(url, [stripTrailingSlash]`

在路由器开始处理请求之前更改请求URI:

- `url` - 新的请求 URI. `url` 可以是字符串或
  [`Url.URL`](https://nodejs.org/dist/latest-v10.x/docs/api/url.html#url_class_url) 的实例.
- `stripTrailingSlash` - 如果为 `true`, 从路径中删除尾部斜杠. 默认为 `false`.

```js
const Hapi = require('hapi');
const server = Hapi.server({ port: 80 });

const onRequest = function (request, h) {

    // Change all requests to '/test'
    request.setUrl('/test');
    return h.continue;
};

server.ext('onRequest', onRequest);
```

仅能通过 `'onRequest'` `扩展方法调用。

## 插件

插件提供了一种通过将服务器逻辑拆分为更小的组件来组织应用程序代码的方法。 每个插件都可以通过标准服务器接口操作服务器， 但增加了沙箱某些属性的能力。 例如，在一个插件中设置文件路径不会影响另一个插件中设置的文件路径。

插件是具有以下属性的对象：

- `register` - (required) 注册签名函数 `async function(server, options)` 其中:

    - `server` - 具有特定于插件的 [`server.realm`](#server.realm) 服务器对象.
    - `options` - 通过 [`server.register()`](#server.register()) 在注册期间传递给插件的任何选项。

- `name` - (必要) 插件名称字符串. 该名称用作唯一键。 已发布的插件（例如，在 npm 中发布）应使用与其 'package.json' 文件中的名称字段相同的名称. 每个应用程序中的名称必须是唯一的。

- `version` - (可选) 插件版本字符串. 该版本仅用于提供信息，以使其他插件能够找到加载的版本. 该版本应与插件的 'package.json' 文件中指定的版本相同。

- `multiple` - (可选) 如果为 `true`, 允许插件在同一服务器上多次注册。默认为 `false`。

- `dependencies` - (可选) 一个字符串或一个字符串数组，表示插件依赖项。 与通过 [`server.dependency()`](#server.dependency()) 设置依赖相同.

- `once` - (可选) 如果为 `true`, 每个服务器只会注册一次插件。如果设置，则覆盖传递给 [`server.register()`](#server.register()) 的 `once` 选项。默认为不覆盖。

```js
const plugin = {
    name: 'test',
    version: '1.0.0',
    register: function (server, options) {

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'ok';
            }
        });
    }
};
```

或者，可以通过 `pkg` 属性包含 `name` 和 `version`，该属性包含已有名称和版本的 'package.json' 文件中：

```js
const plugin = {
    pkg: require('./package.json'),
    register: function (server, options) {

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'ok';
            }
        });
    }
};
```
