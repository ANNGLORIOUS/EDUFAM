import React, { useState } from 'react';
import { ListGroup, Button, Overlay, Popover } from 'react-bootstrap';

export interface NotificationItem {
  id: number;
  message: string;
  date: string;
  event: string;
  description: string;
  extra: string;
  start: string;
  end: string;
}

interface NotificationsPopupProps {
  notifications: NotificationItem[];
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ notifications }) => {
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setShow(!show);
    setTarget(event.target as HTMLElement);
  };

  return (
    <>
      <Button variant="link" style={{ fontSize: 22, position: 'relative' }} onClick={handleClick}>
  <i className="bi bi-bell" style={{ color: '#43cea2' }}></i>
        {notifications.length > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, background: '#fb7100', color: '#fff', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>
        )}
      </Button>
      <Overlay show={show} target={target} placement="bottom" containerPadding={20} rootClose onHide={() => setShow(false)}>
        <Popover id="notifications-popover" style={{ minWidth: 320 }}>
          <Popover.Header as="h3">Recent Notifications</Popover.Header>
          <Popover.Body>
            {notifications.length === 0 ? (
              <div className="text-muted">No notifications</div>
            ) : (
              <ListGroup variant="flush">
                {notifications.map((notif) => (
                  <ListGroup.Item key={notif.id}>
                    <strong>{notif.message}</strong>
                    <div className="text-muted" style={{ fontSize: "0.9em" }}>{notif.date}</div>
                    <div style={{ fontSize: "0.95em", margin: "0.25em 0" }}>{notif.description}</div>
                    <div style={{ fontSize: "0.92em", color: '#555', marginBottom: 2 }}>{notif.extra}</div>
                    <div style={{ fontSize: "0.95em" }}>
                      <span className="fw-bold">Time:</span> {notif.start} - {notif.end}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  );
};

export default NotificationsPopup;
