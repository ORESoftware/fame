'use strict';

import {fmhome, fnhomeConf} from "./constants";
import * as fs from "fs";
import * as path from "path";
import log from './logger';

const skel = `
{
  "display names": {}
}
`;


export default (email: string, name: string,) => {
  
  if(!/@/.test(email)){
    log.error('Email address must have an @ sign:', email);
    process.exit(1);
  }
  
  if(/@/.test(name)){
    log.warn('User name may be swapped with email address.');
    process.exit(1);
  }
  
  fs.mkdir(fmhome, err => {
    
    fs.writeFile(fnhomeConf, skel, {flag: 'wx'}, err => {
      
      try {
        var x = require(fnhomeConf);
      }
      catch (err) {
        log.error('Could not load your fame.conf.js file.');
        log.error(err);
        process.exit(1);
      }
      
      const dn = x['display names'];
      
      if (!(dn && typeof dn === 'object')) {
        throw 'The "display names" property needs to point an object in fame.conf.js.';
      }
      
      const nm = dn[name] = dn[name] || {};
      const emails = nm['emails'] = nm['emails'] || [];
      
      const s = new Set(emails);
      s.add(email);
      nm['emails'] = Array.from(s);
      
      const strang = JSON.stringify(x, null, 2);
      
      fs.writeFile(fnhomeConf, strang, err => {
        
        if (err) {
          log.error('Could not write conf file to disk.');
          log.error(err);
          process.exit(1);
        }
        
        process.exit(0);
        
      });
      
    });
  });
  
};