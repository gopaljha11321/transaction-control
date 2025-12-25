import {
  IsString,
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

class PaymentInstrumentDto {
  @IsString()
  type: string;

  @IsString()
  card_number: string;

  @IsString()
  expiry: string;
}

export class InitiateTransactionDto {
  @IsString()
  order_id: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentInstrumentDto)
  payment_instrument: PaymentInstrumentDto;
}
