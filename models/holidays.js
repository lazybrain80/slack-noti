'use strict'

module.exports = (sequelize, DataType) => {
    return [
        sequelize.define(
            'HOLIDAYS',
            {
                DATE: { type: DataType.STRING(10), primaryKey: true },
                NAME: DataType.STRING(32),
            },
            { timestamps: false }
        ),
    ]
}
