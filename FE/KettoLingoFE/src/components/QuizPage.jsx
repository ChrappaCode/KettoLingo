import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
  const { nativeLanguageId, foreignLanguageId, categoryId } = useParams();
  console.log("Params:", { nativeLanguageId, foreignLanguageId, categoryId });

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:5000/api/quiz/${nativeLanguageId}/${foreignLanguageId}/${categoryId}`, {
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
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
    setSelectedOption(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

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
      </div>
    );
  }

  const generateOptions = () => {
    const options = new Set([currentQuestion.correct_answer]);
    while (options.size < 4) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const randomAnswer = questions[randomIndex].correct_answer;
      options.add(randomAnswer);
    }
    return Array.from(options).sort(() => Math.random() - 0.5); // Shuffle options
  };

  const options = generateOptions();

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
