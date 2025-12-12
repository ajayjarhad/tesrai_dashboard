import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// Initialize Prometheus exporter for metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
});

// Set up metrics provider - simple configuration without views
const meterProvider = new MeterProvider({
  readers: [prometheusExporter],
});

// Register the meter provider globally
metrics.setGlobalMeterProvider(meterProvider);

// Get the meter from the global provider
const meter = metrics.getMeter('robot-dashboard-backend');

// Robot fleet metrics (based on existing robot collection) - simplified for Bun compatibility
export const robotFleetMetrics = {
  statusChanges: meter.createCounter('robot.fleet.status_changes', {
    description: 'Total number of robot status changes',
  }),
  // Note: totalCount and onlineCount removed due to Bun runtime compatibility issues with gauges
};

// API metrics
export const apiMetrics = {
  requestCount: meter.createCounter('api.requests.total', {
    description: 'Total number of API requests',
  }),
  requestDuration: meter.createHistogram('api.request.duration', {
    description: 'Duration of API requests in milliseconds',
    unit: 'ms',
  }),
  errorRate: meter.createCounter('api.errors.total', {
    description: 'Total number of API errors',
  }),
};

// WebSocket metrics - simplified for Bun compatibility
export const websocketMetrics = {
  messagesReceived: meter.createCounter('websocket.messages.received', {
    description: 'Total number of WebSocket messages received',
  }),
  connectionErrors: meter.createCounter('websocket.connection.errors', {
    description: 'Total number of WebSocket connection errors',
  }),
  // Note: activeConnections removed due to Bun runtime compatibility issues with gauges
};

// Database metrics - simplified for Bun compatibility
export const databaseMetrics = {
  queryDuration: meter.createHistogram('database.query.duration', {
    description: 'Duration of database queries in milliseconds',
    unit: 'ms',
  }),
  operationCount: meter.createCounter('database.operations.total', {
    description: 'Total number of database operations',
  }),
  // Note: connectionPool removed due to Bun runtime compatibility issues with gauges
};

// Auth metrics - simplified for Bun compatibility
export const authMetrics = {
  loginAttempts: meter.createCounter('auth.login.attempts', {
    description: 'Total number of login attempts',
  }),
  loginSuccess: meter.createCounter('auth.login.success', {
    description: 'Total number of successful logins',
  }),
  loginFailures: meter.createCounter('auth.login.failures', {
    description: 'Total number of failed logins',
  }),
  // Note: activeSessions removed due to Bun runtime compatibility issues with gauges
};

// Map management metrics - simplified for Bun compatibility
export const mapMetrics = {
  uploadCount: meter.createCounter('maps.uploads.total', {
    description: 'Total number of map uploads',
  }),
  downloadCount: meter.createCounter('maps.downloads.total', {
    description: 'Total number of map downloads',
  }),
  // Note: storageSize removed due to Bun runtime compatibility issues with gauges
};