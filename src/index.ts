import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent
} from "../generated/Weth_Usdc/Weth_Usdc"
import { Approval, Transfer, Deposit, Withdraw } from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(event.params._from)
  
  entity.from = event.params._from
  entity.value = event.params._value
  entity.timestamp = event.params._timestamp
  entity.shares = event.params._shares

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(event.params._from)
  
  entity.from = event.params._from
  entity.value = event.params._value
  entity.timestamp = event.params._timestamp
  entity.shares = event.params._shares

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}