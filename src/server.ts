import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import bodyparser = require('body-parser')

const app = express()

const port: string = process.env.PORT || '8080'

const path = require('path')

app.set('views', __dirname + "/views")
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.get('/',
  (req, res) => res.render('hello.ejs', { metrics: MetricsHandler })
)

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.get('/metrics', (req: any, res: any) => {
  dbMet.getAll((err: Error | null, result: any) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.getOne(req.params.id, (err: Error | null, result: any) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

app.get('/metrics/delete/:key', (req: any, res: any) => {
  dbMet.deleteOne(req.params.key, (err: Error | null, result: any) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on port ${port}`)
})