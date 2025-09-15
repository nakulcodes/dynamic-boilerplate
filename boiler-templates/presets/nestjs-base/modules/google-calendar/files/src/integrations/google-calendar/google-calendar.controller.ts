import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GoogleCalendarService, CalendarEvent } from './google-calendar.service';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class GoogleCalendarController {
  constructor(private googleCalendarService: GoogleCalendarService) {}

  @Get('events')
  async listEvents(@Headers('google-access-token') accessToken: string) {
    if (!accessToken) {
      throw new Error('Google access token required');
    }
    return this.googleCalendarService.listEvents(accessToken);
  }

  @Post('events')
  async createEvent(
    @Headers('google-access-token') accessToken: string,
    @Body() event: CalendarEvent,
  ) {
    if (!accessToken) {
      throw new Error('Google access token required');
    }
    return this.googleCalendarService.createEvent(accessToken, event);
  }

  @Put('events/:eventId')
  async updateEvent(
    @Headers('google-access-token') accessToken: string,
    @Param('eventId') eventId: string,
    @Body() event: Partial<CalendarEvent>,
  ) {
    if (!accessToken) {
      throw new Error('Google access token required');
    }
    return this.googleCalendarService.updateEvent(accessToken, eventId, event);
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @Headers('google-access-token') accessToken: string,
    @Param('eventId') eventId: string,
  ) {
    if (!accessToken) {
      throw new Error('Google access token required');
    }
    await this.googleCalendarService.deleteEvent(accessToken, eventId);
    return { message: 'Event deleted successfully' };
  }
}