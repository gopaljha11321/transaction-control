import { Injectable } from "@nestjs/common";
import { Gateway, GatewayHealthRecord } from "../entities/gateway.entity";

@Injectable()
export class GatewayRepository {
  private gateways: Map<string, Gateway> = new Map();
  private healthRecords: GatewayHealthRecord[] = [];

  constructor() {
    this.gateways.set("razorpay", new Gateway("razorpay", 50));
    this.gateways.set("payu", new Gateway("payu", 30));
    this.gateways.set("cashfree", new Gateway("cashfree", 20));
  }

  findAll(): Gateway[] {
    return Array.from(this.gateways.values());
  }

  findByName(name: string): Gateway | undefined {
    return this.gateways.get(name);
  }

  getHealthyGateways(): Gateway[] {
    const now = new Date();
    return Array.from(this.gateways.values()).filter((gateway) => {
      if (!gateway.isHealthy) {
        return false;
      }
      if (gateway.disabledUntil && gateway.disabledUntil > now) {
        return false;
      }
      return true;
    });
  }

  markUnhealthy(gatewayName: string, cooldownMinutes: number): void {
    const gateway = this.gateways.get(gatewayName);
    if (gateway) {
      gateway.isHealthy = false;
      const cooldownUntil = new Date();
      cooldownUntil.setMinutes(cooldownUntil.getMinutes() + cooldownMinutes);
      gateway.disabledUntil = cooldownUntil;
    }
  }

  markHealthy(gatewayName: string): void {
    const gateway = this.gateways.get(gatewayName);
    if (gateway) {
      gateway.isHealthy = true;
      gateway.disabledUntil = undefined;
    }
  }

  addHealthRecord(record: GatewayHealthRecord): void {
    this.healthRecords.push(record);
  }

  getHealthRecords(
    gatewayName: string,
    windowMinutes: number
  ): GatewayHealthRecord[] {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    return this.healthRecords.filter(
      (record) =>
        record.gateway === gatewayName && record.timestamp >= windowStart
    );
  }

  cleanupOldRecords(olderThanMinutes: number): void {
    const now = new Date();
    const cutoff = new Date(now.getTime() - olderThanMinutes * 60 * 1000);
    this.healthRecords = this.healthRecords.filter(
      (record) => record.timestamp >= cutoff
    );
  }
}
