import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import AttendancePieChart from '../AttendancePieChart';
import { useAttendance } from '../../context/AttendanceContextHook';
import { useResults } from '../../context/ResultsContextHook';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const formatKES = (amount: number) => `KES ${amount.toLocaleString()}`;

interface ChildData {
  studentName: string;
  studentId: string;
  studentClass: string;
  term: string;
  fileName?: string;
  fileDataUrl?: string;
  attendance: number;
}
interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
}
interface ParentMainDashboardProps {
  childData: ChildData;
  events: Event[];
}

const ParentMainDashboard: React.FC<ParentMainDashboardProps> = ({ childData, events }) => {
  const { attendance } = useAttendance();
  const { results } = useResults();
  // Find latest attendance for this child by studentId
  const childAttendance = attendance.filter(a => a.studentId === childData.studentId);
  const latestAttendance = childAttendance.length > 0 ? childAttendance[childAttendance.length - 1] : null;
  const percent = latestAttendance ? latestAttendance.attendancePercent : 0;
  // Find latest result for this child by studentId
  const childResults = results.filter(r => r.studentId === childData.studentId && r.fileName && r.fileDataUrl);
  const latestResult = childResults.length > 0 ? childResults[childResults.length - 1] : null;

  // Modal state for Pay Now
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Fee info (should be passed as prop or fetched, but for now, hardcoded for demo)
  // In real use, get from childData or localStorage
  interface Fee {
    totalFee: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: string;
    paymentDate?: string;
  }
  interface User {
    studentId: string;
    fee: Fee;
    // Add other known fields as needed
  }
  // State to force re-render after payment
  const [feeRefresh, setFeeRefresh] = useState(0);
  const { fee, dueAmount } = React.useMemo(() => {
    const users: User[] = JSON.parse(localStorage.getItem('edufam_users') || '[]');
    const student = users.find((u) => u.studentId === childData.studentId && u.fee);
    const fee = student?.fee || { totalFee: 30000, paidAmount: 0, balance: 30000, dueDate: '2025-09-30', status: 'pending' };
    const dueAmount = fee.balance || (fee.totalFee - fee.paidAmount);
    return { fee, dueAmount };
  }, [childData.studentId]);

  const handlePayNowClick = () => {
    setPayAmount(dueAmount.toString());
    setPayError('');
    setShowPayModal(true);
  };

  const handlePayModalClose = () => {
    setShowPayModal(false);
    setPayError('');
    setPaySuccess(false);
  };

  // Payment handler
  const handlePay = () => {
    const amount = parseFloat(payAmount);
    console.log('Pay button clicked. Amount:', amount, 'StudentId:', childData.studentId);
    if (isNaN(amount) || amount <= 0) {
      setPayError('Enter a valid amount.');
      console.log('Invalid amount');
      return;
    }
    if (amount > fee.balance) {
      setPayError('Amount exceeds due balance.');
      console.log('Amount exceeds due balance. Fee:', fee);
      return;
    }
    // Update localStorage
    const usersRaw = localStorage.getItem('edufam_users') || '[]';
    const usersArr: User[] = JSON.parse(usersRaw);
    const idx = usersArr.findIndex(u => u.studentId === childData.studentId);
    if (idx !== -1 && !usersArr[idx].fee) {
      usersArr[idx].fee = { totalFee: 30000, paidAmount: 0, balance: 30000, dueDate: '2025-09-30', status: 'pending' };
    }
    console.log('User index in localStorage:', idx, 'Users:', usersArr);
    if (idx === -1) {
      setPayError('Student not found.');
      console.log('Student not found in localStorage');
      return;
    }
    const oldFee = usersArr[idx].fee;
    const newPaid = (oldFee.paidAmount || 0) + amount;
    const newBalance = Math.max((oldFee.totalFee || 0) - newPaid, 0);
    usersArr[idx].fee = {
      ...oldFee,
      paidAmount: newPaid,
      balance: newBalance,
      status: newBalance === 0 ? 'paid' : 'partial',
      paymentDate: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem('edufam_users', JSON.stringify(usersArr));
    console.log('Updated user fee:', usersArr[idx].fee);
    setPaySuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      setPaySuccess(false);
      setPayAmount('');
      setFeeRefresh(feeRefresh + 1); // trigger re-render to re-read fee
      console.log('Modal closed, feeRefresh incremented');
    }, 1200);
    // Optionally, trigger a mock SMS/notification here
    // alert('Payment successful! Admin notified.');
  };

  return (
    <div>
      {/* Child Profile Section */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Child Profile</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6>Overall Performance</h6>
              <div style={{ color: '#6c63ff', fontWeight: 500, marginBottom: 8 }}>
                {latestResult && latestResult.term ? `Term: ${latestResult.term.replace(/-/g, ' ').replace(/term(\d)/, 'Term $1').replace('midterm', 'Midterm').replace('endterm', 'End Term')}` : 'No results uploaded yet.'}
              </div>
              {latestResult && latestResult.fileName && latestResult.fileDataUrl && (
                <a href={latestResult.fileDataUrl} download={latestResult.fileName}>
                  <Button
                    variant="primary"
                    style={{
                      background: 'linear-gradient(90deg, #1e0a3c 0%, #6c63ff 100%)',
                      border: 'none',
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: '1.08rem',
                      letterSpacing: 0.5,
                      padding: '0.6rem 1.4rem',
                      boxShadow: '0 2px 8px rgba(30,10,60,0.10)',
                      color: '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    Download Result
                  </Button>
                </a>
              )}
            </Col>
            <Col md={4} className="text-center">
              <div className="attendance-circle">
                <h6>Attendance</h6>
                <AttendancePieChart percent={percent} />
                <div className="percentage">
                  <h3>{percent}%</h3>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="d-flex flex-column gap-2 mt-3">
                <Button className="modern-action-btn" style={{ width: '100%' }}>
                  <i className="bi bi-chat-dots me-2"></i> Chat with Teacher
                </Button>
                <Button className="modern-action-btn" style={{ width: '100%' }}>
                  <i className="bi bi-people me-2"></i> Group Chat
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* Fees Section */}
      <Card className="mb-4 fee-status-card">
        <Card.Header>
          <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Fee Status</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6>Total Fee</h6>
              <h4>{formatKES(fee.totalFee)}</h4>
            </Col>
            <Col md={4}>
              <h6>Paid Amount</h6>
              <h4 className="text-success">{formatKES(fee.paidAmount)}</h4>
            </Col>
            <Col md={4}>
              <h6>Due Amount</h6>
              <h4 className="text-danger">{formatKES(fee.balance)}</h4>
            </Col>
          </Row>
          <div className="mt-3">
            <p>Next payment due: {fee.dueDate}</p>
            <Button
              variant="primary"
              className="modern-action-btn"
              style={{ width: '100%' }}
              onClick={handlePayNowClick}
              disabled={fee.balance === 0}
            >
              {fee.balance === 0 ? 'Paid' : 'Pay Now'}
            </Button>
          </div>
        </Card.Body>
      </Card>
      {/* Pay Now Modal */}
      <Modal show={showPayModal} onHide={handlePayModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Fees for {childData.studentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paySuccess ? (
            <div className="text-success text-center" style={{ fontWeight: 600, fontSize: '1.2rem' }}>
              Paid successfully!
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Amount to Pay</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={dueAmount}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  disabled={fee.balance === 0}
                />
                <Form.Text muted>
                  Maximum: {formatKES(dueAmount)}
                </Form.Text>
                {payError && <div className="text-danger mt-2">{payError}</div>}
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePayModalClose}>Close</Button>
          {!paySuccess && (
            <Button
              variant="primary"
              onClick={handlePay}
              disabled={fee.balance === 0}
            >
              Pay
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      {/* Events Calendar section */}
      <Card className="mb-4" style={{ background: '#cf84c7', border: 'none', boxShadow: '0px 1px 4px rgba(30,10,60,0.1)' }}>
        <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Events Calendar</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 500, background: "#fff", borderRadius: "8px", padding: "16px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ParentMainDashboard;
