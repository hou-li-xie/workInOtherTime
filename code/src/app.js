const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user')
const workHoursRouter = require('./routes/workHours')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/user', userRouter)
app.use('/api/work-hours', workHoursRouter)

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.json({
        code: 500,
        message: '服务器内部错误',
        data: null
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
}) 