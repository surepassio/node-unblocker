'use strict';

var Transform = require('stream').Transform;
var contentTypes = require('./content-types');

module.exports = function(config) {

    function createStream() {
        var writtenMeta = false;
        return new Transform({
            decodeStrings: false,
            transform: function(chunk, encoding, next) {
                let text = chunk.toString();
                if (!writtenMeta) {
                    text = text.replace('<head>', '<head>\n<meta name="ROBOTS" content="NOINDEX, NOFOLLOW"/>');
                }
                if (text.includes('<head>')) {
                    writtenMeta = true;
                }
                this.push(text, 'utf8');
                next();
            }
        });
    }

    function metaRobots(data) {
        // this leaks to all sites that are visited by the client & it can block the client from accessing the proxy if https is not avaliable.
        if (contentTypes.html.indexOf(data.contentType) != -1) {
            data.stream = data.stream.pipe(createStream());
        }
    }

    metaRobots.createStream = createStream; // for testing

    return metaRobots;
};
