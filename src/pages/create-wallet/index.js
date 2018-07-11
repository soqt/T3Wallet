import React from 'react'
import { connect } from 'dva'
import {
  Card, Button, Steps, message,
} from 'antd'
import { Page } from 'components'
import PropTypes from 'prop-types'
import {
  intlShape, injectIntl, defineMessages, FormattedMessage,
} from 'react-intl'
import { MnemonicDisplay, MnemonicVerify } from './components'
import styles from './index.less'

const messages = defineMessages({
  title: {
    id: 'tabs.createWallet',
    defaultMessage: 'Create Wallet',
    desciption: 'create wallet card title',
  },
  desciption: {
    id: 'createWallet.description',
    defaultMessage: "We don't store your key, keep them safe",
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
    id: 'createWallet.confirm',
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


  render () {
    const {
      dispatch, loading, intl, curStep, mnemonic, inputWords, leftWords,
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
                <Button type="primary" icon="file-add" size="large" className={styles.button} onClick={() => this._createWallet()}>
                  <FormattedMessage {...messages.title} />
                </Button>
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
                  <Button type="primary" size="large" className={styles.button} onClick={() => message.success('Processing complete!')}>
                    <FormattedMessage {...messages.confirm} />
                  </Button>
                  <br />
                  {prevButton}
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

  _createWallet = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'createWallet/createWallet',
    })
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
}

const mapStateToProps = (state) => {
  return {
    createWallet: state.createWallet,
    curStep: state.createWallet.curStep,
    mnemonic: state.createWallet.mnemonic,
    inputWords: state.createWallet.inputWords,
    leftWords: state.createWallet.leftWords,
  }
}

export default connect(mapStateToProps)(injectIntl(CreateWallet))
