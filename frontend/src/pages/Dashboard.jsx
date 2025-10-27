import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classroomAPI, lessonAPI, quizAPI } from '../api/api';

function Dashboard({ user }) {
  const [classrooms, setClassrooms] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classroomsRes, lessonsRes, quizzesRes] = await Promise.all([
        classroomAPI.list(),
        lessonAPI.list(),
        quizAPI.list(),
      ]);
      setClassrooms(classroomsRes.data.results || classroomsRes.data);
      setLessons(lessonsRes.data.results || lessonsRes.data);
      setQuizzes(quizzesRes.data.results || quizzesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="card-header">
        Welcome, {user.email} ({user.role})
      </h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{classrooms.length}</div>
          <div className="stat-label">Classrooms</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{lessons.length}</div>
          <div className="stat-label">Lessons Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{quizzes.length}</div>
          <div className="stat-label">Quizzes</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h2 className="card-header">My Classrooms</h2>
          {classrooms.length === 0 ? (
            <p>No classrooms yet. {user.role === 'teacher' ? 'Create one!' : 'Join one!'}</p>
          ) : (
            <ul>
              {classrooms.map((classroom) => (
                <li key={classroom.id} className="mb-1">
                  <strong>{classroom.name}</strong>
                  {user.role === 'teacher' && (
                    <span className="badge badge-primary ml-2">
                      Code: {classroom.enrollment_code}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link to="/classrooms" className="btn btn-primary mt-2">
            Manage Classrooms
          </Link>
        </div>

        <div className="card">
          <h2 className="card-header">Available Lessons</h2>
          {lessons.length === 0 ? (
            <p>No lessons available yet.</p>
          ) : (
            <ul>
              {lessons.slice(0, 5).map((lesson) => (
                <li key={lesson.id} className="mb-1">
                  <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0.25rem 0' }}>
                    {lesson.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="card-header">Available Quizzes</h2>
          {quizzes.length === 0 ? (
            <p>No quizzes available yet.</p>
          ) : (
            <ul>
              {quizzes.slice(0, 5).map((quiz) => (
                <li key={quiz.id} className="mb-1">
                  <Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0.25rem 0' }}>
                    {quiz.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mt-3">
        <h2 className="card-header">Quick Links</h2>
        <div className="flex gap-2">
          <Link to="/map" className="btn btn-primary">
            Explore Map
          </Link>
          <Link to="/tools" className="btn btn-primary">
            GIS Tools
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
