import React from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';

const AccountsView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          {/* Accounts & Fees Header */}
          <Card className="mb-4 admin-dashboard-section">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2><i className="bi bi-wallet2 me-2"></i>Accounts & Fees</h2>
                <Form.Select style={{ maxWidth: 180 }} defaultValue="2025 Term 3">
                  <option>2025 Term 1</option>
                  <option>2025 Term 2</option>
                  <option>2025 Term 3</option>
                </Form.Select>
              </div>
              <Row className="mb-4">
                {/* Fee Summary Cards */}
                {(() => {
                  // Demo fee data
                  const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                  const students = users.filter((u: any) => u.type === 'student');
                  const feeData = students.map((s: any): {
                    name: string;
                    class: string;
                    parent: string;
                    totalFee: number;
                    paid: number;
                    dueDate: string;
                  } => ({
                    name: s.name,
                    class: s.class || '',
                    parent: users.find((u: any) => u.childId === s.id)?.name || '',
                    totalFee: 30000,
                    paid: Math.floor(Math.random() * 30000),
                    dueDate: '2025-09-30',
                  }));
                  const totalFeeYear = feeData.reduce((sum: number, s: { totalFee: number }) => sum + s.totalFee, 0);
                  const totalPaid = feeData.reduce((sum: number, s: { paid: number }) => sum + s.paid, 0);
                  const currentTermBalance = feeData.reduce((sum: number, s: { totalFee: number; paid: number }) => sum + (s.totalFee - s.paid), 0);
                  const studentsWithBalance = feeData.filter((s: { totalFee: number; paid: number }) => s.totalFee - s.paid > 0);
                  return (
                    <>
                      <Col md={3}>
                        <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                          <Card.Body>
                            <div className="stat-label" style={{ color: '#6c63ff' }}>Total Fees (Year)</div>
                            <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {totalFeeYear.toLocaleString()}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                          <Card.Body>
                            <div className="stat-label" style={{ color: '#fb7100' }}>Amount Paid</div>
                            <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {totalPaid.toLocaleString()}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                          <Card.Body>
                            <div className="stat-label" style={{ color: '#fd7e14' }}>Current Term Balance</div>
                            <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {currentTermBalance.toLocaleString()}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                          <Card.Body>
                            <div className="stat-label" style={{ color: '#6c63ff' }}>Students w/ Balance</div>
                            <div className="stat-value" style={{ color: '#dc3545' }}>{studentsWithBalance.length}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </>
                  );
                })()}
              </Row>
              {/* Fee Updates Table */}
              <Card className="mb-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                <Card.Header style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #fb7100 100%)', color: 'white', fontWeight: 600 }}><h5>Fee Updates</h5></Card.Header>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-striped">
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Parent</th>
                        <th>Total Fee</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                        const students = users.filter((u: any) => u.type === 'student');
                        return students.map((s: any) => {
                          const parent = users.find((u: any) => u.childId === s.id);
                          const totalFee = 30000;
                          const paid = Math.floor(Math.random() * 30000);
                          const balance = totalFee - paid;
                          const dueDate = '2025-09-30';
                          return (
                            <tr key={s.id} style={{ background: balance === 0 ? '#e0ffe0' : '#fff0f0' }}>
                              <td>{s.name}</td>
                              <td>{s.class || '-'}</td>
                              <td>{parent ? parent.name : '-'}</td>
                              <td>KES {totalFee.toLocaleString()}</td>
                              <td>KES {paid.toLocaleString()}</td>
                              <td>KES {balance.toLocaleString()}</td>
                              <td>{dueDate}</td>
                              <td>{balance === 0 ? <span style={{ color: '#198754', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#dc3545', fontWeight: 600 }}>Unpaid</span>}</td>
                              <td><Button size="sm" variant="info">Push Update</Button></td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </Card>
              {/* Overdue Students & Bulk Actions */}
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header><h5>Overdue Students</h5></Card.Header>
                    <ListGroup>
                      {(() => {
                        const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                        const students = users.filter((u: any) => u.type === 'student');
                        return students.filter(() => {
                          const paid = Math.floor(Math.random() * 30000);
                          return 30000 - paid > 0;
                        }).map((s: any) => (
                          <ListGroup.Item key={s.id}>{s.name} ({s.class || '-'}) - Balance: KES {(30000 - Math.floor(Math.random() * 30000)).toLocaleString()}</ListGroup.Item>
                        ));
                      })()}
                    </ListGroup>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header><h5>Bulk Actions</h5></Card.Header>
                    <div className="d-flex flex-column gap-2 p-2">
                      <Button variant="warning">Send Fee Reminders to All</Button>
                      <Button variant="secondary">Export Fee Data (CSV/PDF)</Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountsView;
