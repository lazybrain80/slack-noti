'use strict'

global.__logger = console.log
global.__config = require('config')

/* 자주 쓰는 library */
global._ = require('lodash')

require('./schedules')
