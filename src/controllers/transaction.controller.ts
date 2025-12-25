import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { TransactionService } from "../services/transaction.service";
import { InitiateTransactionDto } from "../dto/initiate-transaction.dto";
import { CallbackDto } from "../dto/callback.dto";

@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post("initiate")
  @HttpCode(HttpStatus.CREATED)
  async initiate(@Body() dto: InitiateTransactionDto) {
    try {
      const transaction = this.transactionService.initiateTransaction(dto);
      return {
        id: transaction.id,
        order_id: transaction.orderId,
        amount: transaction.amount,
        gateway: transaction.gateway,
        status: transaction.status,
        created_at: transaction.createdAt,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post("callback")
  @HttpCode(HttpStatus.OK)
  async callback(@Body() dto: CallbackDto) {
    const transaction = this.transactionService.handleCallback(dto);
    return {
      id: transaction.id,
      order_id: transaction.orderId,
      amount: transaction.amount,
      gateway: transaction.gateway,
      status: transaction.status,
      updated_at: transaction.updatedAt,
    };
  }
}
