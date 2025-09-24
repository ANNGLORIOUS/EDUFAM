import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Overlay, Popover } from 'react-bootstrap';
import { useNotifications, type NotificationItem, type UserType } from '../context/NotificationsContext';

interface NotificationsPopupProps {
  notifications: NotificationItem[];
  userType?: UserType;
  userEmail?: string;
}


const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ 
  notifications, 
  userType = 'parent', 
  userEmail 
}) => {
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<null | HTMLElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { getUserSpecificNotifications, dismissNotification, clearExpiredDismissals } = useNotifications();

  // Debug: Log props and user info
  console.log('NotificationsPopup - Props:', { notifications, userType, userEmail });
  console.log('NotificationsPopup - ForceUpdate:', forceUpdate);

  // Clear expired dismissals when notifications change
  useEffect(() => {
    clearExpiredDismissals(notifications, userType, userEmail);
  }, [notifications, userType, userEmail, clearExpiredDismissals]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setShow(!show);
    setTarget(event.target as HTMLElement);
  };

  const handleDismiss = (id: number) => {
    dismissNotification(id, userType, userEmail);
    // Force component to re-render by updating state
    setForceUpdate(prev => prev + 1);
  };

  // Get filtered notifications for the current user
  const filteredNotifications = React.useMemo(() => {
    return getUserSpecificNotifications(notifications, userType, userEmail);
  }, [notifications, userType, userEmail, getUserSpecificNotifications, forceUpdate]);

  return (
    <>
      <Button variant="link" style={{ fontSize: 22, position: 'relative' }} onClick={handleClick}>
        <i className="bi bi-bell" style={{ color: '#43cea2' }}></i>
        {filteredNotifications.length > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, background: '#fb7100', color: '#fff', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{filteredNotifications.length}</span>
        )}
      </Button>
      <Overlay show={show} target={target} placement="bottom" containerPadding={20} rootClose onHide={() => setShow(false)}>
        <Popover id="notifications-popover" style={{ minWidth: 320 }}>
          <Popover.Header as="h3">Recent Notifications</Popover.Header>
          <Popover.Body>
            {filteredNotifications.length === 0 ? (
              <div className="text-muted">No notifications</div>
            ) : (
              <ListGroup variant="flush">
                {filteredNotifications.map((notif) => (
                  <ListGroup.Item key={notif.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{notif.message}</strong>
                      <div className="text-muted" style={{ fontSize: "0.9em" }}>{notif.date}</div>
                      <div style={{ fontSize: "0.95em", margin: "0.25em 0" }}>{notif.description}</div>
                      <div style={{ fontSize: "0.92em", color: '#555', marginBottom: 2 }}>{notif.extra}</div>
                      <div style={{ fontSize: "0.95em" }}>
                        <span className="fw-bold">Time:</span> {notif.start} - {notif.end}
                      </div>
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleDismiss(notif.id)} title="Mark as read" style={{ marginLeft: 8 }}>
                      <i className="bi bi-check2" />
                    </Button>
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
