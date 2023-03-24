import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Weth_Usdc,
} from "../generated/Weth_Usdc/Weth_Usdc";
import { UniswapV2Pair } from "../generated/UniswapV2Pair/UniswapV2Pair";
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

let contractArray = [
  "Weth_Wsteth",
  "Weth_Wbtc_SwapFish",
  "Usdc_Tusd",
  "Usdc_Usx",
  "Weth_Magic",
  "Weth_Pls",
  "Usdt",
  "Usdc",
  "Gmx",
  "Weth_Dai",
  "Weth_Usdc",
  "Weth_Usdt",
  "Weth_Wbtc_UniSwap",
  "Frax",
];
let lpArray = ["SushiLp", "HopLp"]
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
  let userId = event.params._from;
  let pairContract = UniswapV2Pair.bind(contract.token());
  let token0 = pairContract.token0();
  let token1 = pairContract.token1();
  let reserves = pairContract.getReserves();
  let reserve0 = reserves.get_reserve0();
  let reserve1 = reserves.get_reserve1();
  let totalSupply = pairContract.totalSupply();
  let deposit = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

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
  let contract = Weth_Usdc.bind(event.address);
  let tokenId = zero;
  let tokenName = "WETH_WstETH";
  let platform = "SwapFish";
  let vaultAddress = event.address;
  let userId = event.params._from;
  let withdraw = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

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
    userToken.platformName = platform;
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
  withdraw.userBalance = contract.balanceOf(userId);
  withdraw.blockTimestamp = event.block.timestamp;
  withdraw.blockNumber = event.block.number;

  withdraw.save();
  user.save();
  userToken.save();
}
