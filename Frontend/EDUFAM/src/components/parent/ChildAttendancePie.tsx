import React from 'react';
import { useAttendance } from '../../context/AttendanceContextHook';
import AttendancePieChart from '../AttendancePieChart';

interface ChildAttendancePieProps {
  studentId: string;
}

const ChildAttendancePie: React.FC<ChildAttendancePieProps> = ({ studentId }) => {
  const { attendance } = useAttendance();
  const childAttendance = attendance.filter(a => a.studentId === studentId);
  const latest = childAttendance.length > 0 ? childAttendance[childAttendance.length - 1] : null;
  const percent = latest ? latest.attendancePercent : 0;
  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <h6>Attendance</h6>
      <AttendancePieChart percent={percent} />
      <div className="percentage">
        <h3>{percent}%</h3>
      </div>
    </div>
  );
};

export default ChildAttendancePie;
