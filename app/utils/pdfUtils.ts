import { ScheduledRoutine } from '../types/schedule';
import { formatTime } from './timeUtils';

export const generateSchedulePDF = (scheduledRoutines: ScheduledRoutine[], rangeDates: Date[]) => {
  // Create a simple HTML document for PDF generation
  const htmlContent = generateScheduleHTML(scheduledRoutines, rangeDates);
  
  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

const generateScheduleHTML = (scheduledRoutines: ScheduledRoutine[], rangeDates: Date[]) => {
  const rangeStart = rangeDates[0];
  const rangeEnd = rangeDates[rangeDates.length - 1];
  const rangeLabel = `${rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Parse YYYY-MM-DD into a local Date (avoids UTC shift)
  const parseLocalDate = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  
  // Build a flat, sorted list (by date then time)
  const sorted = [...scheduledRoutines].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const aMin = a.startTime.hour * 60 + a.startTime.minute;
    const bMin = b.startTime.hour * 60 + b.startTime.minute;
    return aMin - bMin;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dance Studio Schedule - ${rangeLabel}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: white; color: #333; }
        .header { text-align: center; margin-bottom: 16px; }
        .header h1 { color: #111827; margin: 0; font-size: 20px; }
        .header p { color: #6B7280; margin: 6px 0 0 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #E5E7EB; padding: 8px 10px; font-size: 12px; }
        th { background: #F3F4F6; text-align: left; color: #374151; }
        tbody tr:nth-child(even) { background: #FAFAFA; }
        .muted { color: #6B7280; }
        @media print { body { margin: 0; padding: 12px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dance Studio Schedule</h1>
        <p>${rangeLabel}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Date</th>
            <th style="width: 90px;">Start</th>
            <th style="width: 90px;">End</th>
            <th style="width: 120px;">Room</th>
            <th>Routine</th>
            <th style="width: 160px;">Teacher</th>
            <th>Dancers</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r => `
            <tr>
              <td>${parseLocalDate(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</td>
              <td>${formatTime(r.startTime.hour, r.startTime.minute)}</td>
              <td>${formatTime(r.endTime.hour, r.endTime.minute)}</td>
              <td>${r.roomId}</td>
              <td>${r.routine.songTitle}</td>
              <td>${r.routine.teacher.name}</td>
              <td class="muted">${r.routine.dancers.map(d => d.name).join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      
    </body>
    </html>
  `;
};
