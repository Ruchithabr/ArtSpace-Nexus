import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <button className="theme-toggle" onClick={toggleTheme}>
            <div className={`toggle-track ${theme}`}>
                <span className="toggle-icon">
                    {theme === 'light' ? '☀️' : '🌙'}
                </span>
                <span className="toggle-thumb"></span>
            </div>
        </button>
    );
};

export default ThemeToggle;