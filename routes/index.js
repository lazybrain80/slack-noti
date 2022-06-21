'use strict'

const express = require('express')
const router = express()
const { todayOff, tommorrowOff, someDayOff } = require('@controllers')

router.get(
    '/holiday/today',
    async (req, res) => {
        try {
            res.send(todayOff())
        } catch (error) {
            res.status(400).json(error.message)
        }
    }
)

router.get(
    '/holiday/tommorrow',
    async (req, res) => {
        try {
            res.send(tommorrowOff())
        } catch (error) {
            res.status(400).json(error.message)
        }
    }
)

router.get(
    '/holiday/someday',
    async (req, res) => {
        try {
            res.send(someDayOff())
        } catch (error) {
            res.status(400).json(error.message)
        }
    }
)

module.exports = router