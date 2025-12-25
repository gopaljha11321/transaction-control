export class Gateway {
  name: string;
  weight: number;
  isHealthy: boolean;
  disabledUntil?: Date;

  constructor(name: string, weight: number) {
    this.name = name;
    this.weight = weight;
    this.isHealthy = true;
  }
}

export class GatewayHealthRecord {
  gateway: string;
  timestamp: Date;
  success: boolean;

  constructor(gateway: string, success: boolean) {
    this.gateway = gateway;
    this.timestamp = new Date();
    this.success = success;
  }
}
