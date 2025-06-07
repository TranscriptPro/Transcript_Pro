import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Header from './components/layout/Header';
import TranscriptionApp from './components/TranscriptionApp';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <TranscriptionApp />
        </main>
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TranscripPro
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;