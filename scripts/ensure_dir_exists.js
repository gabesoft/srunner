fs   = require 'fs'
path = require 'path'

module.exports = (state, dir, cb) ->
  dir = path.resolve dir
  fs.stat dir, (err, stat) ->
    if err? or not stat.isDirectory()
      fs.mkdir dir, cb
    else
      cb()

