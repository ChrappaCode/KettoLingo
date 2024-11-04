import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from "./learning.module.css"; // Ensure this file contains the relevant styles

function LearningPage() {
  const { nativeLanguageId, foreignLanguageId, categoryId } = useParams(); // Get language and category IDs from URL
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    fetch(`http://localhost:5000/api/learn/${foreignLanguageId}/${categoryId}`, {
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
      setShowTranslation(false); // Reset translation for next word
    }
  };

  const handlePrev = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowTranslation(false); // Reset translation for previous word
    }
  };

  if (words.length === 0) {
    return <p>Loading words...</p>;
  }

  const currentWord = words[currentWordIndex];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Learning Mode</h2>
      <div className={styles.flashcardContainer}>
        <div className={`${styles.flashcard} ${showTranslation ? styles.flipped : ''}`} onClick={handleFlip}>
          <div className={styles.front}>
            <p>{currentWord.native_word}</p> {/* Show native word first */}
          </div>
          <div className={styles.back}>
            <p>{currentWord.foreign_word}</p> {/* Show foreign word on flip */}
          </div>
        </div>
        <p className={styles.instructions}>Click to {showTranslation ? 'hide' : 'show'} translation</p>
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handlePrev} disabled={currentWordIndex === 0}>Previous</button>
        <button className={styles.button} onClick={handleNext} disabled={currentWordIndex === words.length - 1}>Next</button>
      </div>

      <button className={styles.exitButton} onClick={() => navigate('/overview')}>Exit</button>
    </div>
  );
}

export default LearningPage;
