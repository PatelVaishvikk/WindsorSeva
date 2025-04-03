// components/DarkModeToggle.js
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // On mount, check local storage for the saved theme
  useEffect(() => {
    const storedPreference = localStorage.getItem('darkMode');
    if (storedPreference) {
      const isDark = storedPreference === 'true';
      setDarkMode(isDark);
      document.body.classList.toggle('dark-mode', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="dark-mode-toggle btn btn-icon btn-sm"
      title="Toggle Dark Mode"
    >
      {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
    </button>
  );
}
