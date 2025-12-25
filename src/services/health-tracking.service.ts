import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { GatewayRepository } from "../repositories/gateway.repository";
import { GatewayHealthRecord } from "../entities/gateway.entity";

@Injectable()
export class HealthTrackingService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthTrackingService.name);
  private readonly WINDOW_MINUTES = 15;
  private readonly SUCCESS_RATE_THRESHOLD = 0.9;
  private readonly COOLDOWN_MINUTES = 30;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly gatewayRepository: GatewayRepository) {
    this.startCleanup();
  }

  recordTransaction(gatewayName: string, success: boolean): void {
    const record = new GatewayHealthRecord(gatewayName, success);
    this.gatewayRepository.addHealthRecord(record);
    this.logger.log(
      `Recorded ${success ? "success" : "failure"} for gateway ${gatewayName}`
    );
    this.evaluateGatewayHealth(gatewayName);
  }

  private evaluateGatewayHealth(gatewayName: string): void {
    const records = this.gatewayRepository.getHealthRecords(
      gatewayName,
      this.WINDOW_MINUTES
    );

    if (records.length === 0) {
      return;
    }

    const successCount = records.filter((r) => r.success).length;
    const successRate = successCount / records.length;

    const gateway = this.gatewayRepository.findByName(gatewayName);
    if (!gateway) {
      return;
    }

    if (successRate < this.SUCCESS_RATE_THRESHOLD && gateway.isHealthy) {
      this.logger.warn(
        `Gateway ${gatewayName} success rate ${(successRate * 100).toFixed(2)}% below threshold ${(this.SUCCESS_RATE_THRESHOLD * 100).toFixed(2)}%. Marking unhealthy.`
      );
      this.gatewayRepository.markUnhealthy(gatewayName, this.COOLDOWN_MINUTES);
    }
  }

  checkAndReenableGateways(): void {
    const now = new Date();
    const gateways = this.gatewayRepository.findAll();

    gateways.forEach((gateway) => {
      if (
        !gateway.isHealthy &&
        gateway.disabledUntil &&
        gateway.disabledUntil <= now
      ) {
        this.logger.log(
          `Cooldown period expired for gateway ${gateway.name}. Re-enabling.`
        );
        this.gatewayRepository.markHealthy(gateway.name);
      }
    });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.gatewayRepository.cleanupOldRecords(this.WINDOW_MINUTES * 2);
      this.checkAndReenableGateways();
    }, 60000);
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
