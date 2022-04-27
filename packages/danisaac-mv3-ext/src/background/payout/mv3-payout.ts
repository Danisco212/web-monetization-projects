// import fetch from 'node-fetch'

import IlpPluginBtp from 'ilp-plugin-btp'
import * as IlpStream from 'ilp-protocol-stream'
import * as uuid from 'uuid'

// hard coded variables
export const COIL_DOMAIN = 'https://coil.com'

const pointerToUrl = (url: string) => url.replace(/^\$/, 'https://')

interface SPSPResponse {
  destination_account: string
  shared_secret: string
}

async function getPaymentDetails(
  paymentPointerUrl: string,
  monetizationId: string
): Promise<SPSPResponse> {
  const response: any = await fetch(paymentPointerUrl, {
    headers: {
      Accept: 'application/spsp4+json',
      // DEPRECATED: this header is unnecessary with STREAM receipts
      'Web-Monetization-Id': monetizationId
    }
  })
  return response.json()
}

// payment logic - cant reach method yet
function startStream(
  id: number | string,
  connection: IlpStream.Connection,
  dbg: typeof console.log
): IlpStream.DataAndMoneyStream {
  const startedAt = Date.now()
  let last = startedAt

  const stream = connection.createStream()
  stream.setSendMax(2 ** 55)

  stream.on('error', (error): void => {
    dbg({ error })
  })

  let totalPackets = 0

  stream.on('outgoing_money', (sentAmount): void => {
    const msSinceLastOutgoing = Date.now() - last
    last = Date.now()

    if (connection.sourceAssetCode !== 'USD') {
      throw new Error('expecting USD')
    }

    totalPackets++

    const dollarsSent =
      parseFloat(sentAmount) / Math.pow(10, connection.sourceAssetScale)
    const totalDollarsSent =
      parseFloat(stream.totalSent) / Math.pow(10, connection.sourceAssetScale)
    const cents = totalDollarsSent * 100
    const msPassed = last - startedAt
    const minutesPerCent = msPassed / (60 * 1000) / cents
    const averageMsPerPacket = msPassed / totalPackets

    const totalTimeSeconds = msPassed / 1000
    dbg({
      streamId: id,
      dollarsSent,
      totalDollarsSent,
      raw: {
        assetCode: connection.sourceAssetCode,
        sentAmount,
        assetScale: connection.sourceAssetScale
      },
      minutesPerCent,
      totalTimeSeconds,
      msSinceLastOutgoing,
      averageMsPerPacket
    })
  })
  return stream
}

const btpBase = COIL_DOMAIN.replace(/^http/, 'btp+ws')

// hard coded token for test
// generated from yarn ts-node /Users/danielisaac/Desktop/Coil/coil_extension/packages/coil-oauth-scripts/src/bin/coil-it.ts
// const btpToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJja3g0Y3FsNTVxY3FjMDg4M29xMWJ6d21sIiwidXNlclBlcm1hbmVudElkIjoiMzE1MWQ1ZDMtY2ZmOC00YWY1LTk4OWUtMDYxOTQ3MTdmMjA4IiwidGhyb3VnaHB1dCI6MTAwMDAwLCJhZ2ciOjQ1MDAwMDAwMDAsImN1cnJlbmN5IjoiVVNEIiwic2NhbGUiOjksImlhdCI6MTY1MTA1NzgyMSwiZXhwIjoxNjUxMDYxNDIxfQ.LcFqZ-WEk6NHbqM9JRXTs-BGoQTvGa5ynncR7NqoJOk'

export async function payout(
  monetizeUrl: string,
  dbg: typeof console.log,
  btpToken: string
): Promise<any> {
  // const { token, btpToken } = await loginToCoil(dbg, true, "")

  // dbg('logged into coil', { token, btpToken })
  const plugin = new IlpPluginBtp({
    server: `${btpBase}/btp?tier=100000`,
    btpToken
  })
  const spspUrl = pointerToUrl(monetizeUrl)
  const monetizationId = uuid.v4()

  dbg('receiving details')

  const details = await getPaymentDetails(spspUrl, monetizationId)
  dbg('received details', { details })

  dbg('connecting plugin')
  await plugin.connect()
  dbg('connected plugin')

  const connection = await IlpStream.createConnection({
    plugin,
    destinationAccount: details.destination_account,
    sharedSecret: Buffer.from(details.shared_secret, 'base64')
  })
  dbg('connection created')

  connection.on('close', () => {
    dbg('connection close')
  })

  connection.on('error', () => {
    dbg('connection error')
  })

  dbg('connecting with connection object')
  await connection.connect()
  dbg('connected')

  startStream(`main`, connection, dbg)
  return connection
}

// might need to inject setImmediate into document (injection.js)
