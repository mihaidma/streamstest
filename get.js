const axios = require('axios')
const fs = require('fs')

const write = fs.createWriteStream('test.txt')

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
    write.on('data', (data) => {
      console.log('data: ', data)
    })


  async function read() {

  try {
     axios({
      method: 'get',
      url: 'http://localhost:3000/',
      responseType: 'stream'
    })
.then(function (res) {
    console.log('res status ', res.status)
    // console.log('res ', res.data)
    res.data.pipe(write)
  });
    // console.log('res status ', res.status)
    // console.log('res ', res.data)

      // res.data.pipe(write)
      // .then(function (response) {
      //   response.data.pipe(write)
      // });
    }
    catch (err) {
      console.log('err ', err)
    }
  }
  read()
