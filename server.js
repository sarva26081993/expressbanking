const express = require("express");
const bodyparser = require("body-parser");

const app = express();
app.use(bodyparser.json());

const port = 3000;

let accounts = [];
let accountCounter = 10000;

const generateAccountNumber = () => (++accountCounter).toString();

const accountFinder = (accountNumber) =>
  accounts.find((account) => account.accountNumber === accountNumber);

/* Endpoint for creating account
@input name emaild and opening balance
@output created account
*/
app.post("/createAccount", (req, res) => {
  const { name, emailid, openingbalance } = req.body;
  if (
    !name ||
    typeof openingbalance !== "number" ||
    openingbalance < 0 ||
    !emailid.includes("@")
  ) {
    res.status(500).json({
      error:
        "Invalid data provided, unable to create account , Please try again later !!!!",
    });
  }
  accountNumber = generateAccountNumber();
  const newaccount = {
    name,
    emailid,
    openingbalance,
    accountNumber,
    transactions: [],
  };
  accounts.push(newaccount);
  res.status(200).json({
    message: `Customer account created successfully , account number is ${accountNumber} `,
  });
  console.log("account created");
  console.log("Logging account details", accounts);
});

/* Endpoint for viewing account
@input account number
@output searched account
*/
app.get("/viewAccount/:accountNumber", (req, res) => {
  const { accountNumber } = req.params;

  let accountNum = parseInt(accountNumber);

  if (!accountNum || typeof accountNum != "number") {
    res.status(500).json({
      error: "Invalid data provided",
    });
  }

  const account = accountFinder(accountNum.toString());
  if (!account) {
    res.status(404).json({ error: "account not found" });
  }

  res.status(200).json(account);
  console.log("account retrieved successfully");
});

/* Endpoint for viewing transaction history of account
@input account number
@output transactions
*/
app.get("/getTransactionHistory/:accountNumber", (req, res) => {
  const { accountNumber } = req.params;

  let accountNum = parseInt(accountNumber);

  if (!accountNum || typeof accountNum != "number") {
    res.status(500).json({
      error: "Invalid data provided",
    });
  }

  const account = accountFinder(accountNum.toString());
  if (!account) {
    res.status(404).json({ error: "account not found" });
  }

  const txnHistory = account.transactions;

  if (!txnHistory) {
    res
      .status(404)
      .json({ error: "No transaction history found for provided account" });
  }

  res.status(200).json(txnHistory);
  console.log("Transaction history retrieved successfully");
});

/* Endpoint for viewing account balnce
@input account number
@output account balance
*/
app.get("/getAccountBalance/:accountNumber", (req, res) => {
  const { accountNumber } = req.params;

  let accountNum = parseInt(accountNumber);

  if (!accountNum || typeof accountNum != "number") {
    res.status(500).json({
      error: "Invalid data provided",
    });
  }

  const account = accountFinder(accountNum.toString());
  if (!account) {
    res.status(404).json({ error: "account not found" });
  }

  res.status(200).json(account.openingbalance);
  console.log("Account balance retrieved sucecssfully");
});

/* Endpoint for viewing transaction history of account
@input sender account , receiver account, amount
@output transaction success
*/
app.post("/makeTransaction", (req, res) => {
  const { senderAcctNum, receiverAcctNum, amount } = req.body;

  let sender = parseInt(senderAcctNum);
  let receiver = parseInt(receiverAcctNum);
  let txnamt = parseFloat(amount);

  if (txnamt < 0 || typeof txnamt !== "number") {
    res.status(500).json({
      error: "Please provide valid amount for transaction",
    });
  }

  const senderaccount = accountFinder(sender.toString());
  const receiveraccount = accountFinder(receiver.toString());

  if (!senderaccount) {
    res.status(404).json({
      error: "sender account is not yet associated, please check again !!!",
    });
  }

  if (!receiveraccount) {
    res.status(404).json({
      error: "receiver account is not yet associated, please check again !!!",
    });
  }

  if (senderaccount.openingbalance < txnamt) {
    res.status(500).json({
      error:
        "sender account's balance is insufficient , please check again !!!",
    });
  }

  senderaccount.openingbalance = senderaccount.openingbalance - txnamt;
  receiveraccount.openingbalance = receiveraccount.openingbalance + txnamt;

  const senderTxn = {
    txnamt,
    txnType: "Debit",
    paid_to: receiveraccount.accountNumber,
  };

  const receiverTxn = {
    txnamt,
    txnType: "Credit",
    received_from: senderaccount.accountNumber,
  };

  senderaccount.transactions.push(senderTxn);
  receiveraccount.transactions.push(receiverTxn);

  res.status(200).json({
    message: "Transaction completed successfully",
  });
});

app.listen(port, () => {
  console.log(`server port established on ${port}`);
});
