'use strict'

const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
var db = {}

var sequelize = new Sequelize(
    __config.mysql.db,
    __config.mysql.usr,
    __config.mysql.pwd,
    {
        host: __config.mysql.host,
        port: __config.mysql.port,
        dialect: 'mysql',
        define: { freezeTableName: true },
        logging: false,
        timezone: '+09:00',
    }
)

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        )
    })
    .forEach(file => {
        const models = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        )

        models.forEach(model => {
            db[model.name] = model
        })
    })

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
