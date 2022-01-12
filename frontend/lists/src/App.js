import './App.css';
import { Link } from 'react-router-dom';

function App() {

  return (
    <div>
      <nav>
        <Link to="/lists/invoices">Invoices</Link>
        <Link to="/lists/expenses">Expenses</Link>
      </nav>
    </div>
  );
}

export default App;