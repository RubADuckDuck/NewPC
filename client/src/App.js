// client/src/App.js
import React from 'react';
import './App.css';
import Chat from './Chat'; // Import the Chat component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>My WebSocket Chat App</p>
      </header>
      <Chat /> {/* Render the Chat component */}
    </div>
  );
}

export default App;
