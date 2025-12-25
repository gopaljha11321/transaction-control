import { Module } from "@nestjs/common";
import { TransactionModule } from "./modules/transaction.module";

@Module({
  imports: [TransactionModule],
})
export class AppModule {}
