import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Weth_Usdc,
} from "../generated/Weth_Usdc/Weth_Usdc";
import {
  Approval,
  Transfer,
  Deposit,
  Withdraw,
  User,
  Earn,
} from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.spender = event.params.spender;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleDeposit(event: DepositEvent): void {
  let zero = BigInt.fromI64(0);
  let contract = Weth_Usdc.bind(event.address);
  let user = User.load(event.params._from);

  if (!user) {
    user = new User(event.params._from);
    let earn = Earn.load(event.params._from);
    if (!earn) {
      earn = new Earn(event.params._from);
      earn.totalDeposite = zero;
      earn.totalWithdraw = zero;
      earn.blockTimestamp = zero;
      earn.blockNumber = zero;
    }
    earn.totalDeposite = earn.totalDeposite.plus(event.params._value);
    if (contract.balanceOf(event.params._from).equals(zero)) {
      let userEarn = earn.id;
      user.earn.push(userEarn);
    }
    earn.blockTimestamp = event.block.timestamp;
    earn.blockNumber = event.block.number;
    earn.save();
    user.save();
    return;
  }
  let earn = Earn.load(event.params._from);
  if (!earn) {
    earn = new Earn(event.params._from);
    earn.totalDeposite = zero;
    earn.totalWithdraw = zero;
    earn.blockTimestamp = zero;
    earn.blockNumber = zero;
  }
  earn.totalDeposite = earn.totalDeposite.plus(event.params._value);
  if (contract.balanceOf(event.params._from).equals(zero)) {
    let userEarn = earn.id;
    user.earn.push(userEarn);
  }
  earn.blockTimestamp = event.block.timestamp;
  earn.blockNumber = event.block.number;
  earn.save();
  user.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let zero = BigInt.fromI64(0);
  let contract = Weth_Usdc.bind(event.address);
  let user = User.load(event.params._from);

  if (!user) {
    user = new User(event.params._from);
    let earn = Earn.load(event.params._from);
    if (!earn) {
      earn = new Earn(event.params._from);
      earn.totalDeposite = zero;
      earn.totalWithdraw = zero;
      earn.blockTimestamp = zero;
      earn.blockNumber = zero;
    }
    earn.totalWithdraw = earn.totalWithdraw.plus(event.params._value);
    if (contract.balanceOf(event.params._from).equals(zero)) {
      let userEarn = earn.id;
      user.earn.push(userEarn);
    }
    earn.blockTimestamp = event.block.timestamp;
    earn.blockNumber = event.block.number;
    earn.save();
    user.save();
    return;
  }
  let earn = Earn.load(event.params._from);
  if (!earn) {
    earn = new Earn(event.params._from);
    earn.totalDeposite = zero;
    earn.totalWithdraw = zero;
    earn.blockTimestamp = zero;
    earn.blockNumber = zero;
  }
  earn.totalWithdraw = earn.totalWithdraw.plus(event.params._value);
  if (contract.balanceOf(event.params._from).equals(zero)) {
    let userEarn = earn.id;
    user.earn.push(userEarn);
  }
  earn.blockTimestamp = event.block.timestamp;
  earn.blockNumber = event.block.number;
  earn.save();
  user.save();
}
