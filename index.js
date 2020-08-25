const Hapi = require('@hapi/hapi')
const { Writable, Readable, Transform, pipeline, finished } = require('stream');
const through2 = require('through2');

const listenEvents = (stream, streamName) => {
  stream.on('error', (err) => {
    console.log(`-${streamName} error `)
    // console.log(`--${streamName} destroyed`, stream.destroyed)
    // console.log(`--${streamName} readable ended`, stream.readableEnded)
    // console.log(`--${streamName} writable ended`, stream.writableEnded)
    // console.log(`--${streamName} writable finished`, stream.writableFinished)
    // console.log(`--${streamName} writable`, stream.writable)
    console.log(`--${streamName} writable length`, stream.writableLength)
    console.log(`--${streamName} readable length`, stream.readableLength)
    // On Node 12.16 resume makes the client receive a 200 Ok but no data
    // output.resume()
    // setTimeout(() => {
    // output.end()
    // }, 100);

    // if (err)
    //   console.log(`${streamName} error `, err.toString())
  })
  stream.on('end', () => {
    console.log(`${streamName} end `)
  })
  stream.on('close', () => {
    console.log(`${streamName} close `)
  })
  stream.on('finish', () => {
    console.log(`${streamName} finish `)
  })
  // stream.on('data', (data) => {
  //   console.log(`${streamName} data `, data.toString())
  // })
}

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      let count = 0
      const transform = new Transform({
        transform(data, enc, cb) {
          console.log('transform stream _transform', data.toString())
          cb(null, data)
          // cb(new Error('kaboom'))
        }
      })
      const transform2 = new Transform({
        transform(data, enc, cb) {
          console.log('count ', count)
          console.log('transform2 stream _transform', data.toString())
          if (count < 1) {
            cb(null, data);
          } else {
            cb(new Error('kaboom'))
            // setTimeout(() => {
            //   cb(new Error('kaboom'))
            // }, 500)
          }
          count++
        }
      })
      const output = new Transform({
        transform(data, enc, cb) {
          console.log('output stream _transform', data.toString())
          cb(null, data)
        }
      })

      const flagStream = through2(
        (chunk, enc, cb) => cb(null, chunk),
        function (cb) {
          console.log('flag stream flush')
          this.push('hello error\n')
          cb()
        }
      )

      listenEvents(transform, 'transform stream')
      listenEvents(transform2, 'transform2 stream')
      listenEvents(output, 'output stream')
      listenEvents(flagStream, 'flag stream')

      // stream.finished catches premature close events, it catches the error on Node 12.16
      const cleanup = finished(output, (err) => {
        // cleanup()
        if (err) {
          console.error('output stream failed.', err);
        } else {
          console.log('output stream is done reading')
        }
      })

      const substream = pipeline(transform, transform2, (err) => {
        if (err) {
          console.log('-substream pipeline err ', err.toString())
          flagStream.end()
        }
        else {
          console.log('substream pipeline success')
        }
      })
      const dst = pipeline(substream, flagStream, output, (err) => {
        if (err) {
          console.log('-main pipeline err ', err.toString())
          // return h.response(JSON.stringify(err, null, 2));
        }
        else {
          console.log('main pipeline success')
        }
      })

      transform.push('hello1\n')
      transform.push('hello2\n')
      // transform.end()

      // output can be replaced with read stream to see difference in behaviour
      // On node 12.16 data sent with read stream seems to have no issues
      const resp = h.response(output)
      return resp.type('text/event-stream')
    }
  })

  server.route({
    method: 'GET',
    path: '/test',
    handler: (request, h) => {
      return 'Hello World!';
    }
  })
  await server.start();
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
