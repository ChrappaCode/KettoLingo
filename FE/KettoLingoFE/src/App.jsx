import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Overview from './Overview';

function App() {
  return (
    <Router>
      <div>
        <h1>KettoLingo App</h1>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/" element={<Login />} />  {/* Default route redirects to login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
