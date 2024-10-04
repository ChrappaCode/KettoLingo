import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function LearningPage() {
  const { nativeLanguageId, foreignLanguageId, categoryId } = useParams();  // Get language and category IDs from URL
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    fetch(`http://127.0.0.1:5000/api/learn/${nativeLanguageId}/${foreignLanguageId}/${categoryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        setWords([]);
      } else {
        setWords(data);
      }
    })
    .catch(error => {
      console.error('Error fetching words:', error);
    });
  }, [nativeLanguageId, foreignLanguageId, categoryId]);

  const handleFlip = () => {
    setShowTranslation(!showTranslation);
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowTranslation(false);  // Reset translation for next word
    }
  };

  const handlePrev = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowTranslation(false);  // Reset translation for previous word
    }
  };

  if (words.length === 0) {
    return <p>Loading words...</p>;
  }

  const currentWord = words[currentWordIndex];

  return (
    <div>
      <h2>Learning Mode</h2>

      <div>
        <h3>Word {currentWordIndex + 1} of {words.length}</h3>
        <div className="flashcard" onClick={handleFlip} style={{ cursor: 'pointer', padding: '20px', border: '1px solid black' }}>
          {!showTranslation ? (
            <p>{currentWord.native_word}</p>  // Show native word first
          ) : (
            <p>{currentWord.foreign_word}</p>  // Show foreign word on flip
          )}
        </div>
        <p>Click to {showTranslation ? 'hide' : 'show'} translation</p>
      </div>

      <div>
        <button onClick={handlePrev} disabled={currentWordIndex === 0}>Previous</button>
        <button onClick={handleNext} disabled={currentWordIndex === words.length - 1}>Next</button>
      </div>

      <button onClick={() => navigate('/overview')}>Exit</button>
    </div>
  );
}

export default LearningPage;
