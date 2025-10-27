import React, { useState, useEffect } from 'react';
import { classroomAPI } from '../api/api';

function Classrooms({ user }) {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const response = await classroomAPI.list();
      setClassrooms(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await classroomAPI.create(newClassName);
      setSuccess('Classroom created successfully!');
      setNewClassName('');
      loadClassrooms();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create classroom');
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await classroomAPI.join(enrollmentCode);
      setSuccess('Successfully joined classroom!');
      setEnrollmentCode('');
      loadClassrooms();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join classroom');
    }
  };

  const handleViewStudents = async (classroom) => {
    setSelectedClassroom(classroom);
    try {
      const response = await classroomAPI.getStudents(classroom.id);
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
    }
  };

  if (loading) {
    return <div className="loading">Loading classrooms...</div>;
  }

  return (
    <div>
      <h1 className="card-header">Classroom Management</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card-grid">
        {user.role === 'teacher' && (
          <div className="card">
            <h2 className="card-header">Create New Classroom</h2>
            <form onSubmit={handleCreateClassroom}>
              <div className="form-group">
                <label>Classroom Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Classroom
              </button>
            </form>
          </div>
        )}

        {user.role === 'student' && (
          <div className="card">
            <h2 className="card-header">Join Classroom</h2>
            <form onSubmit={handleJoinClassroom}>
              <div className="form-group">
                <label>Enrollment Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                  required
                  maxLength="8"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Join Classroom
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="card-header">My Classrooms</h2>
          {classrooms.length === 0 ? (
            <p>No classrooms yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  {user.role === 'teacher' && <th>Enrollment Code</th>}
                  <th>Teacher</th>
                  {user.role === 'teacher' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {classrooms.map((classroom) => (
                  <tr key={classroom.id}>
                    <td>{classroom.name}</td>
                    {user.role === 'teacher' && (
                      <td>
                        <span className="badge badge-primary">{classroom.enrollment_code}</span>
                      </td>
                    )}
                    <td>{classroom.teacher_email}</td>
                    {user.role === 'teacher' && (
                      <td>
                        <button
                          onClick={() => handleViewStudents(classroom)}
                          className="btn btn-secondary"
                        >
                          View Students
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedClassroom && (
        <div className="card mt-3">
          <h2 className="card-header">
            Students in {selectedClassroom.name}
          </h2>
          {students.length === 0 ? (
            <p>No students enrolled yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_email}</td>
                    <td>{new Date(student.enrolled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            onClick={() => setSelectedClassroom(null)}
            className="btn btn-secondary mt-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Classrooms;
