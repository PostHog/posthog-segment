#!/bin/bash
set -e

# NOTE: This is tricky. Segment doesn't allow us to export code as they do some VM wrapper stuff rather than using standard exports
# As such, we copy our code into a new file and export it as a module. This is a bit of a hack, but it works for testing

cp index.js module.js

cat >> module.js <<EOF
// Segment exposes uuidv5 as an object, so it is callable at uuidv5.uuidv5, see:
// https://segment.com/docs/connections/functions/destination-functions/#runtime-and-dependencies
const __uuidv5 = require('uuidv5')
const uuidv5 = {
    uuidv5: __uuidv5
}
module.exports = {
    onTrack,
    onIdentify,
    onGroup,
    onPage,
    onAlias,
    onScreen,
}
EOF