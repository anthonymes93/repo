// Test auto-commit - this comment should be saved automatically
import { useState, useEffect } from 'react'
import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore'
import { 
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Paper,
  Typography,
  CircularProgress,
  InputBase,
  Drawer,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Box,
  Chip,
  Stack,
  InputAdornment
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { StrictMode } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

function App() {
  const [todos, setTodos] = useState([])
  const [allTodos, setAllTodos] = useState([])  // New state for all todos
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [taskStatus, setTaskStatus] = useState('not-started')
  const [columns, setColumns] = useState({
    'not-started': {
      title: 'Not Started',
      items: [],
      color: '#ff9800'
    },
    'in-progress': {
      title: 'In Progress',
      items: [],
      color: '#2196f3'
    },
    'completed': {
      title: 'Complete',
      items: [],
      color: '#4caf50'
    }
  });
  const [kanbanInput, setKanbanInput] = useState('');
  const [subtasks, setSubtasks] = useState({});

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    setTodos(prevTodos => sortTodos([...prevTodos]))
  }, [sortDirection])

  useEffect(() => {
    if (selectedTodo) {
      const todoSubtasks = subtasks[selectedTodo.id] || [];
      
      // Initialize columns with existing subtasks
      const initialColumns = {
        'not-started': {
          title: 'Not Started',
          items: todoSubtasks.filter(task => task.status === 'not-started'),
          color: '#ff9800'
        },
        'in-progress': {
          title: 'In Progress',
          items: todoSubtasks.filter(task => task.status === 'in-progress'),
          color: '#2196f3'
        },
        'completed': {
          title: 'Complete',
          items: todoSubtasks.filter(task => task.status === 'completed'),
          color: '#4caf50'
        }
      };

      setColumns(initialColumns);
    }
  }, [selectedTodo, subtasks]);

  useEffect(() => {
    if (selectedTodo) {
      setNoteInput(selectedTodo.notes || '');
    }
  }, [selectedTodo, subtasks]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'todos'));
      const querySnapshot = await getDocs(q);
      
      const fetchedTodos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'not-started'
      }));

      // Separate main todos and subtasks
      const mainTodos = fetchedTodos.filter(todo => !todo.parentId);
      const fetchedSubtasks = fetchedTodos.filter(todo => todo.parentId);
      
      // Organize subtasks by parent ID
      const subtasksByParent = fetchedSubtasks.reduce((acc, task) => {
        if (!acc[task.parentId]) {
          acc[task.parentId] = [];
        }
        acc[task.parentId].push(task);
        return acc;
      }, {});
      
      setTodos(mainTodos.filter(todo => !todo.archived));
      setAllTodos(mainTodos);
      setSubtasks(subtasksByParent);
      setError(null);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add phone number normalization function
  const normalizePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') return {
      raw: '',
      formatted: ''
    };

    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');
    
    // If no numbers, return empty
    if (!numbers) return {
      raw: '',
      formatted: ''
    };
    
    // Handle different formats (keep only last 10 digits if longer)
    const digits = numbers.slice(-10);
    
    // Only format if we have at least 1 digit
    if (digits.length === 0) return {
      raw: '',
      formatted: ''
    };

    // Format the number if it has enough digits
    if (digits.length === 10) {
      return {
        raw: digits,
        formatted: digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      };
    }

    // Return partial number without formatting
    return {
      raw: digits,
      formatted: digits
    };
  };

  // Update handleContactUpdate to normalize phone numbers
  const handleContactUpdate = async (todoId, field, value) => {
    try {
      let updateValue = value;
      
      if (field === 'phone') {
        const normalized = normalizePhoneNumber(value);
        updateValue = normalized.formatted;
        
        // If empty or only contains formatting characters, set to empty string
        if (!normalized.raw) {
          updateValue = '';
        }
      }

      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        [field]: updateValue
      });
      
      const updatedTodo = { ...selectedTodo, [field]: updateValue };
      setSelectedTodo(updatedTodo);
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  // Update handleSearch to handle phone number formats
  const handleSearch = (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const searchLower = query.toLowerCase();
    // Normalize the search query if it looks like a phone number
    const normalizedQuery = query.replace(/\D/g, '');
    
    const results = allTodos.filter(todo => {
      const matchesText = todo.text.toLowerCase().includes(searchLower);
      
      // Check multiple phone number formats
      const phoneMatches = todo.phone && (
        // Check original format
        todo.phone.includes(query) ||
        // Check normalized format
        normalizePhoneNumber(todo.phone).raw.includes(normalizedQuery) ||
        // Check formatted version
        normalizePhoneNumber(todo.phone).formatted.includes(query)
      );
      
      return (matchesText || phoneMatches) && !todo.archived;
    });

    setSearchResults(results);
  };

  const archiveTodo = async (id) => {
    try {
      setLoading(true)
      const todoRef = doc(db, 'todos', id)
      
      await updateDoc(todoRef, {
        archived: true,
        archivedAt: new Date().getTime()
      })

      // Update both todos and allTodos
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === id ? { ...todo, archived: true } : todo
      ))

      // Update search results if there's an active search
      if (searchQuery) {
        setSearchResults(prevResults => prevResults.map(todo =>
          todo.id === id ? { ...todo, archived: true } : todo
        ))
      }

      console.log("Todo archived successfully")
      
    } catch (error) {
      console.error("Error archiving todo:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const unarchiveTodo = async (id) => {
    try {
      setLoading(true)
      const todoRef = doc(db, 'todos', id)
      
      await updateDoc(todoRef, {
        archived: false,
        archivedAt: null
      })

      // Update all states including selectedTodo
      const updatedTodo = { ...allTodos.find(t => t.id === id), archived: false, archivedAt: null }
      
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === id ? updatedTodo : todo
      ))
      setTodos(prevTodos => [...prevTodos, updatedTodo])
      setSearchResults(prevResults => prevResults.map(todo =>
        todo.id === id ? updatedTodo : todo
      ))
      setSelectedTodo(updatedTodo)  // Update the selected todo
      
      console.log("Todo unarchived successfully")
    } catch (error) {
      console.error("Error unarchiving todo:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sortTodos = (todosToSort) => {
    return [...todosToSort].sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return sortDirection === 'asc' 
        ? timeA - timeB 
        : timeB - timeA;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      try {
        setLoading(true);
        
        const newTodo = {
          text: inputValue,
          completed: false,
          archived: false,
          timestamp: new Date().getTime(),
          archivedAt: null,
          priority: todos.length  // Add priority based on position
        };

        const docRef = await addDoc(collection(db, 'todos'), newTodo);
        
        const todoWithId = {
          id: docRef.id,
          ...newTodo
        };
        
        setTodos(prevTodos => [todoWithId, ...prevTodos]);
        setAllTodos(prevAll => [todoWithId, ...prevAll]);
        
        setInputValue('');
        setError(null);
      } catch (error) {
        console.error("Error adding todo:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleItemClick = (todo) => {
    setSelectedTodo(todo)
    setNoteInput(todo.notes || '')
    setDrawerOpen(true)
  }

  const handleNoteUpdate = async (todoId, newNote) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        notes: newNote
      });
      
      // Update all relevant states
      const updatedTodo = { ...selectedTodo, notes: newNote };
      setSelectedTodo(updatedTodo);
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === todoId ? updatedTodo : todo
      ));
      
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        status: newStatus
      });
      
      // Update local states
      const updatedTodo = { ...selectedTodo, status: newStatus };
      
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === todoId ? updatedTodo : todo
      ));
      setSelectedTodo(updatedTodo);

      // Update columns
      const newColumns = {
        'not-started': {
          title: 'Not Started',
          items: [],
          color: '#ff9800'
        },
        'in-progress': {
          title: 'In Progress',
          items: [],
          color: '#2196f3'
        },
        'completed': {
          title: 'Complete',
          items: [],
          color: '#4caf50'
        }
      };
      newColumns[newStatus].items = [updatedTodo];
      setColumns(newColumns);

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    try {
      const items = Array.from(todos);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update priorities for all affected items
      const updatedItems = items.map((item, index) => ({
        ...item,
        priority: index
      }));

      setTodos(updatedItems);

      // Update priorities in Firebase
      const batch = writeBatch(db);
      updatedItems.forEach((item) => {
        const todoRef = doc(db, 'todos', item.id);
        batch.update(todoRef, { priority: item.priority });
      });
      await batch.commit();

    } catch (error) {
      console.error("Error updating priorities:", error);
      setError(error.message);
    }
  };

  const handleAddKanbanCard = async (e) => {
    e.preventDefault();
    if (kanbanInput.trim() === '') return;

    try {
      const newTodo = {
        text: kanbanInput,
        completed: false,
        archived: false,
        timestamp: new Date().getTime(),
        archivedAt: null,
        status: 'not-started',
        parentId: selectedTodo.id
      };

      const docRef = await addDoc(collection(db, 'todos'), newTodo);
      const todoWithId = {
        id: docRef.id,
        ...newTodo
      };

      // Update columns
      const newColumns = {
        ...columns,
        'not-started': {
          ...columns['not-started'],
          items: [...columns['not-started'].items, todoWithId]
        }
      };
      setColumns(newColumns);

      // Update subtasks state
      setSubtasks(prev => ({
        ...prev,
        [selectedTodo.id]: [...(prev[selectedTodo.id] || []), todoWithId]
      }));

      setKanbanInput('');

    } catch (error) {
      console.error("Error adding kanban card:", error);
      setError(error.message);
    }
  };

  // Add function to clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update the todos display logic
  const displayedTodos = searchQuery ? searchResults : todos;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',  // Just dark gray background
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '500px'
      }}>
        <Container style={{ padding: 0 }}>
          {/* Search field */}
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              mb: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: 'white',
                '& ::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)'
                }
              }}
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            {searchQuery && (
              <IconButton 
                sx={{ 
                  p: '10px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: 'white'
                  }
                }} 
                aria-label="clear search"
                onClick={handleClearSearch}
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton 
              type="submit" 
              sx={{ 
                p: '10px',
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: 'white'
                }
              }} 
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Search Results */}
          {searchQuery && (
            <Paper 
              sx={{ 
                width: '100%', 
                mb: 3, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <List>
                {searchResults.map(todo => (
                  <ListItem 
                    key={todo.id}
                    sx={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                    onClick={() => handleItemClick(todo)}
                  >
                    <ListItemText
                      primary={todo.text}
                      secondary={todo.archived ? '(Archived)' : '(Active)'}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: todo.archived ? '#ff4444' : 'white',
                          textDecoration: todo.archived ? 'line-through' : 'none'
                        },
                        '& .MuiListItemText-secondary': {
                          color: todo.archived ? '#ff4444' : 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
              Todo List
            </Typography>
            
            <IconButton 
              onClick={() => {
                const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                setSortDirection(newDirection);
                setTodos(prevTodos => sortTodos(prevTodos));
              }}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <SortIcon sx={{ 
                transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s'
              }} />
            </IconButton>
          </div>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error: {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo"
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Add Todo
            </Button>
          </form>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <CircularProgress sx={{ color: 'white' }} />
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {displayedTodos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      sx={{
                        mb: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)'
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        cursor: 'pointer'
                      }}>
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          sx={{
                            color: 'white',
                            '&.Mui-checked': {
                              color: 'white'
                            }
                          }}
                        />
                        <ListItemText 
                          primary={todo.text}
                          secondary={
                            searchQuery && todo.phone && todo.phone.includes(searchQuery) ? (
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.875rem'
                                }}
                              >
                                Phone: {todo.phone}
                              </Typography>
                            ) : null
                          }
                          onClick={() => {
                            setSelectedTodo(todo)
                            setNoteInput(todo.notes || '')
                            setDrawerOpen(true)
                          }}
                          sx={{
                            '& .MuiTypography-root': {
                              color: 'white',
                              textDecoration: todo.completed ? 'line-through' : 'none'
                            }
                          }}
                        />
                      </div>
                      <IconButton 
                        onClick={() => archiveTodo(todo.id)}
                        sx={{ 
                          color: 'white',
                          padding: '8px'
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedTodo(null);
            }}
            PaperProps={{
              sx: {
                width: '400px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                borderLeft: '1px solid rgba(255, 255, 255, 0.12)'
              }
            }}
          >
            {selectedTodo && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#4CAF50',
                        width: 56,
                        height: 56
                      }}
                    >
                      {selectedTodo.text[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {selectedTodo.text}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Created {new Date(selectedTodo.timestamp).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={selectedTodo.isActive ? "Active" : "Inactive"}
                      color={selectedTodo.isActive ? "success" : "default"}
                      size="small"
                    />
                    <Chip 
                      label={selectedTodo.completed ? "Completed" : "In Progress"}
                      color={selectedTodo.completed ? "primary" : "warning"}
                      size="small"
                    />
                  </Stack>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                  {/* Contact Section */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Contact Information
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={selectedTodo.phone || ''}
                      onChange={(e) => handleContactUpdate(selectedTodo.id, 'phone', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={selectedTodo.email || ''}
                      onChange={(e) => handleContactUpdate(selectedTodo.id, 'email', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                        }
                      }}
                    />
                  </Stack>

                  {/* Kanban Board */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Task Board
                  </Typography>
                  <Card sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    mb: 4,
                    boxShadow: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}>
                    <CardContent>
                      {/* Your existing Kanban board code */}
                      {renderKanbanBoard()}
                    </CardContent>
                  </Card>

                  {/* Notes Section */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Notes
                  </Typography>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onBlur={() => handleNoteUpdate(selectedTodo.id, noteInput)}
                    placeholder="Add your notes here..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Drawer>
        </Container>
      </div>
    </div>
  )
}

export default App
