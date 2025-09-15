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
import {
  SendSmsDto,
  SendWhatsAppDto,
  MakeCallDto,
  BulkSmsDto,
  ListMessagesDto,
  ListCallsDto,
  ValidatePhoneDto,
  NotificationResponseDto,
  CallResponseDto,
  BulkSmsResponseDto,
  PhoneValidationResponseDto,
  MessageListResponseDto,
  CallListResponseDto,
} from './dto';

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
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async sendSms(@Body() sendSmsDto: SendSmsDto): Promise<NotificationResponseDto> {
    const options: SendSmsOptions = {
      to: sendSmsDto.to,
      body: sendSmsDto.body,
      from: sendSmsDto.from,
      mediaUrl: sendSmsDto.mediaUrl,
    };

    const result = await this.notificationsService.sendSms(options);

    return {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
      direction: result.direction,
      dateCreated: result.dateCreated,
      dateSent: result.dateSent,
      price: result.price,
      priceUnit: result.priceUnit,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      numMedia: result.numMedia,
      type: 'sms',
      metadata: {
        priority: sendSmsDto.priority,
        statusCallback: sendSmsDto.statusCallback,
      },
    };
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
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async sendWhatsApp(@Body() sendWhatsAppDto: SendWhatsAppDto): Promise<NotificationResponseDto> {
    const options: SendWhatsAppOptions = {
      to: sendWhatsAppDto.to,
      body: sendWhatsAppDto.body,
      from: sendWhatsAppDto.from,
      mediaUrl: sendWhatsAppDto.mediaUrl,
    };

    const result = await this.notificationsService.sendWhatsApp(options);

    return {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
      direction: result.direction,
      dateCreated: result.dateCreated,
      dateSent: result.dateSent,
      price: result.price,
      priceUnit: result.priceUnit,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      numMedia: result.numMedia,
      type: 'whatsapp',
      metadata: {
        templateName: sendWhatsAppDto.templateName,
        templateParameters: sendWhatsAppDto.templateParameters,
        statusCallback: sendWhatsAppDto.statusCallback,
      },
    };
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
    type: CallResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async makeCall(@Body() makeCallDto: MakeCallDto): Promise<CallResponseDto> {
    const options: MakeCallOptions = {
      to: makeCallDto.to,
      from: makeCallDto.from,
      url: makeCallDto.url,
      twiml: makeCallDto.twiml,
    };

    const result = await this.notificationsService.makeCall(options);

    return {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      direction: result.direction,
      dateCreated: result.dateCreated,
      startTime: result.startTime,
      endTime: result.endTime,
      duration: result.duration,
      price: result.price,
      priceUnit: result.priceUnit,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      metadata: {
        timeout: makeCallDto.timeout,
        timeLimit: makeCallDto.timeLimit,
        statusCallback: makeCallDto.statusCallback,
        statusCallbackEvent: makeCallDto.statusCallbackEvent,
        statusCallbackMethod: makeCallDto.statusCallbackMethod,
      },
    };
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
    type: BulkSmsResponseDto,
  })
  async sendBulkSms(
    @Body() bulkSmsDto: BulkSmsDto
  ): Promise<BulkSmsResponseDto> {
    if (!bulkSmsDto.phoneNumbers || !Array.isArray(bulkSmsDto.phoneNumbers) || bulkSmsDto.phoneNumbers.length === 0) {
      throw new BadRequestException('phoneNumbers array is required and must not be empty');
    }

    if (!bulkSmsDto.body) {
      throw new BadRequestException('Message body is required');
    }

    const initiatedAt = new Date().toISOString();
    const batchId = bulkSmsDto.batchId || `bulk_${Date.now()}`;

    const results = await this.notificationsService.sendBulkSms(
      bulkSmsDto.phoneNumbers,
      bulkSmsDto.body,
      bulkSmsDto.from
    );

    const successCount = results.filter(r => r.sid).length;
    const failureCount = results.length - successCount;
    const completedAt = new Date().toISOString();

    return {
      batchId,
      totalCount: bulkSmsDto.phoneNumbers.length,
      successCount,
      failureCount,
      results: results.map((result, index) => ({
        phoneNumber: bulkSmsDto.phoneNumbers[index],
        success: !!result.sid,
        sid: result.sid,
        error: result.errorMessage,
        errorCode: result.errorCode,
        processedAt: new Date().toISOString(),
      })),
      successRate: Math.round((successCount / bulkSmsDto.phoneNumbers.length) * 100),
      initiatedAt,
      completedAt,
      metadata: {
        priority: bulkSmsDto.priority,
        statusCallback: bulkSmsDto.statusCallback,
      },
    };
  }

  @Get('message/:sid/status')
  @ApiOperation({ summary: 'Get message status by SID' })
  @ApiResponse({
    status: 200,
    description: 'Message status retrieved',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageStatus(@Param('sid') sid: string): Promise<NotificationResponseDto> {
    const result = await this.notificationsService.getMessageStatus(sid);

    return {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
      direction: result.direction,
      dateCreated: result.dateCreated,
      dateSent: result.dateSent,
      price: result.price,
      priceUnit: result.priceUnit,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      numMedia: result.numMedia,
      type: 'sms',
    };
  }

  @Get('call/:sid/status')
  @ApiOperation({ summary: 'Get call status by SID' })
  @ApiResponse({
    status: 200,
    description: 'Call status retrieved',
    type: CallResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Call not found',
  })
  async getCallStatus(@Param('sid') sid: string): Promise<CallResponseDto> {
    const result = await this.notificationsService.getCallStatus(sid);

    return {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      direction: result.direction,
      dateCreated: result.dateCreated,
      startTime: result.startTime,
      endTime: result.endTime,
      duration: result.duration,
      price: result.price,
      priceUnit: result.priceUnit,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    };
  }

  @Get('messages')
  @ApiOperation({ summary: 'List recent messages' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved',
    type: MessageListResponseDto,
  })
  async listMessages(
    @Query() listDto: ListMessagesDto,
  ): Promise<MessageListResponseDto> {
    const messages = await this.notificationsService.listMessages(
      listDto.limit || 20,
      listDto.to,
      listDto.from
    );

    return {
      messages: messages.map(msg => ({
        sid: msg.sid,
        status: msg.status,
        to: msg.to,
        from: msg.from,
        body: msg.body,
        direction: msg.direction,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent,
        price: msg.price,
        priceUnit: msg.priceUnit,
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage,
        numMedia: msg.numMedia,
        type: 'sms',
      })),
      count: messages.length,
      filters: {
        limit: listDto.limit || 20,
        to: listDto.to,
        from: listDto.from,
        status: listDto.status,
        dateSentAfter: listDto.dateSentAfter,
        dateSentBefore: listDto.dateSentBefore,
      },
      retrievedAt: new Date().toISOString(),
    };
  }

  @Get('calls')
  @ApiOperation({ summary: 'List recent calls' })
  @ApiResponse({
    status: 200,
    description: 'Calls retrieved',
    type: CallListResponseDto,
  })
  async listCalls(
    @Query() listDto: ListCallsDto,
  ): Promise<CallListResponseDto> {
    const calls = await this.notificationsService.listCalls(
      listDto.limit || 20,
      listDto.to,
      listDto.from
    );

    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);

    return {
      calls: calls.map(call => ({
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration,
        price: call.price,
        priceUnit: call.priceUnit,
        errorCode: call.errorCode,
        errorMessage: call.errorMessage,
      })),
      count: calls.length,
      filters: {
        limit: listDto.limit || 20,
        to: listDto.to,
        from: listDto.from,
        status: listDto.status,
        startTimeAfter: listDto.startTimeAfter,
        startTimeBefore: listDto.startTimeBefore,
        direction: listDto.direction,
      },
      retrievedAt: new Date().toISOString(),
      totalDuration,
    };
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
    type: PhoneValidationResponseDto,
  })
  async validatePhoneNumber(
    @Body() validateDto: ValidatePhoneDto
  ): Promise<PhoneValidationResponseDto> {
    const { phoneNumber } = validateDto;

    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const isValid = this.notificationsService.validatePhoneNumber(phoneNumber);
    const formatted = phoneNumber; // The service formatPhoneNumber method is private
    const errors: string[] = [];

    if (!isValid) {
      errors.push('Invalid phone number format');
    }

    return {
      phoneNumber,
      isValid,
      formatted,
      countryCode: phoneNumber.startsWith('+1') ? 'US' : undefined,
      countryName: phoneNumber.startsWith('+1') ? 'United States' : undefined,
      type: 'mobile', // This would come from a proper lookup service
      smsCapable: isValid,
      voiceCapable: isValid,
      whatsappCapable: isValid,
      validatedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        confidence: isValid ? 0.95 : 0.1,
        source: 'basic_validation',
      },
    };
  }
}