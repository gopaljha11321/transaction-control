export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export class Transaction {
  id: string;
  orderId: string;
  amount: number;
  gateway: string;
  status: TransactionStatus;
  paymentInstrument: {
    type: string;
    cardNumber: string;
    expiry: string;
  };
  createdAt: Date;
  updatedAt: Date;
  reason?: string;

  constructor(
    id: string,
    orderId: string,
    amount: number,
    gateway: string,
    paymentInstrument: { type: string; cardNumber: string; expiry: string }
  ) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.gateway = gateway;
    this.status = TransactionStatus.PENDING;
    this.paymentInstrument = paymentInstrument;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
