import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, HelpCircle, CheckCircle2, XCircle, Play, 
  RefreshCw, ChevronRight, Zap, Check, X, ShieldAlert 
} from 'lucide-react';
import api from '../../services/api';

// Mascot imports for the result screens
import shieldLowImg from '../../assets/shield_low.png';
import shieldMidImg from '../../assets/shield_mid.png';
import shieldHighImg from '../../assets/shield_high.png';

const EmployeeQuizzes = () => {
  const { currentUser, quizzes, setCurrentUser, addAuditLog } = useAppContext();
  
  // Game states: 'LIST', 'PLAYING', 'RESULT'
  const [viewState, setViewState] = useState('LIST');
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Quiz taking state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionIdx -> selectedOptionIndex
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if user has already passed this quiz
  const hasPassedQuiz = (quizName) => {
    if (!currentUser?.quiz_results) return false;
    return currentUser.quiz_results.some(
      r => (r.module_title === quizName || r.quiz_name === quizName) && (r.passed || r.score >= 80)
    );
  };

  // Get highest attempt score
  const getQuizHighestScore = (quizName) => {
    if (!currentUser?.quiz_results) return null;
    const attempts = currentUser.quiz_results.filter(
      r => r.module_title === quizName || r.quiz_name === quizName
    );
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizScore(null);
    setQuizPassed(false);
    setError('');
    setViewState('PLAYING');
  };

  const handleSelectOption = (optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIdx
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError('');
    try {
      const questions = activeQuiz.questions;
      let correctCount = 0;
      
      // Calculate score based on correct options
      questions.forEach((q, idx) => {
        const userAns = selectedAnswers[idx];
        const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
        if (userAns === correctIdx) {
          correctCount++;
        }
      });

      const scorePct = Math.round((correctCount / questions.length) * 100);
      const passed = scorePct >= (activeQuiz.passingScore || activeQuiz.passing_score || 80);
      
      setQuizScore(scorePct);
      setQuizPassed(passed);

      // Submit attempt
      const isDatabaseQuiz = typeof activeQuiz.id === 'string' && activeQuiz.id.includes('-');

      if (isDatabaseQuiz) {
        // Send to backend endpoint
        const answersList = questions.map((_, idx) => selectedAnswers[idx] || 0);
        await api.post(`/quizzes/${activeQuiz.id}/attempt`, {
          employee_id: currentUser.employee_id || currentUser.id,
          answers: answersList
        });
      } else {
        // Handle mock/dummy quiz logic locally
        const newResult = {
          id: `quiz-attempt-${Date.now()}`,
          quiz_name: activeQuiz.quizName,
          module_title: activeQuiz.quizName,
          score: scorePct,
          passed: passed,
          date: new Date().toISOString().split('T')[0]
        };

        // Award XP and points locally
        setCurrentUser(prev => {
          const currentResults = prev.quiz_results || [];
          const alreadyPassed = currentResults.some(r => r.module_title === activeQuiz.quizName && r.passed);
          
          let xpReward = 0;
          let scoreReward = 0;
          
          if (passed && !alreadyPassed) {
            xpReward = 100;
            scoreReward = 5;
          }

          return {
            ...prev,
            rewards_balance: (prev.rewards_balance || 0) + xpReward,
            securityScore: Math.min((prev.securityScore || 80) + scoreReward, 100),
            quiz_results: [newResult, ...currentResults]
          };
        });

        addAuditLog("Quiz Attempt", `Completed evaluation '${activeQuiz.quizName}' with score ${scorePct}%`);
      }

      setViewState('RESULT');
    } catch (err) {
      console.error("Failed to submit quiz attempt:", err);
      setError("Failed to record quiz results. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
          Educational Quizzes
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
          Assess your cybersecurity expertise, unlock achievements, and earn security standing points.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* State 1: QUIZ SELECTION LIST */}
        {viewState === 'LIST' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}
          >
            {quizzes.map((quiz) => {
              const passed = hasPassedQuiz(quiz.quizName);
              const highestScore = getQuizHighestScore(quiz.quizName);
              const qCount = quiz.questionsCount || quiz.questions?.length || 0;
              const passing = quiz.passingScore || quiz.passing_score || 80;

              return (
                <motion.div
                  key={quiz.id}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                  style={{
                    background: '#fff',
                    border: passed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    boxShadow: passed ? '0 8px 20px rgba(16,185,129,0.04)' : 'none'
                  }}
                >
                  {/* Banner Line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                    borderRadius: '20px 20px 0 0',
                    background: passed ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #4f46e5)'
                  }} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '6px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: passed ? '#ecfdf5' : '#eef2ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Award size={20} color={passed ? '#10b981' : '#6366f1'} />
                      </div>

                      {passed ? (
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: '#10b981',
                          background: '#ecfdf5', padding: '3px 10px', borderRadius: '99px',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          Passed
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: '#64748b',
                          background: '#f1f5f9', padding: '3px 10px', borderRadius: '99px',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          Available
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                      {quiz.quizName}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '24px' }}>
                      <span>{qCount} Questions</span>
                      <span>•</span>
                      <span>Passing Score: {passing}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                      {highestScore !== null ? `Highest Score: ${highestScore}%` : 'No attempts recorded'}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStartQuiz(quiz)}
                      style={{
                        background: passed ? '#fff' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                        color: passed ? '#2563eb' : '#fff',
                        border: passed ? '1px solid #2563eb' : 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {passed ? <RefreshCw size={12} /> : <Play size={12} fill="#fff" />}
                      {passed ? 'Retake Quiz' : 'Start Quiz'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* State 2: QUIZ INTERACTIVE PLAYER */}
        {viewState === 'PLAYING' && activeQuiz && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '36px',
              position: 'relative',
              maxWidth: '680px',
              margin: '0 auto',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)'
            }}
          >
            {/* Header progress info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
              </span>
              <button 
                onClick={() => setViewState('LIST')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quiz Progress Bar */}
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '28px' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
                width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Question Text */}
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4, marginBottom: '24px' }}>
              {activeQuiz.questions[currentQuestionIdx].questionText || activeQuiz.questions[currentQuestionIdx].question_text}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#fff',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                      boxSizing: 'border-box',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#1e40af' : '#334155' }}>
                      {option}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {error && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={handlePrevQuestion}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentQuestionIdx === 0 ? 0.4 : 1
                }}
              >
                Previous
              </button>

              {currentQuestionIdx + 1 < activeQuiz.questions.length ? (
                <button
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  onClick={handleNextQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: selectedAnswers[currentQuestionIdx] === undefined ? 'not-allowed' : 'pointer',
                    opacity: selectedAnswers[currentQuestionIdx] === undefined ? 0.5 : 1
                  }}
                >
                  Next Question
                </button>
              ) : (
                <button
                  disabled={selectedAnswers[currentQuestionIdx] === undefined || submitting}
                  onClick={handleSubmitQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 28px',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: selectedAnswers[currentQuestionIdx] === undefined || submitting ? 'not-allowed' : 'pointer',
                    opacity: selectedAnswers[currentQuestionIdx] === undefined || submitting ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Finish & Submit'}
                  {!submitting && <ChevronRight size={14} />}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* State 3: QUIZ ATTEMPT RESULTS SCREEN */}
        {viewState === 'RESULT' && activeQuiz && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '680px',
              margin: '0 auto',
              boxShadow: '0 20px 45px -15px rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Header border status color */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              borderRadius: '24px 24px 0 0',
              background: quizPassed ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
            }} />

            {/* Split layout: text + mascot */}
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap-reverse' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  {quizPassed ? (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', background: '#ecfdf5', padding: '3px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      SUCCESS
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', background: '#fef2f2', padding: '3px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      FAILED
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
                  {quizPassed ? 'Congratulations! 🎉' : 'Keep Learning! 💪'}
                </h2>
                
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginTop: '8px', fontWeight: '500' }}>
                  {quizPassed 
                    ? `You passed the '${activeQuiz.quizName}' evaluation, demonstrating excellent security awareness.`
                    : `You didn't reach the required ${activeQuiz.passingScore || activeQuiz.passing_score || 80}% passing score this time. Review the questions below and try again!`
                  }
                </p>

                {quizPassed && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '6px 12px', marginTop: '12px' }}>
                    <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#78350f' }}>+100 XP & +5 Standing Points Awarded</span>
                  </div>
                )}
              </div>

              {/* Character mascot showing outcome */}
              <div style={{
                width: '125px', height: '145px',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                margin: '0 auto', flexShrink: 0
              }}>
                <img
                  src={quizPassed ? (quizScore === 100 ? shieldHighImg : shieldMidImg) : shieldLowImg}
                  alt="Mascot status"
                  style={{
                    maxHeight: '100%', maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))'
                  }}
                />
              </div>
            </div>

            {/* Score Ring Display */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Score</span>
                <div style={{ fontSize: '32px', fontWeight: '950', color: quizPassed ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                  {quizScore}%
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required Score</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#475569', marginTop: '4px' }}>
                  {activeQuiz.passingScore || activeQuiz.passing_score || 80}% Passing
                </div>
              </div>
            </div>

            {/* Questions Review Table */}
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Evaluation Review
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', maxHeight: '240px', overflowY: 'auto', paddingRight: '8px' }}>
              {activeQuiz.questions.map((q, idx) => {
                const userAnsIdx = selectedAnswers[idx];
                const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
                const isCorrect = userAnsIdx === correctIdx;

                return (
                  <div 
                    key={idx} 
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      background: isCorrect ? 'rgba(16,185,129,0.01)' : 'rgba(239,68,68,0.01)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {isCorrect ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#ef4444" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '750', color: '#334155', margin: 0, lineHeight: 1.3 }}>
                        {q.questionText || q.question_text}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', margin: 0, fontWeight: '500' }}>
                        Your answer: <span style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: '700' }}>{q.options[userAnsIdx] || 'None'}</span>
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: '12px', color: '#10b981', marginTop: '3px', margin: 0, fontWeight: '700' }}>
                          Correct answer: {q.options[correctIdx]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {!quizPassed && (
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={12} />
                  Retry Evaluation
                </button>
              )}
              
              <button
                onClick={() => setViewState('LIST')}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Back to Quizzes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeeQuizzes;
