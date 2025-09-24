import React from 'react';
import { Card } from 'react-bootstrap';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
}

interface EventCalendarViewProps {
  events: Event[];
}

const EventCalendarView: React.FC<EventCalendarViewProps> = ({ events }) => {
  return (
    <Card>
      <Card.Header><h5>Event Calendar</h5></Card.Header>
      <Card.Body>
        <div style={{ height: 600, background: "#fff", borderRadius: "8px", padding: "16px" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 550 }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCalendarView;
