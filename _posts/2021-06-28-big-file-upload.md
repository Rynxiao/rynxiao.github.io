---
layout: post
title:  "捣鼓系列：前端大文件上传"
date:   2021-06-28
categories: 技术
excerpt: '某一天，在逛某金的时候突然看到这篇文章，前端大文件上传，如果一个文件太大，比如音视频数据、下载的excel表格等等，如果在上传的过程中，等待时间超过30 ~ 120s，服务器没有数据返回，就有可能被认为超时，这是上传的文件就会被中断。另外一个问题是，在大文件上传的过程中，上传到服务器的数据因为服务器问题或者其他的网络问题导致中断、超时，这是上传的数据将不会被保存，造成上传的浪费。'
tag: [upload,big-file]
---

某一天，在逛某金的时候突然看到这篇文章，[前端大文件上传](https://juejin.cn/post/6844903860327186445)，之前也研究过类似的原理，但是一直没能亲手做一次，始终感觉有点虚，最近花了点时间，精（熬）心（夜）准（肝）备（爆）了个例子，来和大家分享。

本文代码：[github](https://github.com/Rynxiao/file-examples)

![upload1.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87af19f97602463aba76faa43ec9bd0b~tplv-k3u1fbpfcp-watermark.image)
## 问题

> Knowing the time available to provide a response can avoid problems with timeouts. Current implementations select times between **30 and 120** seconds
>
> [https://tools.ietf.org/id/draft-thomson-hybi-http-timeout-00.html](https://tools.ietf.org/id/draft-thomson-hybi-http-timeout-00.html)

如果一个文件太大，比如音视频数据、下载的excel表格等等，如果在上传的过程中，等待时间超过30 ~ 120s，服务器没有数据返回，就有可能被认为超时，这是上传的文件就会被中断。

另外一个问题是，在大文件上传的过程中，上传到服务器的数据因为服务器问题或者其他的网络问题导致中断、超时，这是上传的数据将不会被保存，造成上传的浪费。

## 原理

大文件上传利用将大文件分片的原则，将一个大文件拆分成几个小的文件分别上传，然后在小文件上传完成之后，通知服务器进行文件合并，至此完成大文件上传。

这种方式的上传解决了几个问题：

- 文件太大导致的请求超时
- 将一个请求拆分成多个请求（现在比较流行的浏览器，一般默认的数量是6个，[同源请求并发上传的数量](https://docs.pushtechnology.com/cloud/latest/manual/html/designguide/solution/support/connection_limitations.html)），增加并发数，提升了文件传输的速度
- 小文件的数据便于服务器保存，如果发生网络中断，下次上传时，已经上传的数据可以不再上传

## 实现

### 文件分片

`File`接口是基于`Blob`的，因此我们可以将上传的文件对象使用`slice`方法 进行分割，具体的实现如下：

```js
export const slice = (file, piece = CHUNK_SIZE) => {
  return new Promise((resolve, reject) => {
    let totalSize = file.size;
    const chunks = [];
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    let start = 0;
    const end = start + piece >= totalSize ? totalSize : start + piece;

    while (start < totalSize) {
        const chunk = blobSlice.call(file, start, end);
        chunks.push(chunk);

        start = end;
        const end = start + piece >= totalSize ? totalSize : start + piece;
    }
    
    resolve(chunks);
  });
};
```

然后将每个小的文件，使用表单的方式上传

```js
_chunkUploadTask(chunks) {
    for (let chunk of chunks) {
        const fd = new FormData();
        fd.append('chunk', chunk);

        return axios({
          url: '/upload',
          method: 'post',
          data: fd,
        })
          .then((res) => res.data)
          .catch((err) => {});
    }
}
```

后端采用了`express`，接收文件采用了`[multer](https://github.com/expressjs/multer)`这个 库

`multer`上传的的方式有single、array、fields、none、any，做单文件上传，采用`single`和`array`皆可，使用比较简便，通过`req.file` 或 `req.files`来拿到上传文件的信息

另外需要通过`disk storage`来定制化上传文件的文件名，保证在每个上传的文件chunk都是唯一的。

```js
const storage = multer.diskStorage({
  destination: uploadTmp,
  filename: (req, file, cb) => {
    // 指定返回的文件名，如果不指定，默认会随机生成
    cb(null, file.fieldname);
  },
});
const multerUpload = multer({ storage });

// router
router.post('/upload', multerUpload.any(), uploadService.uploadChunk);

// service
uploadChunk: async (req, res) => {
  const file = req.files[0];
  const chunkName = file.filename;

  try {
    const checksum = req.body.checksum;
    const chunkId = req.body.chunkId;

    const message = Messages.success(modules.UPLOAD, actions.UPLOAD, chunkName);
    logger.info(message);
    res.json({ code: 200, message });
  } catch (err) {
    const errMessage = Messages.fail(modules.UPLOAD, actions.UPLOAD, err);
    logger.error(errMessage);
    res.json({ code: 500, message: errMessage });
    res.status(500);
  }
}
```

上传的文件会被保存在`uploads/tmp`下，这里是由`multer`自动帮我们完成的，成功之后，通过`req.files`能够获取到文件的信息，包括chunk的名称、路径等等，方便做后续的存库处理。

为什么要保证chunk的文件名唯一？

- 因为文件名是随机的，代表着一旦发生网络中断，如果上传的分片还没有完成，这时数据库也不会有相应的存片记录，导致在下次上传的时候找不到分片。这样的后果是，会在`tmp`目录下存在着很多游离的分片，而得不到删除。
- 同时在上传暂停的时候，也能根据chunk的名称来删除相应的临时分片（这步可以不需要，`multer`判断分片存在的时候，会自动覆盖）

如何保证chunk唯一，有两个办法，

- 在做文件切割的时候，给每个chunk生成文件指纹 （`chunkmd5`)
- 通过整个文件的文件指纹，加上chunk的序列号指定（`filemd5` + `chunkIndex`）

```jsx
// 修改上述的代码
const chunkName = `${chunkIndex}.${filemd5}.chunk`;
const fd = new FormData();
fd.append(chunkName, chunk);
```

至此分片上传就大致完成了。

### 文件合并

文件合并，就是将上传的文件分片分别读取出来，然后整合成一个新的文件，**比较耗IO**，可以在一个新的线程中去整合。

```js
for (let chunkId = 0; chunkId < chunks; chunkId++) {
  const file = `${uploadTmp}/${chunkId}.${checksum}.chunk`;
  const content = await fsPromises.readFile(file);
  logger.info(Messages.success(modules.UPLOAD, actions.GET, file));
  try {
    await fsPromises.access(path, fs.constants.F_OK);
    await appendFile({ path, content, file, checksum, chunkId });
    if (chunkId === chunks - 1) {
        res.json({ code: 200, message });
    }
  } catch (err) {
    await createFile({ path, content, file, checksum, chunkId });
  }
}

Promise.all(tasks).then(() => {
  // when status in uploading, can send /makefile request
  // if not, when status in canceled, send request will delete chunk which has uploaded.
  if (this.status === fileStatus.UPLOADING) {
    const data = { chunks: this.chunks.length, filename, checksum: this.checksum };
    axios({
      url: '/makefile',
      method: 'post',
      data,
    })
      .then((res) => {
        if (res.data.code === 200) {
          this._setDoneProgress(this.checksum, fileStatus.DONE);
          toastr.success(`file ${filename} upload successfully!`);
        }
      })
      .catch((err) => {
        console.error(err);
        toastr.error(`file ${filename} upload failed!`);
      });
  }
});
```

- 首先使用access判断分片是否存在，如果不存在，则创建新文件并读取分片内容
- 如果chunk文件存在，则读取内容到文件中
- 每个chunk读取成功之后，删除chunk

这里有几点需要注意：

- 如果一个文件切割出来只有一个chunk，那么就需要在`createFile`的时候进行返回，否则请求一直处于`pending`状态。

    ```js
    await createFile({ path, content, file, checksum, chunkId });

    if (chunks.length === 1) {
      res.json({ code: 200, message });
    }
    ```

- `makefile`之前务必要判断文件是否是上传状态，不然在`cancel`的状态下，还会继续上传，导致chunk上传之后，chunk文件被删除，但是在数据库中却存在记录，这样合并出来的文件是有问题的。

### 文件秒传

![upload4.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/849af4c772744a2c98238e9ed961085e~tplv-k3u1fbpfcp-watermark.image)

如何做到文件秒传，思考三秒，公布答案，3. 2. 1.....，其实只是个障眼法。

为啥说是个障眼法，因为根本就没有传，文件是从服务器来的。这就有几个问题需要弄清楚，

- 怎么确定文件是服务器中已经存在了的？
- 文件的上传的信息是保存在数据库中还是客户端？
- 文件名不相同，内容相同，应该怎么处理？

**问题一：怎么判断文件已经存在了？**

可以为每个文件上传生成对应的指纹，但是如果文件太大，客户端生成指纹的时间将大大增加，怎么解决这个问题？

还记得之前的`slice`，文件切片么？大文件不好做，同样的思路，切成小文件，然后计算md5值就好了。这里使用[`spark-md5`](http://github.com/satazor/js-spark-md5)这个库来生成文件hash。改造上面的slice方法。

```jsx
export const checkSum = (file, piece = CHUNK_SIZE) => {
  return new Promise((resolve, reject) => {
    let totalSize = file.size;
    let start = 0;
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const chunks = [];
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    const loadNext = () => {
      const end = start + piece >= totalSize ? totalSize : start + piece;
      const chunk = blobSlice.call(file, start, end);

      start = end;
      chunks.push(chunk);
      fileReader.readAsArrayBuffer(chunk);
    };

    fileReader.onload = (event) => {
      spark.append(event.target.result);

      if (start < totalSize) {
        loadNext();
      } else {
        const checksum = spark.end();
        resolve({ chunks, checksum });
      }
    };

    fileReader.onerror = () => {
      console.warn('oops, something went wrong.');
      reject();
    };

    loadNext();
  });
};
```

**问题二：文件的上传的信息是保存在数据库中还是客户端？**

文件上传的信息最好是保存在**服务端的**数据库中（客户端可以使用`IndexDB`），这样做有几个优点，

- 数据库服务提供了成套的`CRUD`，方便数据的操作
- 当用户刷新浏览器之后，或者更换浏览器之后，文件上传的信息不会丢失

这里主要强调的是第二点，因为第一条客户端也可以做😁😁😁

```jsx
const saveFileRecordToDB = async (params) => {
  const { filename, checksum, chunks, isCopy, res } = params;
  await uploadRepository.create({ name: filename, checksum, chunks, isCopy });

  const message = Messages.success(modules.UPLOAD, actions.UPLOAD, filename);
  logger.info(message);
  res.json({ code: 200, message });
};
```

**问题三：文件名不相同，内容相同，应该怎么处理？**

这里同样有两个解决办法：

- 文件copy，直接将文件复制一份，然后更新数据库记录，并且加上`isCopy`的标识
- 文件引用，数据库保存记录，加上`isCopy`和`linkTo`的标识

这两种方式有什么区别：

使用文件copy的方式，在删除文件的时候会更加自由点，因为原始文件和复制的文件都是独立存在的，删除不会相互干涉，缺点是会存在很多内容相同的文件；

但是使用引用方式复制的文件的删除就比较麻烦，如果删除的是复制的文件倒还好，删除的如果是原始文件，**就必须先将源文件copy一份到任意的一个复制文件中**，**同时修改负责的记录中的`isCopy`为`false`**, 然后才能删除原文件的数据库记录。

这里做了个图，顺便贴下：

![fileCopy](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e362a7abb4641258dd23a89ec59ce2e~tplv-k3u1fbpfcp-watermark.image)

理论上讲，文件引用的方式可能更加好一点，这里偷了个懒，采用了文件复制的方式。

```jsx
// 客户端
uploadFileInSecond() {
  const id = ID();
  const filename = this.file.name;
  this._renderProgressBar(id);

  const names = this.serverFiles.map((file) => file.name);
  if (names.indexOf(filename) === -1) {
    const sourceFilename = names[0];
    const targetFilename = filename;

    this._setDoneProgress(id, fileStatus.DONE_IN_SECOND);
    axios({
      url: '/copyfile',
      method: 'get',
      params: { targetFilename, sourceFilename, checksum: this.checksum },
    })
      .then((res) => {
        if (res.data.code === 200) {
          toastr.success(`file ${filename} upload successfully!`);
        }
      })
      .catch((err) => {
        console.error(err);
        toastr.error(`file ${filename} upload failed!`);
      });
  } else {
    this._setDoneProgress(id, fileStatus.EXISTED);
    toastr.success(`file ${filename} has existed`);
  }
}

// 服务器端
copyFile: async (req, res) => {
  const sourceFilename = req.query.sourceFilename;
  const targetFilename = req.query.targetFilename;
  const checksum = req.query.checksum;
  const sourceFile = `${uploadPath}/${sourceFilename}`;
  const targetFile = `${uploadPath}/${targetFilename}`;

  try {
    await fsPromises.copyFile(sourceFile, targetFile);
    await saveFileRecordToDB({ filename: targetFilename, checksum, chunks: 0, isCopy: true, res });
  } catch (err) {
    const message = Messages.fail(modules.UPLOAD, actions.UPLOAD, err.message);
    logger.info(message);
    res.json({ code: 500, message });
    res.status(500);
  }
}
```

### 文件上传暂停与文件续传

文件上传暂停，其实是利用了`xhr`的`abort`方法，因为在案例中采用的是`axios`，`axios`基于`ajax`封装了自己的实现方式。

这里看看代码暂停代码：

```jsx
const CancelToken = axios.CancelToken;

axios({
  url: '/upload',
  method: 'post',
  data: fd,
  cancelToken: new CancelToken((c) => {
    // An executor function receives a cancel function as a parameter
    canceler = c;
    this.cancelers.push(canceler);
  }),
})
```

`axios`在每个请求中使用了一个参数`cancelToken`，这个`cancelToken`是一个函数，可以利用这个函数来保存每个请求的`cancel`句柄。

然后在点击取消的时候，取消每个chunk的上传，如下：

```jsx
// 这里使用了jquery来编写html，好吧，确实写🤮了

$(`#cancel${id}`).on('click', (event) => {
  const $this = $(event.target);
  $this.addClass('hidden');
  $this.next('.resume').removeClass('hidden');

  this.status = fileStatus.CANCELED;
  if (this.cancelers.length > 0) {
    for (const canceler of this.cancelers) {
      canceler();
    }
  }
});
```

在每个chunk上传的同时，我们也需要判断每个chunk是否存在？为什么？

因为发生意外的网络中断，上传到chunk信息就会被保存到数据库中，所以在做续传的时候，已经存在的chunk就可以不用再传了，节省了时间。

那么问题来了，是每个chunk单一检测，还是预先检测服务器中已经存在的chunks？

这个问题也可以思考三秒，毕竟debug了好久。

3.. 2.. 1......

看个人的代码策略，因为毕竟每个人写代码的方式不同。原则是，**不能阻塞每次的循环，因为在循环中需要生成每个chunk的`cancelToken`**，如果在循环中，每个chunk都要从服务器中拿一遍数据，会导致后续的chunk生成不了cancelToken，这样在点击了cancel的时候，后续的chunk还是能够继续上传。

```js
// 客户端
const chunksExisted = await this._isChunksExists();

for (let chunkId = 0; chunkId < this.chunks.length; chunkId++) {
  const chunk = this.chunks[chunkId];
  // 很早之前的代码是这样的
  // 这里会阻塞cancelToken的生成
  // const chunkExists = await isChunkExisted(this.checksum, chunkId);

  const chunkExists = chunksExisted[chunkId];

  if (!chunkExists) {
    const task = this._chunkUploadTask({ chunk, chunkId });
    tasks.push(task);
  } else {
    // if chunk is existed, need to set the with of chunk progress bar
    this._setUploadingChunkProgress(this.checksum, chunkId, 100);
    this.progresses[chunkId] = chunk.size;
  }
}

// 服务器端
chunksExist: async (req, res) => {
  const checksum = req.query.checksum;
  try {
    const chunks = await chunkRepository.findAllBy({ checksum });
    const exists = chunks.reduce((cur, chunk) => {
      cur[chunk.chunkId] = true;
      return cur;
    }, {});
    const message = Messages.success(modules.UPLOAD, actions.CHECK, `chunk ${JSON.stringify(exists)} exists`);
    logger.info(message);
    res.json({ code: 200, message: message, data: exists });
  } catch (err) {
    const errMessage = Messages.fail(modules.UPLOAD, actions.CHECK, err);
    logger.error(errMessage);
    res.json({ code: 500, message: errMessage });
    res.status(500);
  }
}
```

文件续传就是重新上传文件，这点没有什么可以讲的，主要是要把上面的那个问题解决了。

```js
$(`#resume${id}`).on('click', async (event) => {
  const $this = $(event.target);
  $this.addClass('hidden');
  $this.prev('.cancel').removeClass('hidden');

  this.status = fileStatus.UPLOADING;
  await this.uploadFile();
});
```

### 进度回传

进度回传是利用了`XMLHttpRequest.upload`，`axios`同样封装了相应的方法，这里需要显示两个进度

- 每个chunk的进度
- 所有chunk的总进度

每个chunk的进度会根据上传的`loaded`和`total`来进行计算，这里也没有什么好说的。

```js
axios({
  url: '/upload',
  method: 'post',
  data: fd,
  onUploadProgress: (progressEvent) => {
    const loaded = progressEvent.loaded;
    const chunkPercent = ((loaded / progressEvent.total) * 100).toFixed(0);

    this._setUploadingChunkProgress(this.checksum, chunkId, chunkPercent);
  },
})
```

总进度则是根据每个chunk的加载量，进行累加，然后在和`file.size`来进行计算。

```js
constructor(checksum, chunks, file) {
  this.progresses = Array(this.chunks.length).fill(0);
}

axios({
  url: '/upload',
  method: 'post',
  data: fd,
  onUploadProgress: (progressEvent) => {
    const chunkProgress = this.progresses[chunkId];
    const loaded = progressEvent.loaded;
    this.progresses[chunkId] = loaded >= chunkProgress ? loaded : chunkProgress;
    const percent = ((this._getCurrentLoaded(this.progresses) / this.file.size) * 100).toFixed(0);

    this._setUploadingProgress(this.checksum, percent);
  },
})

_setUploadingProgress(id, percent) {
  // ...

  // for some reason, progressEvent.loaded bytes will greater than file size
  const isUploadChunkDone = Number(percent) >= 100;
  // 1% to make file
  const ratio = isUploadChunkDone ? 99 : percent;
}
```

这里需要注意的一点是，`loaded >= chunkProgress ? loaded : chunkProgress`，这样判断的目的是，因为续传的过程中，有可能某些片需要重新重`**0**`开始上传，如果不这样判断，就会导致进度条的跳动。

### 数据库配置

数据库采用了`sequelize` + `mysql`，初始化代码如下：

```js
const initialize = async () => {
  // create db if it doesn't already exist
  const { DATABASE, USER, PASSWORD, HOST } = config;
  const connection = await mysql.createConnection({ host: HOST, user: USER, password: PASSWORD });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE};`);
  } catch (err) {
    logger.error(Messages.fail(modules.DB, actions.CONNECT, `create database ${DATABASE}`));
    throw err;
  }

  // connect to db
  const sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
    host: HOST,
    dialect: 'mysql',
    logging: (msg) => logger.info(Messages.info(modules.DB, actions.CONNECT, msg)),
  });

  // init models and add them to the exported db object
  db.Upload = require('./models/upload')(sequelize);
  db.Chunk = require('./models/chunk')(sequelize);

  // sync all models with database
  await sequelize.sync({ alter: true });
};
```

### 部署

生产环境的部署采用了`docker-compose`，代码如下：

**Dockerfile**

```yaml
FROM node:16-alpine3.11

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install
RUN npm run build:prod
```

**docker-compose.yml**

```yaml
version: "3.9"
services:
  web:
    build: .
    # sleep for 20 sec, wait for database server start
    command: sh -c "sleep 20 && npm start"
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: prod
    depends_on:
      - db
  db:
    image: mysql:8
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: pwd123
```

有一点需要注意的是，需要等数据库服务启动，然后再启动`web`服务，不然会报错，所以代码中加了20秒的延迟。

**部署到heroku**

1. create `heroku.yml`

    ```yaml
    build:
      docker:
        web: Dockerfile
    run:
      web: npm run start:heroku
    ```

2. modify `package.json`

    ```yaml
    {
      "scripts": {
        "start:heroku": "NODE_ENV=heroku node ./bin/www"
      }
    }
    ```

3. deploy to heroku

    ```yaml
    # create heroku repos
    heroku create upload-demos
    heroku stack:set container 

    # when add addons, remind to config you billing card in heroku [important]
    # add mysql addons
    heroku addons:create cleardb:ignite 
    # get mysql connection url
    heroku config | grep CLEARDB_DATABASE_URL
    # will echo => DATABASE_URL: mysql://xxxxxxx:xxxxxx@xx-xxxx-east-xx.cleardb.com/heroku_9ab10c66a98486e?reconnect=true

    # set mysql database url
    heroku config:set DATABASE_URL='mysql://xxxxxxx:xxxxxx@xx-xxxx-east-xx.cleardb.com/heroku_9ab10c66a98486e?reconnect=true'

    # add heroku.js to src/db/config folder
    # use the DATABASE_URL which you get form prev step to config the js file
    module.exports = {
      HOST: 'xx-xxxx-east-xx.cleardb.com',
      USER: 'xxxxxxx',
      PASSWORD: 'xxxxxx',
      DATABASE: 'heroku_9ab10c66a98486e',
    };

    # push source code to remote
    git push heroku master
    ```

## 小结

至此所有的问题都已经解决了，总体的一个感受是处理的细节非常多，有些事情还是不能只是看看，花时间做出来才更加了解原理，更加有动力去学新的知识。

**纸上得来终觉浅，绝知此事要躬行。**

在代码仓库[github](https://github.com/Rynxiao/file-examples)还有很多细节，包括本地服务器开发配置、日志存储等等，感兴趣的可以自己`fork`了解下。创作不易，求⭐️⭐️。

