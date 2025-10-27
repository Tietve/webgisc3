import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI } from '../api/api';

function QuizTaker({ user }) {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await quizAPI.get(id);
      setQuiz(response.data);
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      const response = await quizAPI.submit(id, answers);
      setScore(response.data.score);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error && !quiz) {
    return <div className="error">{error}</div>;
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="error">Quiz not found or has no questions</div>;
  }

  if (submitted) {
    return (
      <div className="card">
        <h1 className="card-header">Quiz Submitted!</h1>
        <div className="text-center">
          <div className="stat-card" style={{ margin: '2rem auto', maxWidth: '300px' }}>
            <div className="stat-number">{score}%</div>
            <div className="stat-label">Your Score</div>
          </div>
          <p>
            You scored {score}% on {quiz.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="card-header">{quiz.title}</h1>
      <p>{quiz.description}</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="quiz-question">
            <h3>
              Question {index + 1}: {question.question_text}
            </h3>
            <div className="quiz-answers">
              {question.answers.map((answer) => (
                <label
                  key={answer.id}
                  className={`quiz-answer ${
                    answers[question.id] === answer.id ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={answer.id}
                    checked={answers[question.id] === answer.id}
                    onChange={() => handleAnswerChange(question.id, answer.id)}
                  />
                  {answer.answer_text}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-success mt-3">
          Submit Quiz
        </button>
      </form>
    </div>
  );
}

export default QuizTaker;
