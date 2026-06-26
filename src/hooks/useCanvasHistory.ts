import { useState, useCallback, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface HistoryState {
  canvasState: string;
  timestamp: number;
}

export const useCanvasHistory = (fabricCanvas: FabricCanvas | null) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRedoing, setIsRedoing] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const maxHistorySize = 50;

  // Save current canvas state to history
  const saveState = useCallback(() => {
    if (!fabricCanvas || isRedoing || isUndoing) return;

    const canvasState = JSON.stringify(fabricCanvas.toJSON());
    const newState: HistoryState = {
      canvasState,
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // Add new state
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });

    setHistoryIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      return newIndex;
    });
  }, [fabricCanvas, historyIndex, isRedoing, isUndoing]);

  // Initialize with empty canvas state
  useEffect(() => {
    if (!fabricCanvas || history.length > 0) return;

    const initialState: HistoryState = {
      canvasState: JSON.stringify(fabricCanvas.toJSON()),
      timestamp: Date.now()
    };

    setHistory([initialState]);
    setHistoryIndex(0);
  }, [fabricCanvas, history.length]);

  // Auto-save on canvas changes with throttling
  useEffect(() => {
    if (!fabricCanvas) return;

    let timeoutId: NodeJS.Timeout;
    const throttledSaveState = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveState, 250); // Throttle to 250ms
    };

    const handleObjectAdded = throttledSaveState;
    const handleObjectRemoved = throttledSaveState;
    const handleObjectModified = throttledSaveState;
    const handlePathCreated = throttledSaveState;

    fabricCanvas.on('object:added', handleObjectAdded);
    fabricCanvas.on('object:removed', handleObjectRemoved);
    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('path:created', handlePathCreated);

    return () => {
      clearTimeout(timeoutId);
      fabricCanvas.off('object:added', handleObjectAdded);
      fabricCanvas.off('object:removed', handleObjectRemoved);
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [fabricCanvas, saveState]);

  const undo = useCallback(() => {
    if (!fabricCanvas || !canUndo) return;

    const targetIndex = historyIndex - 1;
    const targetState = history[targetIndex];

    if (!targetState) return;

    setIsUndoing(true);
    
    fabricCanvas.loadFromJSON(targetState.canvasState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(targetIndex);
      setIsUndoing(false);
    });
  }, [fabricCanvas, history, historyIndex]);

  const redo = useCallback(() => {
    if (!fabricCanvas || !canRedo) return;

    const targetIndex = historyIndex + 1;
    const targetState = history[targetIndex];

    if (!targetState) return;

    setIsRedoing(true);

    fabricCanvas.loadFromJSON(targetState.canvasState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(targetIndex);
      setIsRedoing(false);
    });
  }, [fabricCanvas, history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
                 ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    historyLength: history.length,
    currentIndex: historyIndex
  };
};