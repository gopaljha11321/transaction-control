# Payment Gateway Router

A dynamic payment gateway routing system built with NestJS that intelligently routes transactions to multiple payment gateways based on health status and weighted distribution.

## How It Works

1. When a transaction is initiated, the system selects a healthy gateway using the weighted random routing strategy
2. The health tracking service monitors gateway success rates over a 15-minute window
3. If a gateway's success rate drops below 90%, it's marked unhealthy and enters a 30-minute cooldown period
4. Unhealthy gateways are automatically re-enabled after the cooldown period expires
5. The system only routes to healthy gateways, ensuring reliable payment processing

## Design Patterns

This project uses several important design patterns:

### 1. **Strategy Pattern**

The routing logic is implemented using the Strategy pattern. The `IRoutingStrategy` interface defines how gateways are selected, and `WeightedRandomRoutingStrategy` implements weighted random selection. This allows you to easily swap different routing algorithms (like round-robin, least-loaded, etc.) without changing the core transaction service.

### 2. **Repository Pattern**

Data access is abstracted through repositories (`TransactionRepository` and `GatewayRepository`). This keeps the business logic separate from data storage details and makes it easy to switch between in-memory storage, databases, or external services.

### 3. **Dependency Injection**

NestJS uses dependency injection throughout the application. Services, repositories, and strategies are injected via constructors, making the code more testable and maintainable.

### 4. **Service Layer Pattern**

Business logic is separated into service classes (`TransactionService` and `HealthTrackingService`), keeping controllers thin and focused on HTTP handling.

### 5. **Module Pattern**

Code is organized into NestJS modules (`AppModule`, `TransactionModule`), providing clear boundaries and dependency management.

## Running the Application

### Prerequisites

- Node.js
- yarn package manager

### Installation

1. **Install dependencies:**
   ```
   yarn install
   ```

### Running Locally

2. **Start the development server:**

   ```
   yarn start:dev
   ```

   The server will start on `http://localhost:3000` with hot-reload enabled.

3. **Start in production mode:**
   ```bash
   yarn run build
   yarn run start:prod
   ```

### Running with Docker

1. **Build the Docker image:**

   ```bash
   docker build -t payment-gateway-router .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 payment-gateway-router
   ```

### Testing

- **Run unit tests:**

  ```bash
  yarn test
  ```

- **Run e2e tests:**

  ```bash
  yarn run test:e2e
  ```

- **Run tests with coverage:**
  ```bash
  yarn run test:cov
  ```

## API Endpoints

- `POST /transactions/initiate` - Initiate a new transaction
- `POST /transactions/callback` - Handle gateway callback

## API Endpoints

- `https://transaction-control.onrender.com/transactions/initiate` - Live URL
