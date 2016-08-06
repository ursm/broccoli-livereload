'use strict'

const BroccoliFilter = require('broccoli-filter')

const Document = require('node-html-light').Document
const Node = require('node-html-light').Node
const Text = require('node-html-light').Text
const livereload = require('livereload')

class BroccoliLivereload extends BroccoliFilter {

    constructor(inputNodes, options) {
        super(inputNodes, options)

        this.options = options

        this._livereloadPort = options.options && options.options.port || 35729
        this._livereload = livereload.createServer(options.options)

        const textNode = Text.fromString([
            'document.write(\'', '<script ',
            'src="http://\' + (location.host || "localhost").split(":")[0] + \':',
            this._livereloadPort, '/livereload.js?snipver=1">',
            '<\\/script>\')'].join('')
        )

        this._scriptTag = Node.fromString('<script></script>').appendChild(textNode)
    }

    processString(contents, path) {
        let output = ''

        if (path === this.options.target) {

            const document = Document.fromString(contents)
            document.head().appendChild(this._scriptTag)
            output = document.toHtml()

        } else {

            output = contents
        }

        this._lastRefreshed = path

        return output
    }

    build() {

        return super.build().then(() => {

            this._livereload.filterRefresh(this._lastRefreshed)
        })
    }
}

module.exports = BroccoliLivereload