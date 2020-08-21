const Hapi = require('@hapi/hapi')
const { Stream, Writable, Readable, Transform, pipeline } = require('stream');



  const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

const read = new Readable({
    read() {
      console.log('read')
    }
  });

  let count = 0
  const transform = new Transform({
    transform(data, enc, cb) {
      console.log('transform', data.toString())
      cb(null, data);
      // cb(new Error('kaboom'));
    }
  });
  const transform2 = new Transform({
    transform(data, enc, cb) {
      console.log('count ', count)
      console.log('transform2', data.toString())
      if (count < 1) {
        cb(null, data);
      } else {
        cb(new Error('kaboom'));
      }
      count++
    }
  });
  const transform3 = new Transform({
    transform(data, enc, cb) {
      console.log('transform3', data.toString())
      cb(null, data);
    }
  });

  const write = new Writable({
    write(data, enc, cb) {
      console.log('write')
      cb();
    }
  });

    read.on('error', (err) => {
      console.log('read error ')
      if (err)
        console.log('read error ', err.toString())
    });
    read.on('end', () => {
      console.log('read end ')
    });
    read.on('close', () => {
      console.log('read close ')
    });
    read.on('finish', () => {
      console.log('read finish ')
    });

    transform.on('error', (err) => {
      console.log('transform error ')
      if (err)
        console.log('transform error ', err.toString())
    });
    transform.on('end', () => {
      console.log('transform end ')
    });
    transform.on('close', () => {
      console.log('transform close ')
    });
    transform.on('finish', () => {
      console.log('transform finish ')
    });

    write.on('error', (err) => {
      console.log('write error ')
      if (err)
        console.log('write error ', err.toString())
    });
    write.on('end', () => {
      console.log('write end ')
    });
    write.on('close', () => {
      console.log('write close ')
    });
    write.on('finish', () => {
      console.log('write finish ')
    });

  transform2.on('error', (err) => {
      console.log('tranform2 error ')
      transform3.push('hello2')
      transform3.end()
      if (err)
        console.log('transform2 error ', err.toString())
    });
    transform2.on('end', () => {
      console.log('transform2 end ')
    });
    transform2.on('close', () => {
      console.log('transform2 close ')
    });
    transform2.on('finish', () => {
      console.log('transform2 finish ')
    });

  transform3.on('error', (err) => {
      console.log('tranform3 error ')
      if (err)
        console.log('transform3 error ', err.toString())
    });
    transform3.on('end', () => {
      console.log('transform3 end ')
    });
    transform3.on('close', () => {
      console.log('transform3 close ')
    });
    transform3.on('finish', () => {
      console.log('transform3 finish ')
    });
    let stop = false
 const dst = pipeline(transform, transform2, transform3, (err) => {
    if (err) {
      console.log('pipeline err ', err.toString())
// return h.response(JSON.stringify(err, null, 2));
    }

    else {
      console.log('pipeline success')
    }
  });

  transform.push('hello');
  transform.push('hello');
  // transform.end()
  // read.push('hello');
  // read.push(null);
            // return 'Hello World!';
            const resp = h.response(transform3)
            // resp.on('peek', (data) => {
            //   console.log('data ', data)
            // })
            return resp.type('text/event-stream')
        }
    });


    server.route({
        method: 'GET',
        path: '/test',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

