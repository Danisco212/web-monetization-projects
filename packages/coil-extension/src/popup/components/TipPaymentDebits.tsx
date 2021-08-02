import React, { useMemo } from 'react'
import { styled, Box } from '@material-ui/core'

import { Colors } from '../../shared-theme/colors'
import { useStore } from '../context/storeContext'

import { CreditCardIcon } from './icons/CreditCardIcon'

//
// Styles
//
const PaymentDebitsWrapper = styled('div')({
  width: '100%'
})

const PaymentDebit = styled('div')({
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: Colors.Grey700,
  fontWeight: 'normal'
})

const PaymentMethod = styled('div')({
  display: 'flex',
  alignItems: 'center',
  '& > img': {
    maxHeight: '24px',
    maxWidth: '32px',
    marginRight: '8px'
  }
})

const Dot = styled('div')({
  backgroundColor: Colors.Grey700,
  width: '5px',
  height: '5px',
  borderRadius: '5px',
  marginRight: '2px',
  '&:first-of-type': {
    marginLeft: '8px'
  },
  '&:last-of-type': {
    marginRight: '4px'
  }
})

//
// Models
//
interface ITipPaymentDebits {
  tipCreditCharge: number
  creditCardCharge: number
}

//
// Component
//
export const TipPaymentDebits = (
  props: ITipPaymentDebits
): React.ReactElement => {
  const { tipCreditCharge, creditCardCharge } = props
  const { user } = useStore()

  const creditCard = useMemo(() => {
    return user?.paymentMethods?.find(method => {
      if (method?.type === 'stripe') {
        return method
      }
    })
  }, [user])

  return (
    <PaymentDebitsWrapper>
      {tipCreditCharge > 0 && ( // show the tip credits only if they have been charged
        <PaymentDebit>
          <PaymentMethod>
            <img src='/res/CoilLogo.svg' alt='coil icon' /> Tip credits
          </PaymentMethod>
          <div>-${tipCreditCharge.toFixed(2)}</div>
        </PaymentDebit>
      )}
      {creditCardCharge > 0 && ( // show the credit card only if it has been charged
        <PaymentDebit>
          <PaymentMethod>
            <CreditCardIcon provider={creditCard?.details?.brandCode} />
            <Dot />
            <Dot />
            <Dot />
            <Dot />
            {creditCard?.details?.last4}
          </PaymentMethod>
          <div>-${creditCardCharge.toFixed(2)}</div>
        </PaymentDebit>
      )}
    </PaymentDebitsWrapper>
  )
}
