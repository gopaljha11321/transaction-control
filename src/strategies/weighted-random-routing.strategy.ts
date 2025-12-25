import { Injectable, Logger } from "@nestjs/common";
import { Gateway } from "../entities/gateway.entity";
import { IRoutingStrategy } from "./routing-strategy.interface";

@Injectable()
export class WeightedRandomRoutingStrategy implements IRoutingStrategy {
  private readonly logger = new Logger(WeightedRandomRoutingStrategy.name);

  selectGateway(gateways: Gateway[]): Gateway | null {
    if (gateways.length === 0) {
      this.logger.warn("No healthy gateways available for routing");
      return null;
    }

    const totalWeight = gateways.reduce((sum, gw) => sum + gw.weight, 0);
    let random = Math.random() * totalWeight;

    for (const gateway of gateways) {
      random -= gateway.weight;
      if (random <= 0) {
        this.logger.log(
          `Selected gateway ${gateway.name} with weight ${gateway.weight}`
        );
        return gateway;
      }
    }

    return gateways[gateways.length - 1];
  }
}
