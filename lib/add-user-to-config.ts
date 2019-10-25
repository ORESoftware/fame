'use strict';

import {fmhome, fnhomeConf} from "./constants";
import * as fs from "fs";
import * as path from "path";
import log from './logger';
import CliOptions from "./cli-options";
import {OptionsToType} from "@oresoftware/cli";

const skel = `
{
  "display names": {}
}
`;

const symbolz = {
  es: Symbol('error')
};

export default (opts: OptionsToType<typeof CliOptions>) => {
  
  const emails = opts.email.slice(0).map(v => String(v || '').trim()).filter(Boolean);
  const name = String(opts.add_user || '').trim();
  
  if (/@/.test(name)) {
    if (!opts.ignore_user_name_warning) {
      log.warn('User name may be swapped with email address, to ignore this warning use --ignore-user-name-warning.');
      process.exit(1);
    }
  }
  
  if (emails.length < 1) {
    throw 'Please provide at least one email address to give to attach to the user.';
  }
  
  if (name.length < 1) {
    throw 'User name needs to be at least one character in length.';
  }
  
  let p = Promise.resolve();
  
  for (const email of emails) {
    
    p = p.then(() => {
      
      return new Promise(resolve => {
        
        if (!/@/.test(email)) {
          if (!opts.ignore_email_warning) {
            log.error(`Email address must have an @ sign (you passed: '${email}'), use --ignore-email-warning to ignore.`);
            process.exit(1);
          }
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
            
            const dn: { [key: string]: { emails: Array<string> } } = x['display names'];
            
            if (!(dn && typeof dn === 'object')) {
              throw 'The "display names" property needs to point an object in fame.conf.js.';
            }
            
            for (const [key, val] of Object.entries(dn)) {
              // remove the email address from all existing user names
              if (!(val && Array.isArray((val as any).emails))) {
                dn[key] = dn[key] || {emails: []};
                dn[key].emails = Array.isArray(dn.key.emails) ? dn.key.emails : [];
              }
              const s = new Set(dn[key].emails);
              s.delete(email);
              dn[key].emails = Array.from(s);
            }
            
            const nm = dn[name] = dn[name] || {} as any;
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
              
              resolve(null);
              
            });
            
          });
        });
        
      });
      
    });
    
  }
  
  p.catch(v => {
      log.error(v);
      return {error: v, es: symbolz.es};
    })
    .then((v: any) => {
      if (v && v.es === symbolz.es) {
        process.exit(1);
      }
      process.exit(0);
    });
  
};