import type { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { lambdaHandler } from './lambda.handler';

// We'll mock console.error instead of the logger
// This will help us verify error handling without dealing with complex mocks
// eslint-disable-next-line no-console
const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

jest.mock('@namespace/logger', () => {
  return {
    createLogger: () => ({
      error: (error: Error, message?: string) => {
        // Forward to our mock so we can track calls
        mockConsoleError(error, message);
      },
      info: jest.fn(),
      debug: jest.fn(),
    }),
  };
});

interface TestPayload {
  foo: string;
  bar: number;
}

describe('lambdaHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    // Restore original console.error
    // eslint-disable-next-line no-console
    console.error = originalConsoleError;
  });

  const testHandler = (payload: TestPayload) => {
    return Promise.resolve({
      success: true,
      inputParameters: payload,
    });
  };

  const wrappedHandler = lambdaHandler(testHandler);

  const testPayload: TestPayload = {
    foo: 'test',
    bar: 123,
  };

  it('should handle direct invocation', async () => {
    const result = await wrappedHandler(testPayload);
    expect(result).toEqual({
      success: true,
      inputParameters: testPayload,
    });
  });

  it('should handle API Gateway events', async () => {
    const apiEvent: APIGatewayProxyEvent = {
      body: JSON.stringify(testPayload),
      httpMethod: 'POST',
    } as APIGatewayProxyEvent;

    const result = await wrappedHandler(apiEvent);
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          success: true,
          inputParameters: testPayload,
        },
        error: null,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle SQS events', async () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(testPayload),
        },
      ],
    } as SQSEvent;

    const result = await wrappedHandler(sqsEvent);
    expect(result).toEqual({
      success: true,
      inputParameters: testPayload,
    });
  });

  it('should handle API Gateway errors', async () => {
    const errorHandler = () => {
      throw new Error('Test error');
    };
    const wrappedErrorHandler = lambdaHandler(errorHandler);

    const apiEvent: APIGatewayProxyEvent = {
      body: JSON.stringify(testPayload),
      httpMethod: 'POST',
    } as APIGatewayProxyEvent;

    const result = await wrappedErrorHandler(apiEvent);
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        data: null,
        error: 'Test error',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check that our mock was called with the expected parameters
    expect(mockConsoleError).toHaveBeenCalledWith(expect.any(Error), 'Lambda handler error');
  });
});
