import { Suspense } from 'react';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import AppRoutes from './routes';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;