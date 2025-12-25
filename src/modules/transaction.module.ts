import { Module } from "@nestjs/common";
import { TransactionController } from "../controllers/transaction.controller";
import { TransactionService } from "../services/transaction.service";
import { TransactionRepository } from "../repositories/transaction.repository";
import { GatewayRepository } from "../repositories/gateway.repository";
import { HealthTrackingService } from "../services/health-tracking.service";
import { WeightedRandomRoutingStrategy } from "../strategies/weighted-random-routing.strategy";

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    GatewayRepository,
    HealthTrackingService,
    {
      provide: "IRoutingStrategy",
      useClass: WeightedRandomRoutingStrategy,
    },
  ],
})
export class TransactionModule {}
