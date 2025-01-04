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
  where
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
  Drawer
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'

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

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      // Get all todos (both active and archived)
      const q = query(collection(db, 'todos'))
      const querySnapshot = await getDocs(q)
      
      const fetchedTodos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Set active todos to state
      setTodos(fetchedTodos.filter(todo => !todo.archived))
      // Store all todos separately
      setAllTodos(fetchedTodos)
      setError(null)
    } catch (error) {
      console.error("Error fetching todos:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue)
    if (!searchValue.trim()) {
      setSearchResults([])
      return
    }

    const filteredResults = allTodos
      .filter(todo =>
        todo.text.toLowerCase().includes(searchValue.toLowerCase())
      )
      .sort((a, b) => {
        // Sort archived items to the bottom
        if (a.archived && !b.archived) return 1
        if (!a.archived && b.archived) return -1
        return 0
      })

    setSearchResults(filteredResults)
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inputValue.trim() !== '') {
      try {
        setLoading(true)
        
        const newTodo = {
          text: inputValue,
          completed: false,
          archived: false,
          timestamp: new Date().getTime(),
          archivedAt: null
        }

        const docRef = await addDoc(collection(db, 'todos'), newTodo)
        
        const todoWithId = {
          id: docRef.id,
          ...newTodo
        }
        
        // Update both todos and allTodos
        setTodos(prevTodos => [todoWithId, ...prevTodos])
        setAllTodos(prevAll => [todoWithId, ...prevAll])
        
        setInputValue('')
        setError(null)
      } catch (error) {
        console.error("Error adding todo:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleItemClick = (todo) => {
    setSelectedTodo(todo)
    setNoteInput(todo.notes || '')
    setDrawerOpen(true)
  }

  const handleNoteUpdate = async (todoId, newNote) => {
    try {
      const todoRef = doc(db, 'todos', todoId)
      await updateDoc(todoRef, {
        notes: newNote
      })
      
      // Update local state
      setAllTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId ? { ...todo, notes: newNote } : todo
        )
      )
      setSearchResults(prevResults => 
        prevResults.map(todo => 
          todo.id === todoId ? { ...todo, notes: newNote } : todo
        )
      )
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

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
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <SearchIcon sx={{ p: '10px', color: 'white' }} />
            <InputBase
              sx={{ 
                ml: 1, 
                flex: 1, 
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
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

          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            Todo List
          </Typography>

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

          <List>
            {todos.map(todo => (
              <ListItem 
                key={todo.id}
                sx={{
                  mb: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  gap: '8px'
                }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    sx={{ 
                      color: 'white',
                      '&.Mui-checked': {
                        color: 'white',
                      }
                    }}
                  />
                  <ListItemText 
                    primary={todo.text}
                    onClick={() => handleItemClick(todo)}
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: 'white',
                      margin: 0,
                      cursor: 'pointer',
                      '& .MuiTypography-root': {
                        color: 'white'
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
          </List>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false)
              setSelectedTodo(null)  // Clear selected todo when closing drawer
            }}
            PaperProps={{
              sx: {
                width: '33%',
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '20px'
              }
            }}
          >
            {selectedTodo && (
              <div>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {selectedTodo.text}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 3 
                }}>
                  Created: {new Date(selectedTodo.timestamp).toLocaleString()}
                </Typography>
                
                {selectedTodo.archived === true && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      unarchiveTodo(selectedTodo.id)
                    }}
                    sx={{
                      mb: 3,
                      backgroundColor: '#4CAF50',
                      '&:hover': {
                        backgroundColor: '#45a049'
                      }
                    }}
                  >
                    Return to List
                  </Button>
                )}
                
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Notes:
                </Typography>
                <TextField
                  multiline
                  rows={10}
                  fullWidth
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onBlur={() => handleNoteUpdate(selectedTodo.id, noteInput)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                  }}
                />
              </div>
            )}
          </Drawer>
        </Container>
      </div>
    </div>
  )
}

export default App
