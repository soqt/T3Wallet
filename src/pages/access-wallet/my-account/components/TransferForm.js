import React from 'react'
import {
  Form, Input, InputNumber, Button, message,
} from 'antd'
import PropTypes from 'prop-types'
import {
  intlShape, FormattedMessage, injectIntl, defineMessages,
} from 'react-intl'
import styles from './TransferForm.less'

const FormItem = Form.Item

const messages = defineMessages({
  fromAddress: {
    id: 'myAccount.fromAddress',
    defaultMessage: 'From Address',
  },
  toAddress: {
    id: 'myAccount.toAddress',
    defaultMessage: 'To Address',
  },
  amountToSend: {
    id: 'myAccount.amountToSend',
    defaultMessage: 'Amount To Send',
  },
  gasLimit: {
    id: 'myAccount.gasLimit',
    defaultMessage: 'Gas Limit',
  },
  sendButton: {
    id: 'myAccount.sendButton',
    defaultMessage: 'Confirm Transcation',
  },
})


const TransferForm = ({
  intl,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
  },
  onSendClick,
  sending,
  curAccount,
}) => {
  const handleSubmit = () => {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        message.error('Please check you input.')
        return
      }
      onSendClick(values)
    })
  }
  const { formatMessage } = intl
  return (
    <Form hideRequiredMark className={styles.transferForm}>
      <FormItem label={formatMessage(messages.fromAddress)}>
        {getFieldDecorator('fromAddress', {
          rules: [{ required: true, type: 'string', message: 'Incorrect Address' }],
          initialValue: curAccount.address,
        })(<Input size="large" disabled />)}
      </FormItem>
      <FormItem label={formatMessage(messages.toAddress)}>
        {getFieldDecorator('toAddress', {
          rules: [{ required: true, type: 'string', message: 'Incorrect Address' }],
        })(<Input size="large" />)}
      </FormItem>
      <FormItem label={formatMessage(messages.amountToSend)}>
        {getFieldDecorator('amountToSend', {
          rules: [{ required: true, type: 'number', message: 'Incorrect Amount To Send' }],
          initialValue: 0,
        })(<InputNumber size="large"
          min={0}
          max={curAccount && curAccount.balance && curAccount.balance || 0}
          step={0.1}
          precision={6}
          addonAfter="ꜩ"
          formatter={value => `${value}ꜩ`}
          parser={value => value.replace('ꜩ', '')}
          style={{ width: '100%' }}
        />)}
      </FormItem>
      <FormItem label="Gas">
        {getFieldDecorator('gas', {
          rules: [{ required: true, type: 'number', message: 'Incorrect Gas Amount' }],
          initialValue: 0,
        })(<InputNumber
          size="large"
          min={0}
          max={curAccount && curAccount.balance && curAccount.balance || 0}
          step={0.001}
          precision={6}
          formatter={value => `${value}ꜩ`}
          parser={value => value.replace('ꜩ', '')}
          style={{ width: '100%' }}
        />)}
      </FormItem>
      <FormItem label={formatMessage(messages.gasLimit)}>
        {getFieldDecorator('gasLimit', {
          rules: [{ required: true, type: 'number', message: 'Incorrect Gas Limit' }],
          initialValue: 2000,
        })(<InputNumber size="large"
          min={0}
          formatter={value => `${value}ꜩ`}
          parser={value => value.replace('ꜩ', '')}
          style={{ width: '100%' }}
        />)}
      </FormItem>

      <Button type="primary" loading={sending} onClick={handleSubmit} className={styles.submitButton}>
        <FormattedMessage {...messages.sendButton} />
      </Button>

    </Form>
  )
}

TransferForm.propTypes = {
  form: PropTypes.object,
  intl: intlShape.isRequired,
  onSendClick: PropTypes.func,
  sending: PropTypes.bool,
  curAccount: PropTypes.object,
}

export default Form.create()(injectIntl(TransferForm))
