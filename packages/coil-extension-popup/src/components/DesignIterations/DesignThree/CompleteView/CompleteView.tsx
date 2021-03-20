import React, { useEffect, useRef } from 'react'
import { styled, Box, Button, makeStyles } from '@material-ui/core'
import { Colors } from '@coil/extension-popup/theme'
import * as actions from '@coil/extension-popup/redux/actions'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { IRootState } from '@coil/extension-popup/redux/models'
import MoneyRain from '@coil/extension-popup/assets/images/MoneyRain.gif'
import { ProcessStep } from '@coil/extension-popup/types'
import { PaymentDebits } from '@coil/extension-popup/components'
import { getPageFaviconPath } from '@coil/extension-popup/utils/get-page-data.util'

//
// Styles
//
const ExtensionBodyWrapper = styled('div')(
  ({ random }: { random: number }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 24px 0px 24px',
    minHeight: '455px', // based on the first views body height to keep consistent
    backgroundImage: `url("${MoneyRain}?${random}")`, //* the 'random' prop is needed so the gif animation replays every load
    backgroundSize: '110% 110%',
    backgroundRepeat: 'no-repeat',
    textAlign: 'center',
    color: Colors.Grey800,
    fontWeight: 'normal',
    '& > div > img': {
      width: '32px',
      height: '32px',
      marginBottom: '12px'
    }
  })
)

const Amount = styled('div')({
  height: '80px',
  color: Colors.Grey800,
  textAlign: 'center',
  fontSize: '80px',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 'bold',
  letterSpacing: '0px',
  lineHeight: '80px'
})

const ProgressBar = styled('div')({
  position: 'relative',
  width: '100%',
  height: '4px',
  backgroundColor: Colors.Grey800
})

const Fill = styled('div')({
  position: 'absolute',
  zIndex: 8,
  width: '100%',
  top: 0,
  bottom: 0,
  right: 0,
  backgroundColor: Colors.Grey100
})

//* cannot get the keyframes to work with 'styled' syntax
const useStyles = makeStyles({
  fill: {
    animation: `$fill 5s linear`
  },
  '@keyframes fill': {
    from: { width: '0%' },
    to: { width: '100%' }
  }
})

//
// Component
//
export const CompleteView = (): React.ReactElement => {
  const { extensionIsOpen, currentTipAmount } = useSelector(
    (state: IRootState) => state,
    shallowEqual
  )
  const dispatch = useDispatch()
  const classes = useStyles()
  const extensionIsOpenRef = useRef(extensionIsOpen)

  let closeTimeout: NodeJS.Timeout
  useEffect(() => {
    closeTimeout = setTimeout(handleClose, 5000)
    return () => {
      clearTimeout(closeTimeout)
    }
  }, [])

  useEffect(() => {
    // Ensure state propagates to event handler
    extensionIsOpenRef.current = extensionIsOpen
  }, [extensionIsOpen])

  const handleClose = () => {
    if (extensionIsOpenRef.current) dispatch(actions.toggle_extension())
  }

  const handleUndo = () => {
    // clear timeout
    clearTimeout(closeTimeout)

    // reset current tip amount to default -- commented out per @Fabian
    // dispatch(actions.set_current_tip_amount(minimumTipLimit));

    // reset to tip view
    dispatch(actions.set_process_step(ProcessStep.Tip))
  }

  return (
    <>
      <ExtensionBodyWrapper random={Math.random()}>
        <Box fontSize='18px'>
          <img src={getPageFaviconPath()} alt='site logo' />
          <div>Thanks for the donation!</div>
        </Box>
        <Box my='30px'>
          <Amount>${currentTipAmount}</Amount>
        </Box>
        <Box>
          <PaymentDebits />
        </Box>

        <Box
          mx='-24px'
          flex='1'
          display='flex'
          flexDirection='column'
          justifyContent='flex-end'
        >
          <Box mb='5px'>
            <Button onClick={handleUndo}>Undo</Button>
          </Box>
          <ProgressBar>
            <Fill className={classes.fill} />
          </ProgressBar>
        </Box>
      </ExtensionBodyWrapper>
    </>
  )
}