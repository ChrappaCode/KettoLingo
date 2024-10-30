import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
  const { nativeLanguageId, foreignLanguageId, categoryId } = useParams();
  console.log("Params:", { nativeLanguageId, foreignLanguageId, categoryId });
  const [questions, setQuestions] = useState([]); // Initialize as an empty array
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
          setError(data.error); // Handle error returned from backend
        } else {
          setQuestions(data); // Assume data is the array of questions
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quiz questions:', error);
        setError('An error occurred while fetching questions');
        setIsLoading(false);
      });
  }, [nativeLanguageId, foreignLanguageId, categoryId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Quiz Page</h2>
      {questions.length > 0 ? (
        questions.map((question, index) => (
          <div key={index}>
            <p>Question: {question.question}</p>
            <p>Answer: {question.correct_answer}</p>
            {/* Add quiz interaction elements here */}
          </div>
        ))
      ) : (
        <p>No questions available for this quiz.</p>
      )}
    </div>
  );
}

export default QuizPage;
