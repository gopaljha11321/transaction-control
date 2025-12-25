import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("TransactionController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should initiate transaction and handle callback flow", async () => {
    const initiatePayload = {
      order_id: "ORD123",
      amount: 499,
      payment_instrument: {
        type: "card",
        card_number: "4111111111111111",
        expiry: "12/25",
      },
    };

    const initiateResponse = await request(app.getHttpServer())
      .post("/transactions/initiate")
      .send(initiatePayload)
      .expect(201);

    expect(initiateResponse.body).toHaveProperty("id");
    expect(initiateResponse.body.order_id).toBe("ORD123");
    expect(initiateResponse.body.amount).toBe(499);
    expect(initiateResponse.body.status).toBe("PENDING");
    expect(initiateResponse.body.gateway).toBeDefined();
    expect(["razorpay", "payu", "cashfree"]).toContain(
      initiateResponse.body.gateway
    );

    const callbackPayload = {
      order_id: "ORD123",
      status: "success",
      gateway: initiateResponse.body.gateway,
      reason: "Payment processed successfully",
    };

    const callbackResponse = await request(app.getHttpServer())
      .post("/transactions/callback")
      .send(callbackPayload)
      .expect(200);

    expect(callbackResponse.body.order_id).toBe("ORD123");
    expect(callbackResponse.body.status).toBe("SUCCESS");
    expect(callbackResponse.body.gateway).toBe(initiateResponse.body.gateway);
  });

  it("should handle failure callback", async () => {
    const initiatePayload = {
      order_id: "ORD456",
      amount: 299,
      payment_instrument: {
        type: "card",
        card_number: "4111111111111111",
        expiry: "12/25",
      },
    };

    const initiateResponse = await request(app.getHttpServer())
      .post("/transactions/initiate")
      .send(initiatePayload)
      .expect(201);

    const callbackPayload = {
      order_id: "ORD456",
      status: "failure",
      gateway: initiateResponse.body.gateway,
      reason: "Insufficient funds",
    };

    const callbackResponse = await request(app.getHttpServer())
      .post("/transactions/callback")
      .send(callbackPayload)
      .expect(200);

    expect(callbackResponse.body.status).toBe("FAILURE");
    expect(callbackResponse.body.gateway).toBe(initiateResponse.body.gateway);
  });
});
