import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export interface SendSmsOptions {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
}

export interface SendWhatsAppOptions {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
}

export interface MakeCallOptions {
  to: string;
  from?: string;
  url?: string;
  twiml?: string;
}

export interface NotificationResult {
  sid: string;
  status: string;
  to: string;
  from: string;
  body?: string;
  direction: string;
  dateCreated: Date;
  price?: string;
  priceUnit?: string;
}

@Injectable()
export class NotificationsService {
  private twilioClient: Twilio;
  private defaultFromNumber: string;
  private defaultWhatsAppNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }

    this.twilioClient = new Twilio(accountSid, authToken);
    this.defaultFromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    this.defaultWhatsAppNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');
  }

  /**
   * Send SMS message
   */
  async sendSms(options: SendSmsOptions): Promise<NotificationResult> {
    try {
      const { to, body, from, mediaUrl } = options;

      if (!to || !body) {
        throw new BadRequestException('Phone number and message body are required');
      }

      // Format phone number with country code if not present
      const formattedTo = this.formatPhoneNumber(to);
      const fromNumber = from || this.defaultFromNumber;

      if (!fromNumber) {
        throw new BadRequestException('From phone number is required. Set TWILIO_PHONE_NUMBER or provide in options');
      }

      const message = await this.twilioClient.messages.create({
        to: formattedTo,
        from: fromNumber,
        body,
        ...(mediaUrl && { mediaUrl }),
      });

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        direction: message.direction,
        dateCreated: message.dateCreated,
        price: message.price,
        priceUnit: message.priceUnit,
      };
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(options: SendWhatsAppOptions): Promise<NotificationResult> {
    try {
      const { to, body, from, mediaUrl } = options;

      if (!to || !body) {
        throw new BadRequestException('Phone number and message body are required');
      }

      // Format WhatsApp number
      const formattedTo = this.formatWhatsAppNumber(to);
      const fromNumber = from || this.defaultWhatsAppNumber;

      if (!fromNumber) {
        throw new BadRequestException('From WhatsApp number is required. Set TWILIO_WHATSAPP_NUMBER or provide in options');
      }

      const message = await this.twilioClient.messages.create({
        to: formattedTo,
        from: this.formatWhatsAppNumber(fromNumber),
        body,
        ...(mediaUrl && { mediaUrl }),
      });

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        direction: message.direction,
        dateCreated: message.dateCreated,
        price: message.price,
        priceUnit: message.priceUnit,
      };
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new BadRequestException(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Make voice call
   */
  async makeCall(options: MakeCallOptions): Promise<NotificationResult> {
    try {
      const { to, from, url, twiml } = options;

      if (!to) {
        throw new BadRequestException('Phone number is required');
      }

      if (!url && !twiml) {
        throw new BadRequestException('Either URL or TwiML is required for voice calls');
      }

      const formattedTo = this.formatPhoneNumber(to);
      const fromNumber = from || this.defaultFromNumber;

      if (!fromNumber) {
        throw new BadRequestException('From phone number is required. Set TWILIO_PHONE_NUMBER or provide in options');
      }

      const callOptions: any = {
        to: formattedTo,
        from: fromNumber,
      };

      if (url) {
        callOptions.url = url;
      } else {
        callOptions.twiml = twiml;
      }

      const call = await this.twilioClient.calls.create(callOptions);

      return {
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
        price: call.price,
        priceUnit: call.priceUnit,
      };
    } catch (error) {
      console.error('Failed to make call:', error);
      throw new BadRequestException(`Failed to make call: ${error.message}`);
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      const message = await this.twilioClient.messages(messageSid).fetch();

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        direction: message.direction,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      console.error('Failed to get message status:', error);
      throw new BadRequestException(`Failed to get message status: ${error.message}`);
    }
  }

  /**
   * Get call status
   */
  async getCallStatus(callSid: string): Promise<any> {
    try {
      const call = await this.twilioClient.calls(callSid).fetch();

      return {
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
      };
    } catch (error) {
      console.error('Failed to get call status:', error);
      throw new BadRequestException(`Failed to get call status: ${error.message}`);
    }
  }

  /**
   * List recent messages
   */
  async listMessages(limit: number = 20, to?: string, from?: string): Promise<any[]> {
    try {
      const options: any = { limit };

      if (to) options.to = this.formatPhoneNumber(to);
      if (from) options.from = from;

      const messages = await this.twilioClient.messages.list(options);

      return messages.map(message => ({
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        direction: message.direction,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit,
      }));
    } catch (error) {
      console.error('Failed to list messages:', error);
      throw new BadRequestException(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * List recent calls
   */
  async listCalls(limit: number = 20, to?: string, from?: string): Promise<any[]> {
    try {
      const options: any = { limit };

      if (to) options.to = this.formatPhoneNumber(to);
      if (from) options.from = from;

      const calls = await this.twilioClient.calls.list(options);

      return calls.map(call => ({
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
      }));
    } catch (error) {
      console.error('Failed to list calls:', error);
      throw new BadRequestException(`Failed to list calls: ${error.message}`);
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  }

  /**
   * Format phone number with country code
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with country code, assume US (+1)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // If already has country code
    if (cleaned.length > 10 && !phoneNumber.startsWith('+')) {
      return `+${cleaned}`;
    }

    return phoneNumber;
  }

  /**
   * Format WhatsApp number
   */
  private formatWhatsAppNumber(phoneNumber: string): string {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted.startsWith('whatsapp:') ? formatted : `whatsapp:${formatted}`;
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSms(
    phoneNumbers: string[],
    body: string,
    from?: string
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendSms({
          to: phoneNumber,
          body,
          from,
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}:`, error);
        // Continue with other numbers even if one fails
        results.push({
          sid: 'failed',
          status: 'failed',
          to: phoneNumber,
          from: from || this.defaultFromNumber || '',
          body,
          direction: 'outbound-api',
          dateCreated: new Date(),
        });
      }
    }

    return results;
  }
}