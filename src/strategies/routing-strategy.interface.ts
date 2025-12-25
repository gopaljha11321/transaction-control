import { Gateway } from "../entities/gateway.entity";

export interface IRoutingStrategy {
  selectGateway(gateways: Gateway[]): Gateway | null;
}
