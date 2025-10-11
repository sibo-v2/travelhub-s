import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  Edit2,
  Save,
  X,
  CheckSquare,
  Tag,
  Calendar,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_completed: boolean;
  color: string;
  reminder_date?: string;
  created_at: string;
  updated_at: string;
  note_categories?: { name: string; icon: string; color: string };
  note_tags?: Array<{ tag: string }>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function Notes() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<string>('');
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [notesData, categoriesData] = await Promise.all([
      supabase
        .from('travel_notes')
        .select('*, note_categories(*), note_tags(*)')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('note_categories').select('*').order('name'),
    ]);

    if (notesData.data) setNotes(notesData.data);
    if (categoriesData.data) setCategories(categoriesData.data);
    setLoading(false);
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const createNote = async () => {
    if (!user || !newNoteTitle.trim()) {
      showToast('Please enter a title', 'warning');
      return;
    }

    const content = contentEditableRef.current?.innerHTML || '';

    const { error } = await supabase.from('travel_notes').insert({
      user_id: user.id,
      title: newNoteTitle,
      content: content,
      category_id: newNoteCategory || null,
    });

    if (error) {
      showToast('Failed to create note', 'error');
      return;
    }

    showToast('Note created successfully!', 'success');
    setIsCreating(false);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteCategory('');
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = '';
    }
    loadData();
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    const { error } = await supabase
      .from('travel_notes')
      .update(updates)
      .eq('id', noteId);

    if (error) {
      showToast('Failed to update note', 'error');
      return;
    }

    loadData();
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const { error } = await supabase.from('travel_notes').delete().eq('id', noteId);

    if (error) {
      showToast('Failed to delete note', 'error');
      return;
    }

    showToast('Note deleted', 'success');
    loadData();
  };

  const togglePin = async (note: Note) => {
    await updateNote(note.id, { is_pinned: !note.is_pinned });
    showToast(note.is_pinned ? 'Note unpinned' : 'Note pinned', 'success');
  };

  const toggleComplete = async (note: Note) => {
    await updateNote(note.id, { is_completed: !note.is_completed });
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = note.content;
    }
    setNewNoteCategory(note.category_id || '');
  };

  const saveEdit = async () => {
    if (!editingNote) return;

    const content = contentEditableRef.current?.innerHTML || '';

    await updateNote(editingNote.id, {
      title: newNoteTitle,
      content: content,
      category_id: newNoteCategory || null,
    });

    showToast('Note updated successfully!', 'success');
    setEditingNote(null);
    setNewNoteTitle('');
    setNewNoteCategory('');
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = '';
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setNewNoteTitle('');
    setNewNoteCategory('');
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = '';
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || note.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter((note) => note.is_pinned);
  const regularNotes = filteredNotes.filter((note) => !note.is_pinned);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to access your notes
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative h-[350px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Travel planning with notebook"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Travel Notes</h1>
            <p className="text-lg text-white drop-shadow-md">
              Organize your travel plans, packing lists, and reminders
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Note</span>
              </button>
            </div>
          </div>
        </div>

        {(isCreating || editingNote) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2 flex items-center space-x-2">
                  <button
                    onClick={() => applyFormat('bold')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => applyFormat('italic')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => applyFormat('underline')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Underline"
                  >
                    <Underline className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    onClick={() => applyFormat('insertUnorderedList')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => applyFormat('insertOrderedList')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    onClick={() => applyFormat('hiliteColor', '#fef08a')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Highlight"
                  >
                    <Highlighter className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div
                  ref={contentEditableRef}
                  contentEditable
                  className="min-h-[200px] p-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Start typing your note..."
                  onInput={(e) => setNewNoteContent(e.currentTarget.innerHTML)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingNote ? saveEdit : createNote}
                  className="px-6 py-2 bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingNote ? 'Save Changes' : 'Create Note'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Edit2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No notes found' : 'No notes yet'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first note to start organizing your travel plans'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Pin className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400" />
                  Pinned Notes
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTogglePin={() => togglePin(note)}
                      onToggleComplete={() => toggleComplete(note)}
                      onEdit={() => startEdit(note)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    All Notes
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTogglePin={() => togglePin(note)}
                      onToggleComplete={() => toggleComplete(note)}
                      onEdit={() => startEdit(note)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onTogglePin: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function NoteCard({ note, onTogglePin, onToggleComplete, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-5 ${note.is_completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {note.note_categories && (
            <span className="text-lg">{note.note_categories.icon}</span>
          )}
          <button
            onClick={onToggleComplete}
            className={`${
              note.is_completed
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500'
            } hover:scale-110 transition-transform`}
          >
            <CheckSquare className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePin}
            className={`${
              note.is_pinned
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-gray-400 dark:text-gray-500'
            } hover:scale-110 transition-transform`}
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="text-gray-400 dark:text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-2 ${note.is_completed ? 'line-through' : ''}`}>
        {note.title}
      </h3>

      <div
        className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-4"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />

      {note.note_categories && (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {note.note_categories.name}
        </span>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Updated {new Date(note.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
