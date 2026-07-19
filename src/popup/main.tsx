import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getState } from '../storage';
import App from './App';
import './popup.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

// Kick off the storage read before creating the React root so the first paint
// already has real state at the final popup width — otherwise the transient
// "Loading…" render paints at a shrink-to-fit width, then jumps to 380px.
const initialStatePromise = getState();
const root = createRoot(rootElement);

initialStatePromise.then((initialState) => {
  root.render(
    <StrictMode>
      <App initialState={initialState} />
    </StrictMode>,
  );
});
