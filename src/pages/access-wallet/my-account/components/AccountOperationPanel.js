import React from 'react'
import {
  Card, Tabs,
} from 'antd'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import TransferForm from './TransferForm'
import DelegateForm from './DelegateForm'

const AccountOperationPanel = ({
  onSendClick, onSetDelegateClick, sending, delegating, accounts, activeAccountIndex,
}) => {
  const curAccount = accounts[activeAccountIndex]
  return (
    <Card style={{ width: '100%' }}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={<FormattedMessage id="myAccount.transfer" defaultMessage="Transfer" />} key="1">
          <TransferForm
            onSendClick={onSendClick}
            sending={sending}
            accounts={accounts}
            curAccount={curAccount}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<FormattedMessage id="myAccount.delegate" defaultMessage="Delegate" />}
          disabled={typeof curAccount === 'undefined' || curAccount && curAccount.kind !== 'origination'}
          key="2"
        >
          <DelegateForm
            onSetDelegateClick={onSetDelegateClick}
            delegating={delegating}
            disabled={typeof curAccount === 'undefined' || curAccount && curAccount.kind !== 'origination'}
            accounts={accounts}
          />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}

AccountOperationPanel.propTypes = {
  onSendClick: PropTypes.func,
  onSetDelegateClick: PropTypes.func,
  sending: PropTypes.bool,
  delegating: PropTypes.bool,
  accounts: PropTypes.array,
  activeAccountIndex: PropTypes.string,
}


export default AccountOperationPanel
