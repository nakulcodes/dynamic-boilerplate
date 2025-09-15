import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      'urn:ietf:wg:oauth:2.0:oob',
    );

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(accessToken: string, event: CalendarEvent): Promise<any> {
    try {
      // Set the access token for this request
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      this.logger.log(`Event created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create event:', error);
      throw error;
    }
  }

  async listEvents(accessToken: string, maxResults = 10): Promise<any> {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Failed to list events:', error);
      throw error;
    }
  }

  async updateEvent(accessToken: string, eventId: string, event: Partial<CalendarEvent>): Promise<any> {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
      });

      this.logger.log(`Event updated: ${eventId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update event:', error);
      throw error;
    }
  }

  async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      this.logger.log(`Event deleted: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete event:', error);
      throw error;
    }
  }
}