import { Injectable, Logger, NotFoundException, Inject } from "@nestjs/common";
import { TransactionRepository } from "../repositories/transaction.repository";
import { GatewayRepository } from "../repositories/gateway.repository";
import { HealthTrackingService } from "./health-tracking.service";
import { IRoutingStrategy } from "../strategies/routing-strategy.interface";
import { Transaction, TransactionStatus } from "../entities/transaction.entity";
import { InitiateTransactionDto } from "../dto/initiate-transaction.dto";
import { CallbackDto } from "../dto/callback.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly gatewayRepository: GatewayRepository,
    private readonly healthTrackingService: HealthTrackingService,
    @Inject("IRoutingStrategy")
    private readonly routingStrategy: IRoutingStrategy
  ) {}

  initiateTransaction(dto: InitiateTransactionDto): Transaction {
    const healthyGateways = this.gatewayRepository.getHealthyGateways();
    const selectedGateway = this.routingStrategy.selectGateway(healthyGateways);

    if (!selectedGateway) {
      throw new Error("No healthy gateway available");
    }

    const transactionId = uuidv4();
    const transaction = new Transaction(
      transactionId,
      dto.order_id,
      dto.amount,
      selectedGateway.name,
      {
        type: dto.payment_instrument.type,
        cardNumber: dto.payment_instrument.card_number,
        expiry: dto.payment_instrument.expiry,
      }
    );

    this.transactionRepository.save(transaction);
    this.logger.log(
      `Transaction ${transactionId} initiated for order ${dto.order_id} with gateway ${selectedGateway.name}`
    );

    return transaction;
  }

  handleCallback(dto: CallbackDto): Transaction {
    const transaction = this.transactionRepository.findByOrderId(dto.order_id);

    if (!transaction) {
      throw new NotFoundException(
        `Transaction not found for order ${dto.order_id}`
      );
    }

    const status =
      dto.status === "success"
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILURE;

    this.transactionRepository.updateStatus(dto.order_id, status, dto.reason);

    const success = dto.status === "success";
    this.healthTrackingService.recordTransaction(dto.gateway, success);

    this.logger.log(
      `Transaction ${transaction.id} updated to ${status} for gateway ${dto.gateway}`
    );

    return this.transactionRepository.findByOrderId(dto.order_id)!;
  }
}
