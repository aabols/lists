import LanisRouter from './components/LanisRouter';
import { DevProvider } from './contexts/DevContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import './App.css';

const queryClient = new QueryClient();

function App() {

  return (
    <DevProvider>
      <AuthProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>
              <div className="AppBody">
                <LanisRouter/>
              </div>
            </DndProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </DevProvider>
  );
}

export default App;