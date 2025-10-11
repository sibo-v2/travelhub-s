import { TripPlan, DailyItinerary } from './aiTripPlannerService';

class ItineraryExportService {
  exportToPDF(tripPlan: TripPlan): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    const html = this.generatePDFHTML(tripPlan);
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  }

  private generatePDFHTML(tripPlan: TripPlan): string {
    const totalActivities = tripPlan.itinerary.reduce(
      (sum, day) => sum + day.activities.length,
      0
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${tripPlan.destination} - Itinerary</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              background: white;
              color: #1f2937;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #0ea5e9;
            }
            .header h1 {
              font-size: 36px;
              color: #0ea5e9;
              margin-bottom: 10px;
            }
            .header p { color: #6b7280; font-size: 14px; }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .summary-card {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-card label {
              display: block;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .summary-card value {
              display: block;
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
            }
            .day-section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .day-header {
              background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .day-title { font-size: 20px; font-weight: bold; }
            .day-cost { font-size: 18px; }
            .activity {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 15px;
            }
            .activity-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 10px;
            }
            .activity-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
            }
            .activity-category {
              background: #0ea5e9;
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              text-transform: capitalize;
            }
            .activity-description {
              color: #6b7280;
              margin-bottom: 15px;
              line-height: 1.5;
            }
            .activity-details {
              display: flex;
              gap: 20px;
              font-size: 14px;
              color: #4b5563;
            }
            .activity-detail {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .day-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌍 ${tripPlan.destination}</h1>
            <p>Your Personalized Travel Itinerary</p>
            <p>${new Date(tripPlan.startDate).toLocaleDateString()} - ${new Date(tripPlan.endDate).toLocaleDateString()}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <label>Duration</label>
              <value>${tripPlan.itinerary.length} Days</value>
            </div>
            <div class="summary-card">
              <label>Activities</label>
              <value>${totalActivities}</value>
            </div>
            <div class="summary-card">
              <label>Total Cost</label>
              <value>$${tripPlan.totalCost.toFixed(2)}</value>
            </div>
            <div class="summary-card">
              <label>Budget</label>
              <value>$${tripPlan.budget.toFixed(2)}</value>
            </div>
          </div>

          ${tripPlan.itinerary
            .map(
              (day) => `
            <div class="day-section">
              <div class="day-header">
                <div class="day-title">Day ${day.day} - ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div class="day-cost">$${day.totalCost.toFixed(2)}</div>
              </div>
              ${day.activities
                .map(
                  (activity) => `
                <div class="activity">
                  <div class="activity-header">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-category">${activity.category}</div>
                  </div>
                  <div class="activity-description">${activity.description}</div>
                  <div class="activity-details">
                    <div class="activity-detail">⏰ ${activity.time}</div>
                    <div class="activity-detail">⏱️ ${activity.duration}</div>
                    ${activity.location ? `<div class="activity-detail">📍 ${activity.location}</div>` : ''}
                    ${activity.cost ? `<div class="activity-detail">💰 $${activity.cost.toFixed(2)}</div>` : ''}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
            )
            .join('')}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} | Have a wonderful trip! ✈️</p>
          </div>
        </body>
      </html>
    `;
  }

  exportToGoogleCalendar(tripPlan: TripPlan): void {
    const events = this.generateCalendarEvents(tripPlan);
    const googleCalendarUrl = this.createGoogleCalendarUrl(events[0]);
    window.open(googleCalendarUrl, '_blank');
  }

  exportToICS(tripPlan: TripPlan): void {
    const icsContent = this.generateICSContent(tripPlan);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripPlan.destination.replace(/\s+/g, '_')}_itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private generateCalendarEvents(tripPlan: TripPlan) {
    const events: any[] = [];

    tripPlan.itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        const startDate = new Date(day.date);
        const [hours, minutes] = activity.time.split(':').map(Number);
        startDate.setHours(hours || 0, minutes || 0, 0, 0);

        const durationMatch = activity.duration.match(/(\d+\.?\d*)\s*(hour|hr|h|minute|min|m)/i);
        let durationMinutes = 60;
        if (durationMatch) {
          const value = parseFloat(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          durationMinutes = unit.startsWith('h') ? value * 60 : value;
        }

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        events.push({
          title: activity.title,
          description: activity.description,
          location: activity.location || tripPlan.destination,
          startDate,
          endDate,
        });
      });
    });

    return events;
  }

  private createGoogleCalendarUrl(event: any): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private generateICSContent(tripPlan: TripPlan): string {
    const events = this.generateCalendarEvents(tripPlan);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (str: string) => {
      return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//Travel Planner//EN\r\n';
    ics += 'CALSCALE:GREGORIAN\r\n';
    ics += 'METHOD:PUBLISH\r\n';
    ics += `X-WR-CALNAME:${escapeICS(tripPlan.destination)} Trip\r\n`;
    ics += 'X-WR-TIMEZONE:UTC\r\n';

    events.forEach((event) => {
      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@travelplanner.com\r\n`;
      ics += `DTSTAMP:${formatICSDate(new Date())}\r\n`;
      ics += `DTSTART:${formatICSDate(event.startDate)}\r\n`;
      ics += `DTEND:${formatICSDate(event.endDate)}\r\n`;
      ics += `SUMMARY:${escapeICS(event.title)}\r\n`;
      ics += `DESCRIPTION:${escapeICS(event.description)}\r\n`;
      ics += `LOCATION:${escapeICS(event.location)}\r\n`;
      ics += 'END:VEVENT\r\n';
    });

    ics += 'END:VCALENDAR\r\n';

    return ics;
  }

  exportToAppleWallet(tripPlan: TripPlan): void {
    alert(
      'Apple Wallet Pass generation requires a backend service with Apple Developer certificates. ' +
        'For now, please use the Calendar export option which works with Apple Calendar.'
    );

    this.exportToICS(tripPlan);
  }
}

export const itineraryExportService = new ItineraryExportService();
