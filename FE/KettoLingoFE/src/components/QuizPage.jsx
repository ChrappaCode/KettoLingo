import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
  const { nativeLanguageId, foreignLanguageId, categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]); // Stores answers with actual word_id

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:5000/api/quiz/${foreignLanguageId}/${categoryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch quiz questions');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuestions(data);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quiz questions:', error);
        setError('An error occurred while fetching questions');
        setIsLoading(false);
      });
  }, [nativeLanguageId, foreignLanguageId, categoryId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === currentQuestion.correct_answer;

    // Ensure that word_id is included in answers array
    setAnswers(prevAnswers => [
      ...prevAnswers,
      { word_id: currentQuestion.word_id, is_correct: isCorrect }
    ]);

    // Update score if the answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }

    setSelectedOption(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizComplete(true); // Mark quiz as complete
    }
  };

  const submitQuizResults = () => {
    const token = localStorage.getItem('jwtToken');
    const percentageScore = (score / questions.length) * 100;

    const payload = {
      language_id: foreignLanguageId,
      category_id: categoryId,
      score: percentageScore,
      result_details: answers, // Using answers array with word_id and is_correct
    };

    fetch('http://localhost:5000/api/quiz_result', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save quiz results');
        }
        return response.json();
      })
      .then(data => {
        console.log('Quiz results saved:', data);
      })
      .catch(error => {
        console.error('Error saving quiz results:', error);
      });
  };

  useEffect(() => {
    if (isQuizComplete) {
      submitQuizResults();
    }
  }, [isQuizComplete]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];

    const uniqueOptions = new Set([currentQuestion.correct_answer]);
    while (uniqueOptions.size < 4) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const randomAnswer = questions[randomIndex].correct_answer;
      uniqueOptions.add(randomAnswer);
    }

    return Array.from(uniqueOptions).sort(() => Math.random() - 0.5); // Shuffle options
  }, [currentQuestion, questions]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (isQuizComplete) {
    return (
      <div>
        <h2>Quiz Complete!</h2>
        <p>Your Score: {score} / {questions.length}</p>
        <p>Percentage Score: {(score / questions.length) * 100}%</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Quiz Page</h2>
      <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
      <p><strong>{currentQuestion.question}</strong></p>
      <div>
        {options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`option-${index}`}
              name="option"
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionSelect(option)}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ))}
      </div>
      <button onClick={handleNextQuestion} disabled={!selectedOption}>
        {currentQuestionIndex + 1 < questions.length ? "Next Question" : "Finish Quiz"}
      </button>
    </div>
  );
}

export default QuizPage;
