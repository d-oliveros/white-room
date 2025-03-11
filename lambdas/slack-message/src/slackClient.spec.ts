import type { SlackMessage } from './slackClient.schemas';
import { postSlackMessage } from './slackClient';

const { SLACK_ENDPOINT } = process.env;

// This logger isn't actually used in our tests, we need to mock the module instead
// const logger = createLogger('slackClient.spec');

// Mock the logger module
jest.mock('@namespace/logger', () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  return {
    createLogger: jest.fn().mockReturnValue(mockLogger),
  };
});

// Now we can access the mocked logger used in slackClient.ts
const mockLoggerModule = jest.requireMock('@namespace/logger');
const mockLogger = mockLoggerModule.createLogger();

describe('slackClient', () => {
  describe('postSlackMessage', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should post a message to Slack with text', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const message: SlackMessage = {
        channel: 'test-channel',
        text: 'Test message',
      };

      await postSlackMessage(message);

      expect(global.fetch).toHaveBeenCalledWith(
        SLACK_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }),
      );
    });

    it('should post a message to Slack with blocks', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const message: SlackMessage = {
        channel: 'test-channel',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Test message' } }],
      };

      await postSlackMessage(message);

      expect(global.fetch).toHaveBeenCalledWith(
        SLACK_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }),
      );
    });

    it('should use default identity if not provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const message: SlackMessage = {
        channel: 'test-channel',
        text: 'Test message',
      };

      await postSlackMessage(message);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.username).toBe('Namespace');
      expect(callBody.icon_url).toBeDefined();
    });

    it('should add original channel info when redirecting', async () => {
      if (!process.env.SLACK_REDIRECT_MESSAGES_CHANNEL) {
        return;
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const message: SlackMessage = {
        channel: 'original-channel',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Test message' } }],
      };

      await postSlackMessage(message);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.blocks[1]).toEqual({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Original Channel:*\n#original-channel',
          },
        ],
      });
    });

    it('should log error if Slack API call fails', async () => {
      // Reset the mock before this test
      mockLogger.error.mockReset();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const message: SlackMessage = {
        channel: 'test-channel',
        text: 'Test message',
      };

      const result = await postSlackMessage(message);
      expect(result).toBeNull();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'SlackError',
          message: expect.stringContaining('HTTP error! status: 500'),
        }),
      );
    });

    it('should throw when sending text and blocks simultaneously', async () => {
      const message = {
        channel: 'test-channel',
        text: 'Test message',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Test block',
            },
          },
        ],
      };

      await expect(postSlackMessage(message as SlackMessage)).rejects.toThrow(
        "Exactly one of 'blocks' or 'text' must be provided, but not both",
      );
    });

    // Integration test: Remove ".skip()" to run it. Make sure to set the SLACK_ENDPOINT environment variable.
    it.skip('should post a real slack message', async () => {
      const message: SlackMessage = {
        channel: 'slack-webhook-sandbox',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Integration Test*\nThis message was sent as part of an integration test.',
            },
          },
        ],
      };

      await postSlackMessage(message);
    });
  });
});
