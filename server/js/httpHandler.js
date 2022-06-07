const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messageQueue = require('./messageQueue');
const commands = ['up', 'down', 'left', 'right'];
const keypressHandler = require('./keypressHandler');
//const formidable = require('formidable')
//let mv = require('mv')

keypressHandler.initialize(message => messageQueue.enqueue(message));

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

//let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method == 'POST'){
    if (req.url == "/background.jpg") { //is it writing this correctly?
      /*
      figure out where the buffer stream is in the
      */
      let buffer = Buffer.alloc(0)
      req.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk])
      })

      req.on("end", ()=>{
        let file = multipart.getFile(buffer)
        fs.writeFile('./background.jpg', file.data, (err) => {
          res.writeHead(err ? 404 : 200, headers)
        })
      })
    }}
  else{ //else statement for get requests

    if (req.url == "/background.jpg"){  //if they are requesting image with 'GET'

      console.log("registered get request for image")
      contentType = 'image/jpg'
      res.writeHead(200,{'Content-Type' : contentType})
      let image = fs.readFileSync('./background.jpg')
      res.end(image, 'binary')
    }

    res.writeHead(200, headers);

    //code for random commands
    let command = commands[Math.floor(Math.random()*commands.length)];
    res.write(command)

    if (!messageQueue.isempty()){
      let command = messageQueue.dequeue()
      console.log(command);
      res.write(command)
    }

    res.end();
  }
  next(); // invoke next() at the end of a request to help with testing!
};
