import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  NotificationsService,
  SendSmsOptions,
  SendWhatsAppOptions,
  MakeCallOptions,
  NotificationResult,
} from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS message' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient phone number (with country code)',
          example: '+1234567890',
        },
        body: {
          type: 'string',
          description: 'Message content',
          example: 'Hello from our application!',
        },
        from: {
          type: 'string',
          description: 'Sender phone number (optional)',
          example: '+0987654321',
        },
        mediaUrl: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional media URLs for MMS',
          example: ['https://example.com/image.jpg'],
        },
      },
      required: ['to', 'body'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'SMS sent successfully',
    schema: {
      example: {
        sid: 'SM1234567890abcdef1234567890abcdef',
        status: 'queued',
        to: '+1234567890',
        from: '+0987654321',
        body: 'Hello from our application!',
        direction: 'outbound-api',
        dateCreated: '2025-09-15T10:30:00.000Z',
        price: '0.0075',
        priceUnit: 'USD',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async sendSms(@Body() sendSmsDto: SendSmsOptions): Promise<NotificationResult> {
    return this.notificationsService.sendSms(sendSmsDto);
  }

  @Post('whatsapp')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient WhatsApp number (with country code)',
          example: '+1234567890',
        },
        body: {
          type: 'string',
          description: 'Message content',
          example: 'Hello from our application via WhatsApp!',
        },
        from: {
          type: 'string',
          description: 'Sender WhatsApp number (optional)',
          example: '+0987654321',
        },
        mediaUrl: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional media URLs',
          example: ['https://example.com/document.pdf'],
        },
      },
      required: ['to', 'body'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp message sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async sendWhatsApp(@Body() sendWhatsAppDto: SendWhatsAppOptions): Promise<NotificationResult> {
    return this.notificationsService.sendWhatsApp(sendWhatsAppDto);
  }

  @Post('call')
  @ApiOperation({ summary: 'Make voice call' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient phone number (with country code)',
          example: '+1234567890',
        },
        from: {
          type: 'string',
          description: 'Caller phone number (optional)',
          example: '+0987654321',
        },
        url: {
          type: 'string',
          description: 'URL to TwiML instructions (mutually exclusive with twiml)',
          example: 'https://example.com/voice.xml',
        },
        twiml: {
          type: 'string',
          description: 'TwiML instructions (mutually exclusive with url)',
          example: '<Response><Say>Hello, this is a test call.</Say></Response>',
        },
      },
      required: ['to'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Call initiated successfully',
    schema: {
      example: {
        sid: 'CA1234567890abcdef1234567890abcdef',
        status: 'queued',
        to: '+1234567890',
        from: '+0987654321',
        direction: 'outbound-api',
        dateCreated: '2025-09-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async makeCall(@Body() makeCallDto: MakeCallOptions): Promise<NotificationResult> {
    return this.notificationsService.makeCall(makeCallDto);
  }

  @Post('sms/bulk')
  @ApiOperation({ summary: 'Send bulk SMS messages' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumbers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of recipient phone numbers',
          example: ['+1234567890', '+0987654321'],
        },
        body: {
          type: 'string',
          description: 'Message content',
          example: 'Bulk message from our application!',
        },
        from: {
          type: 'string',
          description: 'Sender phone number (optional)',
          example: '+1122334455',
        },
      },
      required: ['phoneNumbers', 'body'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk SMS sent (individual results may vary)',
  })
  async sendBulkSms(
    @Body() bulkSmsDto: { phoneNumbers: string[]; body: string; from?: string }
  ): Promise<NotificationResult[]> {
    const { phoneNumbers, body, from } = bulkSmsDto;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      throw new BadRequestException('phoneNumbers array is required and must not be empty');
    }

    if (!body) {
      throw new BadRequestException('Message body is required');
    }

    return this.notificationsService.sendBulkSms(phoneNumbers, body, from);
  }

  @Get('message/:sid/status')
  @ApiOperation({ summary: 'Get message status by SID' })
  @ApiResponse({
    status: 200,
    description: 'Message status retrieved',
    schema: {
      example: {
        sid: 'SM1234567890abcdef1234567890abcdef',
        status: 'delivered',
        to: '+1234567890',
        from: '+0987654321',
        body: 'Hello from our application!',
        direction: 'outbound-api',
        dateCreated: '2025-09-15T10:30:00.000Z',
        dateSent: '2025-09-15T10:30:05.000Z',
        price: '0.0075',
        priceUnit: 'USD',
        errorCode: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageStatus(@Param('sid') sid: string) {
    return this.notificationsService.getMessageStatus(sid);
  }

  @Get('call/:sid/status')
  @ApiOperation({ summary: 'Get call status by SID' })
  @ApiResponse({
    status: 200,
    description: 'Call status retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Call not found',
  })
  async getCallStatus(@Param('sid') sid: string) {
    return this.notificationsService.getCallStatus(sid);
  }

  @Get('messages')
  @ApiOperation({ summary: 'List recent messages' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved',
  })
  async listMessages(
    @Query('limit') limit?: string,
    @Query('to') to?: string,
    @Query('from') from?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.listMessages(parsedLimit, to, from);
  }

  @Get('calls')
  @ApiOperation({ summary: 'List recent calls' })
  @ApiResponse({
    status: 200,
    description: 'Calls retrieved',
  })
  async listCalls(
    @Query('limit') limit?: string,
    @Query('to') to?: string,
    @Query('from') from?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.listCalls(parsedLimit, to, from);
  }

  @Post('validate-phone')
  @ApiOperation({ summary: 'Validate phone number format' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Phone number to validate',
          example: '+1234567890',
        },
      },
      required: ['phoneNumber'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Phone number validation result',
    schema: {
      example: {
        phoneNumber: '+1234567890',
        isValid: true,
        formatted: '+1234567890',
      },
    },
  })
  async validatePhoneNumber(
    @Body() validateDto: { phoneNumber: string }
  ): Promise<{ phoneNumber: string; isValid: boolean; formatted: string }> {
    const { phoneNumber } = validateDto;

    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const isValid = this.notificationsService.validatePhoneNumber(phoneNumber);
    const formatted = phoneNumber; // The service formatPhoneNumber method is private

    return {
      phoneNumber,
      isValid,
      formatted,
    };
  }
}