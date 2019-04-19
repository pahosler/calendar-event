// 'use-strict'

const app = require('./src/lambda/calendar-events')

app.listen(3000,()=>console.log('local listening on port 3000'))