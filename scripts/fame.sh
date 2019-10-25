mkdir -p ~/.fame

cat <<EOF > ~/.fame/fame.conf.js

'use strict';

exports.default = {

  'display names': {

     'John James': {
        emails: ['jj@watt.com', 'abc@example.com', 'john@james-mac.local']
     },

    'Thurgood Marshall': {
        emails: ['tm@supremecourt.us', 'marsh@spc.gov']
     },

     'Alexander Mills': {
      emails: ['alex@oresoftware.com', 'alex@alexs-mac.local']
     }
  }

}

EOF


