/**
 * HARMONY CHORD EDITOR COMPONENT
 * Version: 1.003
 * 
 * Allows users to edit individual chords in a harmonized part:
 * - Change chord quality
 * - Delete chords
 * - Add new chords
 * - Save or discard changes
 * 
 * Features:
 * - Double-click or right-click to edit
 * - Dropdown with all chord quality options
 * - Full error checking and validation
 * - Undo/Redo support
 * 
 * PRESERVATION: This is a NEW component that extends existing functionality
 * without modifying any existing code.
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { HarmonizedPart, ChordQuality, HarmonyEngine } from '../lib/harmony-engine';
import { Edit3, Trash2, Plus, Save, X, AlertCircle, Undo2, Redo2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HarmonyChordEditorProps {
  harmonizedPart: HarmonizedPart;
  onSaveChanges: (updatedPart: HarmonizedPart) => void;
  onCancel?: () => void;
}

type EditAction = 'change' | 'delete' | 'add-before' | 'add-after';

interface EditHistory {
  chordProgression: ChordQuality[];
  chordRoots: number[];
  chordLabels: string[];
  timestamp: number;
}

export function HarmonyChordEditor({
  harmonizedPart,
  onSaveChanges,
  onCancel,
}: HarmonyChordEditorProps) {
  // State for editing
  const [editingChordIndex, setEditingChordIndex] = useState<number | null>(null);
  const [editAction, setEditAction] = useState<EditAction | null>(null);
  const [newChordQuality, setNewChordQuality] = useState<ChordQuality>('M');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for the working copy
  const [workingChordProgression, setWorkingChordProgression] = useState<ChordQuality[]>(
    [...harmonizedPart.analysis.chordProgression]
  );
  const [workingChordRoots, setWorkingChordRoots] = useState<number[]>(
    [...harmonizedPart.analysis.chordRoots]
  );
  
  // ADDITIVE FIX: Generate unique chord labels from progression (not from duplicated chordLabels)
  // This ensures the labels array matches the progression array length
  const generateUniqueChordLabels = (progression: ChordQuality[], roots: number[]): string[] => {
    return progression.map((quality, index) => 
      HarmonyEngine.generateChordLabel(roots[index], quality)
    );
  };
  
  const [workingChordLabels, setWorkingChordLabels] = useState<string[]>(
    generateUniqueChordLabels(harmonizedPart.analysis.chordProgression, harmonizedPart.analysis.chordRoots)
  );
  
  // Undo/Redo history
  // ADDITIVE FIX: Initialize with unique labels from progression
  const [history, setHistory] = useState<EditHistory[]>([{
    chordProgression: [...harmonizedPart.analysis.chordProgression],
    chordRoots: [...harmonizedPart.analysis.chordRoots],
    chordLabels: generateUniqueChordLabels(harmonizedPart.analysis.chordProgression, harmonizedPart.analysis.chordRoots),
    timestamp: Date.now(),
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // All available chord qualities
  const allChordQualities: ChordQuality[] = [
    'M', 'm', 'dim', 'aug', 'sus2', 'sus4',
    'M7', 'm7', 'dom7', 'dim7', 'hdim7', 'mM7',
    'M9', 'm9', 'dom9',
    'M11', 'm11', 'dom11',
    'M13', 'm13', 'dom13',
    '7#9', '7b9', '7#5', '7b5', '7#11', 'alt',
    'add9', '6', 'm6',
  ];

  /**
   * Save current state to history
   */
  const saveToHistory = useCallback(() => {
    const newHistoryItem: EditHistory = {
      chordProgression: [...workingChordProgression],
      chordRoots: [...workingChordRoots],
      chordLabels: [...workingChordLabels],
      timestamp: Date.now(),
    };
    
    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryItem);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [workingChordProgression, workingChordRoots, workingChordLabels, history, historyIndex]);

  /**
   * Undo last change
   */
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setWorkingChordProgression([...prevState.chordProgression]);
      setWorkingChordRoots([...prevState.chordRoots]);
      setWorkingChordLabels([...prevState.chordLabels]);
      setHistoryIndex(historyIndex - 1);
      setHasUnsavedChanges(true);
      toast.info('Change undone');
    }
  }, [history, historyIndex]);

  /**
   * Redo last undone change
   */
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setWorkingChordProgression([...nextState.chordProgression]);
      setWorkingChordRoots([...nextState.chordRoots]);
      setWorkingChordLabels([...nextState.chordLabels]);
      setHistoryIndex(historyIndex + 1);
      setHasUnsavedChanges(true);
      toast.info('Change redone');
    }
  }, [history, historyIndex]);

  /**
   * Open edit dialog for a chord
   */
  const openEditDialog = useCallback((index: number, action: EditAction) => {
    if (index < 0 || index >= workingChordProgression.length) {
      toast.error('Invalid chord index');
      return;
    }
    
    setEditingChordIndex(index);
    setEditAction(action);
    
    if (action === 'change') {
      setNewChordQuality(workingChordProgression[index]);
    } else {
      setNewChordQuality('M');
    }
  }, [workingChordProgression]);

  /**
   * Close edit dialog
   */
  const closeEditDialog = useCallback(() => {
    setEditingChordIndex(null);
    setEditAction(null);
  }, []);

  /**
   * Change a chord quality
   * ADDITIVE FIX: Updated to regenerate labels from progression to maintain sync
   */
  const handleChangeChord = useCallback(() => {
    if (editingChordIndex === null) return;
    
    try {
      // Validate index
      if (editingChordIndex < 0 || editingChordIndex >= workingChordProgression.length) {
        throw new Error('Invalid chord index');
      }
      
      // Update chord progression
      const newProgression = [...workingChordProgression];
      newProgression[editingChordIndex] = newChordQuality;
      
      // ADDITIVE FIX: Regenerate ALL labels from the updated progression to maintain sync
      const newLabels = generateUniqueChordLabels(newProgression, workingChordRoots);
      
      setWorkingChordProgression(newProgression);
      setWorkingChordLabels(newLabels);
      setHasUnsavedChanges(true);
      
      // Save to history
      saveToHistory();
      
      toast.success(`Chord #${editingChordIndex + 1} changed to ${newChordQuality}`);
      closeEditDialog();
    } catch (error) {
      console.error('Error changing chord:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change chord');
    }
  }, [editingChordIndex, newChordQuality, workingChordProgression, workingChordRoots, closeEditDialog, saveToHistory]);

  /**
   * Delete a chord
   * ADDITIVE FIX: Updated to regenerate labels from progression to maintain sync
   */
  const handleDeleteChord = useCallback(() => {
    if (editingChordIndex === null) return;
    
    try {
      // Validate we have at least 2 chords
      if (workingChordProgression.length <= 1) {
        throw new Error('Cannot delete the last chord. At least one chord must remain.');
      }
      
      // Validate index
      if (editingChordIndex < 0 || editingChordIndex >= workingChordProgression.length) {
        throw new Error('Invalid chord index');
      }
      
      // Remove chord from progression and roots
      const newProgression = workingChordProgression.filter((_, i) => i !== editingChordIndex);
      const newRoots = workingChordRoots.filter((_, i) => i !== editingChordIndex);
      
      // ADDITIVE FIX: Regenerate labels from updated progression
      const newLabels = generateUniqueChordLabels(newProgression, newRoots);
      
      setWorkingChordProgression(newProgression);
      setWorkingChordRoots(newRoots);
      setWorkingChordLabels(newLabels);
      setHasUnsavedChanges(true);
      
      // Save to history
      saveToHistory();
      
      toast.success(`Chord #${editingChordIndex + 1} deleted`);
      closeEditDialog();
    } catch (error) {
      console.error('Error deleting chord:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete chord');
    }
  }, [editingChordIndex, workingChordProgression, workingChordRoots, closeEditDialog, saveToHistory]);

  /**
   * Add a new chord
   * ADDITIVE FIX: Updated to regenerate labels from progression to maintain sync
   */
  const handleAddChord = useCallback(() => {
    if (editingChordIndex === null || editAction === null) return;
    
    try {
      // Validate index
      if (editingChordIndex < 0 || editingChordIndex >= workingChordProgression.length) {
        throw new Error('Invalid chord index');
      }
      
      const insertIndex = editAction === 'add-before' ? editingChordIndex : editingChordIndex + 1;
      
      // Use the same root as the adjacent chord
      const root = workingChordRoots[editingChordIndex];
      
      // Insert new chord into progression and roots
      const newProgression = [
        ...workingChordProgression.slice(0, insertIndex),
        newChordQuality,
        ...workingChordProgression.slice(insertIndex),
      ];
      
      const newRoots = [
        ...workingChordRoots.slice(0, insertIndex),
        root,
        ...workingChordRoots.slice(insertIndex),
      ];
      
      // ADDITIVE FIX: Regenerate ALL labels from updated progression
      const newLabels = generateUniqueChordLabels(newProgression, newRoots);
      
      setWorkingChordProgression(newProgression);
      setWorkingChordRoots(newRoots);
      setWorkingChordLabels(newLabels);
      setHasUnsavedChanges(true);
      
      // Save to history
      saveToHistory();
      
      toast.success(`Chord added ${editAction === 'add-before' ? 'before' : 'after'} chord #${editingChordIndex + 1}`);
      closeEditDialog();
    } catch (error) {
      console.error('Error adding chord:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add chord');
    }
  }, [editingChordIndex, editAction, newChordQuality, workingChordProgression, workingChordRoots, closeEditDialog, saveToHistory]);

  /**
   * Save all changes
   * ADDITIVE FIX: Regenerate full chordLabels array for harmony notes when saving
   */
  const handleSaveChanges = useCallback(() => {
    try {
      // Validate progression
      if (workingChordProgression.length === 0) {
        throw new Error('Chord progression cannot be empty');
      }
      
      if (workingChordProgression.length !== workingChordRoots.length) {
        throw new Error('Chord progression and roots must have same length');
      }
      
      // ADDITIVE FIX: Regenerate full chordLabels array matching original melody length
      // This reconstructs the repeated labels for each melody note based on the updated progression
      const originalMelodyLength = harmonizedPart.originalMelody.length;
      const chordChangeInterval = Math.ceil(originalMelodyLength / workingChordProgression.length);
      const regeneratedChordLabels: string[] = [];
      
      for (let i = 0; i < originalMelodyLength; i++) {
        const chordIndex = Math.min(
          Math.floor(i / chordChangeInterval),
          workingChordProgression.length - 1
        );
        // Only add label if melody note is not a rest
        if (harmonizedPart.originalMelody[i] !== -1) {
          regeneratedChordLabels.push(
            HarmonyEngine.generateChordLabel(
              workingChordRoots[chordIndex],
              workingChordProgression[chordIndex]
            )
          );
        }
      }
      
      // Create updated harmonized part
      const updatedPart: HarmonizedPart = {
        ...harmonizedPart,
        analysis: {
          ...harmonizedPart.analysis,
          chordProgression: [...workingChordProgression],
          chordRoots: [...workingChordRoots],
        },
        chordLabels: regeneratedChordLabels,
      };
      
      // Notify parent
      onSaveChanges(updatedPart);
      setHasUnsavedChanges(false);
      
      toast.success('Changes saved successfully!', {
        description: `Updated ${workingChordProgression.length} chords`,
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
    }
  }, [workingChordProgression, workingChordRoots, harmonizedPart, onSaveChanges]);

  /**
   * Discard all changes
   * ADDITIVE FIX: Updated to use unique labels from progression
   */
  const handleDiscardChanges = useCallback(() => {
    const originalProgression = [...harmonizedPart.analysis.chordProgression];
    const originalRoots = [...harmonizedPart.analysis.chordRoots];
    const originalLabels = generateUniqueChordLabels(originalProgression, originalRoots);
    
    setWorkingChordProgression(originalProgression);
    setWorkingChordRoots(originalRoots);
    setWorkingChordLabels(originalLabels);
    setHasUnsavedChanges(false);
    setHistory([{
      chordProgression: originalProgression,
      chordRoots: originalRoots,
      chordLabels: originalLabels,
      timestamp: Date.now(),
    }]);
    setHistoryIndex(0);
    
    if (onCancel) {
      onCancel();
    }
    
    toast.info('Changes discarded');
  }, [harmonizedPart, onCancel]);

  return (
    <div className="space-y-4">
      {/* Header with Undo/Redo/Save/Discard */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="gap-1"
          >
            <Redo2 className="w-3 h-3" />
            Redo
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDiscardChanges}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            className="gap-1"
          >
            <Save className="w-3 h-3" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Chord Progression Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Chord Progression (Right-click or Double-click to edit)
        </Label>
        <div className="flex flex-wrap gap-2">
          {workingChordLabels.map((label, index) => (
            <ContextMenu key={index}>
              <ContextMenuTrigger>
                <Badge
                  variant="outline"
                  className="font-mono text-sm cursor-pointer hover:bg-accent transition-colors"
                  onDoubleClick={() => openEditDialog(index, 'change')}
                >
                  {label}
                </Badge>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => openEditDialog(index, 'change')}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Change Chord
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => openEditDialog(index, 'add-before')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Before
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => openEditDialog(index, 'add-after')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add After
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => openEditDialog(index, 'delete')}
                  className="gap-2 text-destructive"
                  disabled={workingChordProgression.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Chord
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Info Alert */}
      {workingChordProgression.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Chord progression is empty. Add at least one chord to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingChordIndex !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editAction === 'change' && 'Change Chord'}
              {editAction === 'delete' && 'Delete Chord'}
              {editAction === 'add-before' && 'Add Chord Before'}
              {editAction === 'add-after' && 'Add Chord After'}
            </DialogTitle>
            <DialogDescription>
              {editAction === 'change' && `Editing chord #${(editingChordIndex ?? 0) + 1}: ${workingChordLabels[editingChordIndex ?? 0]}`}
              {editAction === 'delete' && `Are you sure you want to delete chord #${(editingChordIndex ?? 0) + 1}?`}
              {editAction === 'add-before' && `Add a new chord before #${(editingChordIndex ?? 0) + 1}`}
              {editAction === 'add-after' && `Add a new chord after #${(editingChordIndex ?? 0) + 1}`}
            </DialogDescription>
          </DialogHeader>

          {(editAction === 'change' || editAction === 'add-before' || editAction === 'add-after') && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Chord Quality</Label>
                <Select value={newChordQuality} onValueChange={(val) => setNewChordQuality(val as ChordQuality)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="M">M - Major</SelectItem>
                    <SelectItem value="m">m - Minor</SelectItem>
                    <SelectItem value="dim">dim - Diminished</SelectItem>
                    <SelectItem value="aug">aug - Augmented</SelectItem>
                    <SelectItem value="sus2">sus2 - Suspended 2nd</SelectItem>
                    <SelectItem value="sus4">sus4 - Suspended 4th</SelectItem>
                    <SelectItem value="M7">M7 - Major 7th</SelectItem>
                    <SelectItem value="m7">m7 - Minor 7th</SelectItem>
                    <SelectItem value="dom7">dom7 - Dominant 7th</SelectItem>
                    <SelectItem value="dim7">dim7 - Diminished 7th</SelectItem>
                    <SelectItem value="hdim7">hdim7 - Half-diminished 7th</SelectItem>
                    <SelectItem value="mM7">mM7 - Minor-Major 7th</SelectItem>
                    <SelectItem value="M9">M9 - Major 9th</SelectItem>
                    <SelectItem value="m9">m9 - Minor 9th</SelectItem>
                    <SelectItem value="dom9">dom9 - Dominant 9th</SelectItem>
                    <SelectItem value="M11">M11 - Major 11th</SelectItem>
                    <SelectItem value="m11">m11 - Minor 11th</SelectItem>
                    <SelectItem value="dom11">dom11 - Dominant 11th</SelectItem>
                    <SelectItem value="M13">M13 - Major 13th</SelectItem>
                    <SelectItem value="m13">m13 - Minor 13th</SelectItem>
                    <SelectItem value="dom13">dom13 - Dominant 13th</SelectItem>
                    <SelectItem value="7#9">7#9 - Dominant 7 sharp 9</SelectItem>
                    <SelectItem value="7b9">7b9 - Dominant 7 flat 9</SelectItem>
                    <SelectItem value="7#5">7#5 - Dominant 7 sharp 5</SelectItem>
                    <SelectItem value="7b5">7b5 - Dominant 7 flat 5</SelectItem>
                    <SelectItem value="7#11">7#11 - Lydian dominant</SelectItem>
                    <SelectItem value="alt">alt - Altered dominant</SelectItem>
                    <SelectItem value="add9">add9 - Add 9</SelectItem>
                    <SelectItem value="6">6 - Major 6th</SelectItem>
                    <SelectItem value="m6">m6 - Minor 6th</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {editAction === 'delete' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone without using the Undo button.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            {editAction === 'change' && (
              <Button onClick={handleChangeChord}>Change Chord</Button>
            )}
            {editAction === 'delete' && (
              <Button variant="destructive" onClick={handleDeleteChord}>
                Delete Chord
              </Button>
            )}
            {(editAction === 'add-before' || editAction === 'add-after') && (
              <Button onClick={handleAddChord}>Add Chord</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
