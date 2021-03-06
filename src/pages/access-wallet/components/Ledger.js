import React from 'react'
import {
  Button, Icon, Row, Col,
} from 'antd'
import {
  intlShape,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl'
import PropTypes from 'prop-types'
import LedgerPathSelectionModal from './LedgerPathSelectionModal'
import styles from './styles.less'

const messages = defineMessages({
  ledgerHardwareWallet: {
    id: 'accessWallet.ledgerHardwareWallet',
    defaultMessage: 'Ledger Hardware Wallet',
  },
  connectToLedger: {
    id: 'accessWallet.connectToLedger',
    defaultMessage: 'Connect to Ledger Wallet',
  },
  recommendedWay: {
    id: 'accessWallet.recommendedWay',
    defineMessages: 'Recommended way to interact with Tezos blockchain',
  },
  errorMessage: {
    id: 'accessWallet.errorMessage',
    defaultMessage: 'Place check your input',
  },
})

const Ledger = ({
  intl, openModal, closeModal, modalVisible, signRequiredTextVisible, onUnlock,
}) => {
  return (
    <div>
      <h2 className={styles.title}>
        <FormattedMessage {...messages.ledgerHardwareWallet} />
      </h2>
      <Col className={styles.body} type="flex">
        <Row type="flex" style={{ alignItems: 'center' }}>
          <Icon type="safety" theme="outlined" style={{ color: 'green', marginRight: '5px' }} />
          <span><FormattedMessage {...messages.recommendedWay} /></span>
        </Row>
      </Col>
      <Button
        type="primary"
        size="large"
        className={styles.button}
        onClick={openModal}
      >
        <FormattedMessage {...messages.connectToLedger} />
      </Button>
      <LedgerPathSelectionModal
        visible={modalVisible}
        signRequiredTextVisible={signRequiredTextVisible}
        intl={intl}
        onConfirm={onUnlock}
        onClose={closeModal}
      />
    </div>
  )
}

Ledger.propTypes = {
  intl: intlShape.isRequired,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
  modalVisible: PropTypes.bool,
  signRequiredTextVisible: PropTypes.bool,
  onUnlock: PropTypes.func,
}

export default injectIntl(Ledger)
