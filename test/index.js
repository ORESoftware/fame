const cp = require('child_process');
const stdio = require('json-stdio');
const k = cp.spawn('bash');


k.stdin.end('fame --json');


const p = stdio.createParser();


k.stdout.pipe(p).on(stdio.stdEventName, function (d) {
  console.log(d);
})
.on('end', function () {
  process.exit(0);
});

