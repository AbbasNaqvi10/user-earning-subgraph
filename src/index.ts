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
  User,
  Earn,
  userEarn,
  userDeposit,
  userWithdraw,
} from "../generated/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

let idArray = [15, 14, 12, 11, 10, 8, 7, 6, 5, 1, 2, 3, 4, 9];
let nameArray = [
  "WETH_WstETH",
  "WETH_WBTC",
  "USDC_TUSD",
  "USDC_USX",
  "WETH_MAGIC",
  "WETH_PLS",
  "USDT",
  "USDC",
  "GMX",
  "WETH_DAI",
  "WETH_USDC",
  "WETH_USDT",
  "WETH_WBTC",
  "FRAX",
];
let platformArray = [
  "SwapFish",
  "SwapFish",
  "SwapFish",
  "SwapFish",
  "SushiSwap",
  "Plutus",
  "Dodo",
  "Dodo",
  "Gmx",
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
  "SushiSwap",
  "Stargate",
];
let vaultArray: Array<string> = [
  "0x33BD22e9D83C7A74199405aF2D8dfA21309F719F",
  "0xE80424377bF6D74329DcFc56cfdf3611c385Fdd0",
  "0xaBF8a83a6724ceCb21b6a54394724A7412B99dF9",
  "0x7EfB566135a986d1723869F8F0204b9ce6291fB5",
  "0x1455497ECf9f37619259d801c918C6b7D33ca933",
  "0x0F6aB743b9E4c42B4b5d392074f174AEc3848704",
  "0xD12E66DDA43557D7eCeA3852CF64D441212e07B1",
  "0x6c0415b9F728BE851FcB1c4d5443C168Fdf20092",
  "0xAE24d2C3bb42Dab0cC54478Bb7868f54b7a91DF9",
  "0xF73e52e7185dDE30eC58336bc186f392354bF784",
  "0x46910A4AbA500b71F213150A0E99201Fd5c8FCec",
  "0xa7bff08cADebFc239Aa6A127064Af4a05EA61Fcb",
  "0x3043e7675c956EAfcDF006458b296F1fe8B0CA7C",
  "0xACD067eC75f5aA7F4ff778A8De0A1252A1852543",
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
  let contract = Weth_Usdc.bind(event.address);
  let tokenId = zero;
  let tokenName = "WETH_WstETH";
  let platform = "SwapFish";
  let vaultAddress = event.address;

  for (let i = 0; i < vaultArray.length; i++) {
    log.info("Inside for loop", []);
    if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
      log.info("Inside if", []);
      tokenId = BigInt.fromI64(idArray[i]);
      tokenName = nameArray[i];
      platform = platformArray[i];
      log.info(tokenName, []);
      log.info(platform, []);
      log.info(vaultAddress.toHexString(), []);
      break;
    }
  }

  let deposit = new userDeposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  deposit.tokenId = tokenId;
  deposit.tokenName = tokenName;
  deposit.platformName = platform;
  deposit.value = event.params._value;
  deposit.userBalance = contract.balanceOf(event.params._from);
  deposit.blockTimestamp = event.block.timestamp;
  deposit.blockNumber = event.block.number;

  let user = User.load(event.params._from);

  if (!user) {
    user = new User(event.params._from);
    let earn = Earn.load(
      event.params._from
        .toString()
        .concat(tokenName)
        .concat(platform)
    );
    if (!earn) {
      earn = new Earn(
        event.params._from
          .toString()
          .concat(tokenName)
          .concat(platform)
      );
      earn.totalDeposit = zero;
      earn.totalWithdraw = zero;
    }
    user.deposit = [];
    user.withdraw = [];
    user.earn = [];

    let depositId = deposit.id;
    let userDepositArray = user.deposit;
    userDepositArray.push(depositId);
    user.deposit = userDepositArray;

    earn.totalDeposit = earn.totalDeposit.plus(event.params._value);

    deposit.save();
    user.save();
    earn.save();
    return;
  }
  let earn = Earn.load(
    event.params._from
      .toString()
      .concat(tokenName)
      .concat(platform)
  );
  if (!earn) {
    earn = new Earn(
      event.params._from
        .toString()
        .concat(tokenName)
        .concat(platform)
    );
    earn.totalDeposit = zero;
    earn.totalWithdraw = zero;
  }
  let depositId = deposit.id;
  let userDepositArray = user.deposit;
  userDepositArray.push(depositId);
  user.deposit = userDepositArray;
  earn.totalDeposit = earn.totalDeposit.plus(event.params._value);

  deposit.save();
  user.save();
  earn.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let zero = BigInt.fromI64(0);
  let contract = Weth_Usdc.bind(event.address);
  let tokenId = zero;
  let tokenName = "WETH_WstETH";
  let platform = "SwapFish";
  let vaultAddress = event.address;

  for (let i = 0; i < vaultArray.length; i++) {
    log.info("Inside for loop", []);
    if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
      log.info("Inside if", []);
      tokenId = BigInt.fromI64(idArray[i]);
      tokenName = nameArray[i];
      platform = platformArray[i];
      log.info(tokenName, []);
      log.info(platform, []);
      log.info(vaultAddress.toHexString(), []);
      break;
    }
  }

  let withdraw = new userWithdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  withdraw.tokenId = tokenId;
  withdraw.tokenName = tokenName;
  withdraw.platformName = platform;
  withdraw.value = event.params._value;
  withdraw.userBalance = contract.balanceOf(event.params._from);
  withdraw.blockTimestamp = event.block.timestamp;
  withdraw.blockNumber = event.block.number;

  let user = User.load(event.params._from);

  if (!user) {
    user = new User(event.params._from);
    let earn = Earn.load(
      event.params._from
        .toString()
        .concat(tokenName)
        .concat(platform)
    );
    if (!earn) {
      earn = new Earn(
        event.params._from
          .toString()
          .concat(tokenName)
          .concat(platform)
      );
      earn.totalDeposit = zero;
      earn.totalWithdraw = zero;
    }
    user.deposit = [];
    user.withdraw = [];
    user.earn = [];

    let withdrawId = withdraw.id;
    let userWithdrawArray = user.withdraw;
    userWithdrawArray.push(withdrawId);
    user.withdraw = userWithdrawArray;

    earn.totalWithdraw = earn.totalWithdraw.plus(event.params._value);
    if (contract.balanceOf(event.params._from).equals(zero)) {
      let userEarning = new userEarn(
        event.transaction.hash.concatI32(event.logIndex.toI32())
      );
      userEarning.totalDeposit = earn.totalDeposit;
      userEarning.totalWithdraw = earn.totalWithdraw;
      userEarning.tokenId = tokenId;
      userEarning.tokenName = tokenName;
      userEarning.platformName = platform;
      userEarning.userBalance = contract.balanceOf(event.params._from);
      userEarning.blockTimestamp = event.block.timestamp;
      userEarning.blockNumber = event.block.number;
      let earnId = userEarning.id;
      let earnArray = user.earn;
      earnArray.push(earnId);
      user.earn = earnArray;
      earn.totalDeposit = zero;
      earn.totalWithdraw = zero;
      userEarning.save();
    }

    user.save();
    withdraw.save();
    earn.save();
    return;
  }
  let earn = Earn.load(
    event.params._from
      .toString()
      .concat(tokenName)
      .concat(platform)
  );
  if (!earn) {
    earn = new Earn(
      event.params._from
        .toString()
        .concat(tokenName)
        .concat(platform)
    );
    earn.totalDeposit = zero;
    earn.totalWithdraw = zero;
  }
  earn.totalWithdraw = earn.totalWithdraw.plus(event.params._value);
  let withdrawId = withdraw.id;
  let userWithdrawArray = user.withdraw;
  userWithdrawArray.push(withdrawId);
  user.withdraw = userWithdrawArray;

  if (contract.balanceOf(event.params._from).equals(zero)) {
    let userEarning = new userEarn(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    userEarning.totalDeposit = earn.totalDeposit;
    userEarning.totalWithdraw = earn.totalWithdraw;
    userEarning.tokenId = tokenId;
    userEarning.tokenName = tokenName;
    userEarning.platformName = platform;
    userEarning.userBalance = contract.balanceOf(event.params._from);
    userEarning.blockTimestamp = event.block.timestamp;
    userEarning.blockNumber = event.block.number;
    let earnId = userEarning.id;
    let earnArray = user.earn;
    earnArray.push(earnId);
    user.earn = earnArray;
    earn.totalDeposit = zero;
    earn.totalWithdraw = zero;
    userEarning.save();
  }

  user.save();
  withdraw.save();
  earn.save();
}
