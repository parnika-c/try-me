import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import JoinChallenge from "./components/JoinChallenge";
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{padding: 24}}>
      <JoinChallenge />
    </div>
  );
}

export default App
