import React from 'react'
import { connect } from 'dva'
import { Card, Tabs } from 'antd'
import { Page } from 'components'
import {
  intlShape,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl'
import PropTypes from 'prop-types'
import {
  Mnemonic, Ledger, Fundraiser, PrivateKey,
} from './components'
import styles from './index.less'

const messages = defineMessages({
  title: {
    id: 'accessWallet.title',
    defaultMessage: 'How do you want to access your wallet',
  },
  ledger: {
    id: 'accessWallet.ledgerWallet',
    defaultMessage: 'Ledger Wallet',
  },
  mnemonic: {
    id: 'accessWallet.mnemonic',
    defaultMessage: 'Mnemonic Phrase',
  },
  fundraiser: {
    id: 'accessWallet.fundraiser',
    defaultMessage: 'Fundraiser Wallet',
  },
  privateKey: {
    id: 'accessWallet.privateKey',
    defaultMessage: 'Private Key',
  },
})

class AccessWallet extends React.Component {
  constructor () {
    super()
    this.state = {
      tabPosition: 'left',
    }
  }

  componentDidMount () {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateDimensions)
  };

  updateDimensions = () => {
    if (window.innerWidth < 768) {
      this.setState({ tabPosition: 'top' })
    } else {
      this.setState({ tabPosition: 'left' })
    }
  };

  render () {
    const { intl, loading, accessWallet } = this.props
    const { formatMessage } = intl
    const { tabPosition } = this.state
    const { ledgerModalVisible, ledgerModalSignRequiredTextVisible } = accessWallet
    return (
      <Page loading={loading}>
        <h1>
          <FormattedMessage id="myAccount.title" defaultMessage="Send Token & Delegation" />
        </h1>
        <Card loading={loading} bordered={false} className={styles.container}>
          <div style={{ marginBottom: 16 }}>
            <FormattedMessage {...messages.title} />
          </div>
          <div>
            <Tabs tabPosition={tabPosition} size="large" defaultActiveKey={null}>
              <Tabs.TabPane tab={formatMessage(messages.ledger)} key="1">
                <Ledger
                  intl={intl}
                  openModal={this._openLedgerModal}
                  closeModal={this._closeLedgerModal}
                  modalVisible={ledgerModalVisible}
                  onUnlock={this._onLedgerConnect}
                  signRequiredTextVisible={ledgerModalSignRequiredTextVisible}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={formatMessage(messages.mnemonic)} key="2">
                <Mnemonic onUnlock={this._onUnlockClick} />
              </Tabs.TabPane>
              <Tabs.TabPane tab={formatMessage(messages.fundraiser)} key="3">
                <Fundraiser onUnlock={this._onUnlockClick} />
              </Tabs.TabPane>
              <Tabs.TabPane tab={formatMessage(messages.privateKey)} key="4">
                <PrivateKey onUnlock={this._onUnlockClick} />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Card>
      </Page>
    )
  }

  _openLedgerModal = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'accessWallet/openLedgerModal',
    })
  };

  _closeLedgerModal = () => {
    const { dispatch } = this.props
    dispatch({ type: 'accessWallet/toggleLedgerModal', payload: false })
  };

  _onUnlockClick = (payload) => {
    const { dispatch } = this.props
    dispatch({
      type: 'accessWallet/unlockWallet',
      payload, // {walletType: '', payload: {} }
    })
  };

  _onLedgerConnect = (payload) => {
    const { dispatch } = this.props
    const { path } = payload
    dispatch({ type: 'accessWallet/unlockWallet', payload: { walletType: 'ledger', payload: { path } } })
  };
}

AccessWallet.propTypes = {
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  accessWallet: PropTypes.object,
  intl: intlShape.isRequired,
}

const mapStateToProps = (state) => {
  return {
    accessWallet: state.accessWallet,
  }
}

export default connect(mapStateToProps)(injectIntl(AccessWallet))
