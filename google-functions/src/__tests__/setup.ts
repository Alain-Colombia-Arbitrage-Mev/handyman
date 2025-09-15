/**
 * Test Setup Configuration
 * Enterprise-grade testing infrastructure with comprehensive mocking and utilities
 */

import { jest } from '@jest/globals';
import nock from 'nock';
import MockDate from 'mockdate';

// Import test utilities
import './test-utils/database-mock';
import './test-utils/firebase-mock';
import './test-utils/redis-mock';

// Global test configuration
beforeAll(async () => {
  // Set deterministic date for testing
  MockDate.set('2024-01-01T00:00:00.000Z');

  // Configure global test timeouts
  jest.setTimeout(30000);

  // Setup HTTP mocking
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  // Mock external services
  setupExternalServiceMocks();

  // Initialize test database
  await initializeTestDatabase();
});

afterAll(async () => {
  // Restore date
  MockDate.reset();

  // Clean up HTTP mocks
  nock.cleanAll();
  nock.enableNetConnect();

  // Cleanup test database
  await cleanupTestDatabase();
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Clear HTTP interceptors
  nock.cleanAll();

  // Reset any test state
  resetTestState();
});

afterEach(() => {
  // Verify no pending HTTP requests
  if (!nock.isDone()) {
    console.warn('Pending HTTP mocks detected');
    nock.cleanAll();
  }
});

// Mock external services
function setupExternalServiceMocks() {
  // Mock Stripe API
  nock('https://api.stripe.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json',
    });

  // Mock SendGrid API
  nock('https://api.sendgrid.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json',
    });

  // Mock Twilio API
  nock('https://api.twilio.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json',
    });

  // Mock Google Cloud Services
  nock('https://googleapis.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json',
    });
}

async function initializeTestDatabase() {
  // Initialize test database with fixtures
  console.log('Initializing test database...');
}

async function cleanupTestDatabase() {
  // Clean up test database
  console.log('Cleaning up test database...');
}

function resetTestState() {
  // Reset any global test state
}