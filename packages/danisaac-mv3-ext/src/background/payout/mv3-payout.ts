// import fetch from 'node-fetch'
import { serialize } from 'v8'

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
  connection: IlpStream.Connection
): IlpStream.DataAndMoneyStream {
  const startedAt = Date.now()
  let last = startedAt

  const stream = connection.createStream()
  stream.setSendMax(2 ** 55)

  stream.on('error', (error): void => {
    console.log({ error })
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
    console.log({
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
const btpToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJja3g0Y3FsNTVxY3FjMDg4M29xMWJ6d21sIiwidXNlclBlcm1hbmVudElkIjoiMzE1MWQ1ZDMtY2ZmOC00YWY1LTk4OWUtMDYxOTQ3MTdmMjA4IiwidGhyb3VnaHB1dCI6MTAwMDAwLCJhZ2ciOjQ1MDAwMDAwMDAsImN1cnJlbmN5IjoiVVNEIiwic2NhbGUiOjksImlhdCI6MTY1MDYwNTUyNSwiZXhwIjoxNjUwNjA5MTI1fQ.WdDHGyj5zapFDtOeiD4MAIMA8-uZ-npOvcCwofaQcls'

export async function payout(
  monetizeUrl: string,
  dbg: typeof console.log
): Promise<void> {
  const plugin = new IlpPluginBtp({
    server: `${btpBase}/btp?tier=100000`,
    btpToken
  })
  const spspUrl = pointerToUrl(monetizeUrl)
  const monetizationId = uuid.v4()

  const details = await getPaymentDetails(spspUrl, monetizationId)
  dbg('received details', { details })

  dbg('connecting plugin')
  await plugin.connect()
  dbg('connected plugin')

  const connection = await IlpStream.createConnection({
    plugin,
    destinationAccount: details.destination_account,
    sharedSecret: Buffer.from(details.shared_secret, 'base64')
  }).catch(err => {
    dbg(err)
  })
  dbg('connection created')

  return

  // connection.on('close', () => {
  //     console.log('connection close')
  // })

  // connection.on('error', () => {
  //     console.log('connection error')
  // })

  // await connection.connect()
  // console.log("connected")

  // startStream(`main`, connection)
}

// might need to inject setImmediate into document (injection.js)
