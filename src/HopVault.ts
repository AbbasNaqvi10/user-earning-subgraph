import {
    Approval as ApprovalEvent,
    Transfer as TransferEvent,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent,
    HopVault
} from "../generated/Hop_Eth/HopVault"
  
  import { HopLp } from "../generated/Hop_Eth/HopLp";
  import { HopSwap } from "../generated/Hop_Eth/HopSwap";
  
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
  
  let idArray = [19, 18, 17, 16];
  let tokenNameArray = [
    "Hop_Dai",
    "Hop_Usdt",
    "Hop_Usdc",
    "Hop_Eth",
  ];
  let vaultArray: Array<string> = [
    "0x8ca3f11485Bd85Dd0E952C6b21981DEe8CD1E901",
    "0xCe3B19D820CB8B9ae370E423B0a329c4314335fE",
    "0x1dda3B8A728a62a30f79d1E2a10e3d6B85ef4C5d",
    "0xfd3573bebDc8bF323c65Edf2408Fd9a8412a8694",
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
    let contract = HopVault.bind(event.address);
    let tokenId = zero;
    let tokenName = "Hop_Dai";
    let platform = "Hop";
    let vaultAddress = event.address;
    let userId = event.params._from;
    
  
    for (let i = 0; i < vaultArray.length; i++) {
      if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
        tokenId = BigInt.fromI64(idArray[i]);
        tokenName = tokenNameArray[i];
        break;
      }
    }
    let pairContract = HopLp.bind(contract.token());
    let swap = HopSwap.bind(pairContract.swap());
    let token0 = swap.getToken(0);
    let token1 = swap.getToken(1);
    let reserve0 = swap.getTokenBalance(0);
    let reserve1 = swap.getTokenBalance(1);
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
    let contract = HopVault.bind(event.address);
    let tokenId = zero;
    let tokenName = "Hop_Dai";
    let platform = "Hop";
    let vaultAddress = event.address;
    let userId = event.params._from;
    
  
    for (let i = 0; i < vaultArray.length; i++) {
      if (vaultAddress.equals(Address.fromHexString(vaultArray[i]))) {
        tokenId = BigInt.fromI64(idArray[i]);
        tokenName = tokenNameArray[i];
        break;
      }
    }
    let pairContract = HopLp.bind(contract.token());
    let swap = HopSwap.bind(pairContract.swap());
    let token0 = swap.getToken(0);
    let token1 = swap.getToken(1);
    let reserve0 = swap.getTokenBalance(0);
    let reserve1 = swap.getTokenBalance(1);
    let totalSupply = pairContract.totalSupply();
    
    let withdraw = new Withdraw(
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
  