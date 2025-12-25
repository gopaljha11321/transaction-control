import { IsString, IsIn, IsOptional } from "class-validator";

export class CallbackDto {
  @IsString()
  order_id: string;

  @IsString()
  @IsIn(["success", "failure"])
  status: "success" | "failure";

  @IsString()
  gateway: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
