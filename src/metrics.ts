import WriteStream from 'level-ws';
import { LevelDB } from './leveldb'


export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }

  getMetrics() {
    return ('Timestamp : ' + this.timestamp + ', value : ' + this.value + '.')
  }
}

export class MetricsHandler {

  public db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public save(key: number, metrics: Metric, callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    stream.write({ key: `metric:${key}:${metrics.timestamp}`, value: metrics.value })
    stream.end()
  }

  public getAll(
    callback: (error: Error | null, result: any | null) => void
  ) {
    // Read
    let metrics: Metric[] = []
    this.db.createReadStream()
      .on('data', function (data) {
        let timestamp: string = data.key.split(':')[2]
        let metric: Metric = new Metric(timestamp, data.value);
        metrics.push(metric);
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, null)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        callback(null, metrics)
        console.log('Stream ended')
      })
  }

  public getOne(key: any,
    callback: (error: Error | null, result: any | null) => void
  ) {
    // Read
    let metrics: Metric[] = []
    this.db.createReadStream()
      .on('data', function (data) {
        let id: string = data.key.split(':')[1]
        let timestamp: string = data.key.split(':')[2]
        let metric: Metric = new Metric(timestamp, data.value);
        if (key == id) {
          metrics.push(metric);
        }
      })

      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, null)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        callback(null, metrics)
        console.log('Stream ended')
      })
  }

  public deleteOne(
    key: string,
    callback: (error: Error | null, result: any | null) => void
  ) {
    let db = this.db
    this.db.createReadStream()
      .on('data', function (data) {
        if (data.key == 'metric:'+key) {
          db.del(data.key);
        }
      })

      .on('error', function (err) {
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
      })
  }

  /*static get(callback: (error: Error | null, result?: Metric[]) => void) {
    const result = [
      new Metric('2013-11-04 14:00 UTC', 12),
      new Metric('2013-11-04 14:30 UTC', 15)
    ]
    callback(null, result)
  }*/
}
