import { Injectable } from "@nestjs/common";
import { Transaction, TransactionStatus } from "../entities/transaction.entity";

@Injectable()
export class TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  save(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  findByOrderId(orderId: string): Transaction | undefined {
    return Array.from(this.transactions.values()).find(
      (t) => t.orderId === orderId
    );
  }

  updateStatus(
    orderId: string,
    status: TransactionStatus,
    reason?: string
  ): Transaction | null {
    const transaction = this.findByOrderId(orderId);
    if (!transaction) {
      return null;
    }
    transaction.status = status;
    transaction.updatedAt = new Date();
    if (reason) {
      transaction.reason = reason;
    }
    return transaction;
  }

  findAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }
}
