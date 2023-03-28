import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Weth_Pls
} from "../generated/Weth_Pls/Weth_Pls";

import { SushiLp } from "../generated/SushiLp/SushiLp";

import {
  Approval,
  Transfer,
  User,
  PeriodEarn,
  UserToken,
  Deposit,
  Withdraw,
} from "../generated/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

let idArray = [10, 8, 1, 2, 3, 4];
let tokenNameArray = [
  "Weth_Magic",
  "Weth_Pls",
  "Weth_Dai",
  "Weth_Usdc",
  "Weth_Usdt",
  "Weth_Wbtc_SushiSwap",
];
let platformArray = [
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
];
let vaultArray: Array<string> = [
  "0x3F9012f9bF3172c26B1B7246B8bc62148842B013",
  "0xeb952db71c594299cEEe7c03C3AA26FE0fDBC8eb",
  "0xb58004E106409B00b854aBBF8CCB8618673d9346",
  "0x46910A4AbA500b71F213150A0E99201Fd5c8FCec",
  "0xf8bDcf1Cf4134b2864cdbE685A8128F90ED0E16e",
  "0xdf9d86bC4765a9C64e85323A9408dbee0115d22E",
];

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
  let contract = Weth_Pls.bind(event.address);
  let tokenId = zero;
  let tokenName = "Weth_Magic";
  let platform = "SwapFish";
  let vaultAddress = event.address;
  let userId = event.params._from;

  for (let i = 0; i < vaultArray.length; i++) {
    log.info("Inside for loop", []);
    if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
      log.info("Inside if", []);
      tokenId = BigInt.fromI64(idArray[i]);
      tokenName = tokenNameArray[i];
      platform = platformArray[i];
      // // @ts-ignore
      // contract = Classes[i].bind(event.address);
      break;
    }
  }
  let pairContract = SushiLp.bind(contract.token());
  let token0 = pairContract.token0();
  let token1 = pairContract.token1();
  let reserves = pairContract.getReserves();
  let reserve0 = reserves.get_reserve0();
  let reserve1 = reserves.get_reserve1();
  let totalSupply = pairContract.totalSupply();
  let deposit = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let user = User.load(userId);

  if (!user) {
    user = new User(userId);
    let userToken = UserToken.load(vaultAddress.concat(userId));
    if (!userToken) {
      userToken = new UserToken(vaultAddress.concat(userId));

      userToken.userId = userId;
      userToken.vaultAddress = vaultAddress;
      userToken.tokenId = tokenId;
      userToken.tokenName = tokenName;
      userToken.vaultAddress = vaultAddress;
      userToken.platformName = platform;
      userToken.deposit = zero;
      userToken.withdraw = zero;
      userToken.userBalance = zero;
      userToken.blockTimestamp = event.block.timestamp;
      userToken.blockNumber = event.block.number;
    }

    userToken.deposit = userToken.deposit.plus(event.params._value);
    userToken.userBalance = contract.balanceOf(userId);
    userToken.token0 = token0;
    userToken.token1 = token1;
    userToken.reserve0 = reserve0;
    userToken.reserve1 = reserve1;
    userToken.totalSupply = totalSupply;
    userToken.blockTimestamp = event.block.timestamp;
    userToken.blockNumber = event.block.number;

    deposit.tokenId = tokenId;
    deposit.tokenName = tokenName;
    deposit.platformName = platform;
    deposit.from = userId;
    deposit.shares = event.params._shares;
    deposit.value = event.params._value;
    deposit.token0 = token0;
    deposit.token1 = token1;
    deposit.reserve0 = reserve0;
    deposit.reserve1 = reserve1;
    deposit.totalSupply = totalSupply;
    deposit.userBalance = contract.balanceOf(userId);
    deposit.blockTimestamp = event.block.timestamp;
    deposit.blockNumber = event.block.number;

    deposit.save();
    user.save();
    userToken.save();
    return;
  }

  let userToken = UserToken.load(vaultAddress.concat(userId));

  if (!userToken) {
    userToken = new UserToken(vaultAddress.concat(userId));
    userToken.userId = userId;
    userToken.tokenId = tokenId;
    userToken.tokenName = tokenName;
    userToken.platformName = platform;
    userToken.vaultAddress = vaultAddress;
    userToken.deposit = zero;
    userToken.withdraw = zero;
    userToken.userBalance = zero;
    userToken.blockTimestamp = event.block.timestamp;
    userToken.blockNumber = event.block.number;
  }

  userToken.deposit = userToken.deposit.plus(event.params._value);
  userToken.userBalance = contract.balanceOf(userId);
  userToken.token0 = token0;
  userToken.token1 = token1;
  userToken.reserve0 = reserve0;
  userToken.reserve1 = reserve1;
  userToken.totalSupply = totalSupply;
  userToken.blockTimestamp = event.block.timestamp;
  userToken.blockNumber = event.block.number;

  deposit.tokenId = tokenId;
  deposit.tokenName = tokenName;
  deposit.platformName = platform;
  deposit.from = userId;
  deposit.shares = event.params._shares;
  deposit.value = event.params._value;
  deposit.token0 = token0;
  deposit.token1 = token1;
  deposit.reserve0 = reserve0;
  deposit.reserve1 = reserve1;
  deposit.totalSupply = totalSupply;
  deposit.userBalance = contract.balanceOf(userId);
  deposit.blockTimestamp = event.block.timestamp;
  deposit.blockNumber = event.block.number;

  deposit.save();
  user.save();
  userToken.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let zero = BigInt.fromI64(0);
  let contract = Weth_Pls.bind(event.address);
  let tokenId = zero;
  let tokenName = "Weth_Magic";
  let platform = "SwapFish";
  let vaultAddress = event.address;
  let userId = event.params._from;
  let pairContract = SushiLp.bind(contract.token());
  let token0 = pairContract.token0();
  let token1 = pairContract.token1();
  let reserves = pairContract.getReserves();
  let reserve0 = reserves.get_reserve0();
  let reserve1 = reserves.get_reserve1();
  let totalSupply = pairContract.totalSupply();
  let withdraw = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  for (let i = 0; i < vaultArray.length; i++) {
    log.info("Inside for loop", []);
    if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
      log.info("Inside if", []);
      tokenId = BigInt.fromI64(idArray[i]);
      tokenName = tokenNameArray[i];
      platform = platformArray[i];
      break;
    }
  }

  let user = User.load(userId);

  if (!user) {
    user = new User(userId);
    let userToken = UserToken.load(vaultAddress.concat(userId));
    if (!userToken) {
      userToken = new UserToken(vaultAddress.concat(userId));
      userToken.userId = userId;
      userToken.vaultAddress = vaultAddress;
      userToken.tokenId = tokenId;
      userToken.tokenName = tokenName;
      userToken.vaultAddress = vaultAddress;
      userToken.platformName = platform;
      userToken.deposit = zero;
      userToken.withdraw = zero;
      userToken.userBalance = zero;
      userToken.blockTimestamp = event.block.timestamp;
      userToken.blockNumber = event.block.number;
    }

    userToken.deposit = userToken.deposit.plus(event.params._value);
    userToken.userBalance = contract.balanceOf(userId);
    userToken.blockTimestamp = event.block.timestamp;
    userToken.blockNumber = event.block.number;

    if (contract.balanceOf(userId).equals(zero)) {
      let periodEarn = new PeriodEarn(
        event.transaction.hash.concatI32(event.logIndex.toI32())
      );
      periodEarn.userId = userId;
      periodEarn.vaultAddress = vaultAddress;
      periodEarn.tokenId = tokenId;
      periodEarn.tokenName = tokenName;
      periodEarn.platformName = platform;
      periodEarn.totalDeposit = userToken.deposit;
      periodEarn.totalWithdraw = userToken.withdraw;
      periodEarn.userBalance = contract.balanceOf(userId);
      periodEarn.blockTimestamp = event.block.timestamp;
      periodEarn.blockNumber = event.block.number;

      userToken.deposit = zero;
      userToken.withdraw = zero;

      periodEarn.save();
    }

    withdraw.tokenId = tokenId;
    withdraw.tokenName = tokenName;
    withdraw.platformName = platform;
    withdraw.from = userId;
    withdraw.shares = event.params._shares;
    withdraw.value = event.params._value;
    withdraw.token0 = token0;
    withdraw.token1 = token1;
    withdraw.reserve0 = reserve0;
    withdraw.reserve1 = reserve1;
    withdraw.totalSupply = totalSupply;
    withdraw.userBalance = contract.balanceOf(userId);
    withdraw.blockTimestamp = event.block.timestamp;
    withdraw.blockNumber = event.block.number;

    withdraw.save();
    user.save();
    userToken.save();
    return;
  }

  let userToken = UserToken.load(vaultAddress.concat(userId));

  if (!userToken) {
    userToken = new UserToken(vaultAddress.concat(userId));
    userToken.userId = userId;
    userToken.tokenId = tokenId;
    userToken.tokenName = tokenName;
    userToken.vaultAddress = vaultAddress;
    userToken.platformName = platform;
    userToken.vaultAddress = vaultAddress;
    userToken.deposit = zero;
    userToken.withdraw = zero;
    userToken.userBalance = zero;
    userToken.blockTimestamp = event.block.timestamp;
    userToken.blockNumber = event.block.number;
  }

  userToken.withdraw = userToken.withdraw.plus(event.params._value);
  userToken.userBalance = contract.balanceOf(userId);
  userToken.blockTimestamp = event.block.timestamp;
  userToken.blockNumber = event.block.number;

  if (contract.balanceOf(userId).equals(zero)) {
    let periodEarn = new PeriodEarn(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    periodEarn.userId = userId;
    periodEarn.vaultAddress = vaultAddress;
    periodEarn.tokenId = tokenId;
    periodEarn.tokenName = tokenName;
    periodEarn.platformName = platform;
    periodEarn.totalDeposit = userToken.deposit;
    periodEarn.totalWithdraw = userToken.withdraw;
    periodEarn.userBalance = contract.balanceOf(userId);
    periodEarn.blockTimestamp = event.block.timestamp;
    periodEarn.blockNumber = event.block.number;

    userToken.deposit = zero;
    userToken.withdraw = zero;

    periodEarn.save();
  }

  withdraw.tokenId = tokenId;
  withdraw.tokenName = tokenName;
  withdraw.platformName = platform;
  withdraw.from = userId;
  withdraw.shares = event.params._shares;
  withdraw.value = event.params._value;
  withdraw.token0 = token0;
  withdraw.token1 = token1;
  withdraw.reserve0 = reserve0;
  withdraw.reserve1 = reserve1;
  withdraw.totalSupply = totalSupply;
  withdraw.userBalance = contract.balanceOf(userId);
  withdraw.blockTimestamp = event.block.timestamp;
  withdraw.blockNumber = event.block.number;

  withdraw.save();
  user.save();
  userToken.save();
}
