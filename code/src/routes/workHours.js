const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { authMiddleware } = require('../middleware/auth')

// 所有路由都需要认证
router.use(authMiddleware)

// 工时打卡
router.post('/punch', async (req, res) => {
    const { workDate, hours, hourlyRate, workType } = req.body
    const userId = req.user.id

    try {
        if (!workDate || !hours || !hourlyRate || !workType) {
            return res.json({
                code: -1,
                message: '所有字段都不能为空',
                data: null
            })
        }

        // 检查是否已存在该日期的打卡记录
        const [existingRecord] = await pool.query(
            'SELECT id FROM work_hours WHERE user_id = ? AND work_date = ?',
            [userId, workDate]
        )

        if (existingRecord.length > 0) {
            return res.json({
                code: -1,
                message: '该日期已存在打卡记录',
                data: null
            })
        }

        // 计算收入
        const income = hours * hourlyRate

        const [result] = await pool.query(
            `INSERT INTO work_hours 
             (user_id, work_date, hours, hourly_rate, work_type, income) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, workDate, hours, hourlyRate, workType, income]
        )

        res.json({
            code: 0,
            message: '打卡成功',
            data: {
                id: result.insertId,
                workDate,
                hours,
                income
            }
        })
    } catch (err) {
        console.error('Punch error:', err)
        res.json({
            code: 500,
            message: '打卡失败',
            data: null
        })
    }
})

// 获取月度统计
router.get('/monthly-stats', async (req, res) => {
    const { year, month } = req.query
    const userId = req.user.id

    try {
        if (!year || !month) {
            return res.json({
                code: -1,
                message: '年份和月份不能为空',
                data: null
            })
        }

        const [records] = await pool.query(
            `SELECT * FROM work_hours 
             WHERE user_id = ? 
             AND YEAR(work_date) = ? 
             AND MONTH(work_date) = ?`,
            [userId, year, month]
        )

        const stats = {
            totalHours: 0,
            regularHours: 0,
            overtimeHours: 0,
            subsidyAmount: 0,
            monthlyIncome: 0,
            dailyStats: {}
        }

        records.forEach(record => {
            if (record.work_type === 'regular') {
                stats.regularHours += record.hours
            } else {
                stats.overtimeHours += record.hours
            }
            stats.totalHours += record.hours
            stats.monthlyIncome += record.income

            stats.dailyStats[record.work_date] = {
                hours: record.hours,
                income: record.income,
                workType: record.work_type
            }
        })

        res.json({
            code: 0,
            message: '获取统计数据成功',
            data: { stats }
        })
    } catch (err) {
        console.error('Get monthly stats error:', err)
        res.json({
            code: 500,
            message: '获取统计数据失败',
            data: null
        })
    }
})

// 获取工时配置
router.get('/config', async (req, res) => {
    const userId = req.user.id

    try {
        const [configs] = await pool.query(
            'SELECT * FROM work_hour_config WHERE user_id = ?',
            [userId]
        )

        if (configs.length === 0) {
            // 如果没有配置，创建默认配置
            const [result] = await pool.query(
                `INSERT INTO work_hour_config 
                 (user_id, default_hours, default_hourly_rate, overtime_rate) 
                 VALUES (?, ?, ?, ?)`,
                [userId, 8, 0, 1.5]
            )

            res.json({
                code: 0,
                message: '获取配置成功',
                data: {
                    config: {
                        id: result.insertId,
                        defaultHours: 8,
                        defaultHourlyRate: 0,
                        overtimeRate: 1.5
                    }
                }
            })
        } else {
            res.json({
                code: 0,
                message: '获取配置成功',
                data: {
                    config: {
                        id: configs[0].id,
                        defaultHours: configs[0].default_hours,
                        defaultHourlyRate: configs[0].default_hourly_rate,
                        overtimeRate: configs[0].overtime_rate
                    }
                }
            })
        }
    } catch (err) {
        console.error('Get config error:', err)
        res.json({
            code: 500,
            message: '获取配置失败',
            data: null
        })
    }
})

// 更新工时配置
router.post('/config', async (req, res) => {
    const { defaultHours, defaultHourlyRate, overtimeRate } = req.body
    const userId = req.user.id

    try {
        if (!defaultHours || !defaultHourlyRate || !overtimeRate) {
            return res.json({
                code: -1,
                message: '所有配置项都不能为空',
                data: null
            })
        }

        const [result] = await pool.query(
            `UPDATE work_hour_config 
             SET default_hours = ?, default_hourly_rate = ?, overtime_rate = ? 
             WHERE user_id = ?`,
            [defaultHours, defaultHourlyRate, overtimeRate, userId]
        )

        if (result.affectedRows === 0) {
            return res.json({
                code: -1,
                message: '更新配置失败',
                data: null
            })
        }

        res.json({
            code: 0,
            message: '更新配置成功',
            data: {
                config: {
                    defaultHours,
                    defaultHourlyRate,
                    overtimeRate
                }
            }
        })
    } catch (err) {
        console.error('Update config error:', err)
        res.json({
            code: 500,
            message: '更新配置失败',
            data: null
        })
    }
})

// 删除工时记录
router.delete('/:id', async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
        // 检查记录是否存在且属于当前用户
        const [records] = await pool.query(
            'SELECT id FROM work_hours WHERE id = ? AND user_id = ?',
            [id, userId]
        )

        if (records.length === 0) {
            return res.json({
                code: -1,
                message: '记录不存在或无权删除',
                data: null
            })
        }

        const [result] = await pool.query(
            'DELETE FROM work_hours WHERE id = ? AND user_id = ?',
            [id, userId]
        )

        if (result.affectedRows === 0) {
            return res.json({
                code: -1,
                message: '删除失败',
                data: null
            })
        }

        res.json({
            code: 0,
            message: '删除成功',
            data: null
        })
    } catch (err) {
        console.error('Delete work hour error:', err)
        res.json({
            code: 500,
            message: '删除失败',
            data: null
        })
    }
})

module.exports = router 