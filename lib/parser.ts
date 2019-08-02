'use strict';

import stream = require("stream");


export const createParser = function () {
  
  let lastLineData = '';
  
  return new stream.Transform({
    
    objectMode: true,
    
    transform (chunk, encoding, cb) {
      let self = this;
      let data = String(chunk);
      if (lastLineData) {
        data = lastLineData + data;
      }
      const lines = data.split('\n');
      lastLineData = lines.pop();
      for (const l of lines) {
        l && this.push(l);
      }
      cb();
    },
    
    flush (cb) {
      if (lastLineData) {
        this.push(lastLineData);
        lastLineData = '';
      }
      cb();
    }
  });
  
};

export default createParser;