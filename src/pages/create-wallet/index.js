import React from 'react'
import { connect } from 'dva'
import { Page } from 'components'
import PropTypes from 'prop-types'
import {
  intlShape, injectIntl, defineMessages, FormattedMessage,
} from 'react-intl'
import {
  Card, Button, Steps, Icon, Alert,
} from 'antd'
import router from 'umi/router'
import { MnemonicDisplay, MnemonicVerify, PasswordForm } from './components'
import styles from './index.less'

const messages = defineMessages({
  title: {
    id: 'tabs.createWallet',
    defaultMessage: 'Create Wallet',
    desciption: 'create wallet card title',
  },
  passwordTip: {
    id: 'createWallet.passwordTip',
    defaultMessage: 'This password is part of your private keys. Do not enter if you hope to recover your wallet only using Mnemonic words!',
  },
  optionalPassword: {
    id: 'createWallet.optionalPassword',
    defaultMessage: 'Optional Password',
  },
  next: {
    id: 'createWallet.nextStep',
    defaultMessage: 'Next',
  },
  prev: {
    id: 'createWallet.prevStep',
    defaultMessage: 'Previous step',
  },
  confirm: {
    id: 'confirm',
    defaultMessage: 'Confirm',
  },
  generateMnemonic: {
    id: 'createWallet.generateMnemonic',
    defaultMessage: 'Generate Mnemonic',
  },
  backup: {
    id: 'createWallet.backup',
    defaultMessage: 'Backup',
  },
  verify: {
    id: 'createWallet.verify',
    defaultMessage: 'Verify',
  },
  complete: {
    id: 'createWallet.complete',
    defaultMessage: 'Complete',
  },
  saveMnemonic: {
    id: 'createWallet.saveMnemonic',
    defaultMessage: 'Save your {mnemonic}',
  },
  mnemonicPhrase: {
    id: 'createWallet.mnemonicPhrase',
    defaultMessage: 'Mnemonic Phrase',
  },
  verifyMnemonic: {
    id: 'createWallet.verifyMnemonic',
    defaultMessage: 'Verify your {mnemonic}',
  },
  successMessage: {
    id: 'createWallet.successMessage',
    defaultMessage: 'Create Wallet Success!',
  },
  accessWallet: {
    id: 'createWallet.accessWallet',
    defaultMessage: 'Access My Tezos Wallet',
  },
  generateNew: {
    id: 'createWallet.generateNew',
    defaultMessage: 'Generate Another Wallet',
  },
  reenterPassword: {
    id: 'createWallet.reenterPassword',
    defaultMessage: 'Re-enter password if you set',
  },
  verifyError: {
    id: 'createWallet.verifyError',
    defaultMessage: 'Mnemonic Words or Password not match',
  },
})

const steps = [{
  title: <FormattedMessage {...messages.generateMnemonic} />,
  content: 'Generate Mnemonic',
}, {
  title: <FormattedMessage {...messages.backup} />,
  content: 'Write Down on a paper',
}, {
  title: <FormattedMessage {...messages.verify} />,
  content: 'Verify your Mnemonic',
}, {
  title: <FormattedMessage {...messages.complete} />,
  content: 'Complete',
}]

class CreateWallet extends React.Component {
  _next = () => {
    const { dispatch, curStep } = this.props
    dispatch({ type: 'createWallet/updateStep', step: curStep + 1 })
  }

  _prev = () => {
    const { dispatch, curStep } = this.props
    dispatch({ type: 'createWallet/updateStep', step: curStep - 1 })
  }

  _createWallet = (payload) => {
    const { dispatch } = this.props
    dispatch({
      type: 'createWallet/generateMnemonic',
      payload,
    })
  }

  _verifySeed = (values) => {
    const { dispatch } = this.props
    dispatch({
      type: 'createWallet/verifySeed',
      payload: values,
    })
  }

  _resetProcess = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'createWallet/resetState',
    })
  }

  _redirectToAccessWallet = () => {
    router.push('/access-wallet')
    const { dispatch } = this.props
    dispatch({
      type: 'createWallet/resetState',
    })
  }

  render () {
    const {
      dispatch, loading, intl, curStep, mnemonic, inputWords, leftWords, verifyError,
    } = this.props
    const { formatMessage } = intl

    const nnemonicVerifyProps = {
      inputWords,
      leftWords,
      onInputWordClick (word) {
        dispatch({
          type: 'createWallet/removeInputWord',
          payload: word,
        })
      },
      onLeftWordClick (word) {
        dispatch({
          type: 'createWallet/removeLeftWord',
          payload: word,
        })
      },
    }

    let prevButton = (
      <Button className={styles.prevButton} size="large" onClick={() => this._prev()}>
        <FormattedMessage {...messages.prev} />
      </Button>
    )
    return (
      <Page loading={loading} className={styles.cardContaner}>
        <Card loading={loading} bordered={false} title={formatMessage(messages.title)}>
          {
              curStep === 0
              && (
              <div className={styles.container}>
                <h2 className={styles.title}>
                  <FormattedMessage
                    {...messages.title}
                  />
                </h2>
                <h4>
                  <FormattedMessage {...messages.optionalPassword} />
                </h4>
                <PasswordForm autoFocus onSubmit={this._createWallet} buttonIcon="file-add" buttonText={formatMessage(messages.title)} />
                <div className={styles.passwordTip}>
                  <Alert message={formatMessage(messages.passwordTip)} type="warning" />
                </div>
                </div>
              )
            }
          {
              curStep === 1
              && (
                <div className={styles.container}>
                  <h2 className={styles.title}>
                    <FormattedMessage
                      {...messages.saveMnemonic}
                      values={{
                        mnemonic: (
                          <span className={styles.textHightlight}>
                            <FormattedMessage {...messages.mnemonicPhrase} />
                          </span>
                        ),
                      }}
                    />
                  </h2>
                  <MnemonicDisplay mnemonic={mnemonic} />
                  <br />
                  <Button type="primary" size="large" className={styles.button} onClick={() => this._next()}>
                    <FormattedMessage {...messages.next} />
                  </Button>
                  <br />
                  {prevButton}

                </div>
              )
            }
          {
              curStep === 2
              && (
                <div className={styles.container}>
                  <h2 className={styles.title}>
                    <FormattedMessage
                      {...messages.verifyMnemonic}
                      values={{
                        mnemonic: (
                          <span className={styles.textHightlight}>
                            <FormattedMessage {...messages.mnemonicPhrase} />
                          </span>
                        ),
                      }}
                    />
                  </h2>

                  <MnemonicVerify {...nnemonicVerifyProps} />
                  <br />
                  <br />
                  {verifyError ? <Alert message={formatMessage(messages.verifyError)} type="error" /> : null}
                  <PasswordForm
                    placeholder={formatMessage(messages.reenterPassword)}
                    buttonText={formatMessage(messages.verify)}
                    onSubmit={this._verifySeed}
                  />
                  <br />
                  {prevButton}
                </div>
              )
            }
          {
            curStep === 3
            && (
              <div className={styles.container}>
                <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon type="check" style={{ color: 'green', fontSize: 40, marginRight: '10px' }} />
                  <FormattedMessage
                    {...messages.successMessage}
                  />
                </h2>
                <Button type="primary" size="large" className={styles.button} onClick={() => this._redirectToAccessWallet()}>
                  <FormattedMessage {...messages.accessWallet} />
                </Button>
                <Button size="large" className={styles.button} style={{ marginTop: '20px' }} onClick={() => this._resetProcess()}>
                  <FormattedMessage {...messages.generateNew} />
                </Button>
                <br />
              </div>
            )
          }
          <br />
          <br />
          <br />
          <Steps current={curStep}>
            {steps.map((item, index) => <Steps.Step key={index} title={item.title} />)}
          </Steps>
        </Card>
      </Page>
    )
  }
}

CreateWallet.propTypes = {
  loading: PropTypes.bool,
  intl: intlShape.isRequired,
  curStep: PropTypes.number,
  dispatch: PropTypes.func,
  mnemonic: PropTypes.array,
  inputWords: PropTypes.array,
  leftWords: PropTypes.array,
  verifyError: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    createWallet: state.createWallet,
    curStep: state.createWallet.curStep,
    mnemonic: state.createWallet.mnemonic,
    inputWords: state.createWallet.inputWords,
    leftWords: state.createWallet.leftWords,
    verifyError: state.createWallet.verifyError,
  }
}

export default connect(mapStateToProps)(injectIntl(CreateWallet))
