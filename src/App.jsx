// Test auto-commit - this comment should be saved automatically
// Testing auto-commit again - [current time]
//it works
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
  Drawer,
  Box,
  Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { format } from 'date-fns'

function App() {
  const [todos, setTodos] = useState([])
  const [allTodos, setAllTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch active todos on component mount
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

    const filteredResults = allTodos.filter(todo =>
      todo.text.toLowerCase().includes(searchValue.toLowerCase())
    )
    setSearchResults(filteredResults)
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

  const toggleTodo = async (id) => {
    try {
      const todoToToggle = todos.find(todo => todo.id === id)
      await updateDoc(doc(db, 'todos', id), {
        completed: !todoToToggle.completed
      })
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
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

  const handleTodoClick = (todo) => {
    setSelectedTodo(todo)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedTodo(null)
  }

  return (
    <>
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <Container 
          maxWidth="sm" 
          sx={{ 
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            padding: '20px'
          }}
        >
          {/* Search Field */}
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              mb: 3,
              backgroundColor: 'transparent',
              border: '1px solid white'
            }}
          >
            <IconButton sx={{ p: '10px', color: 'white' }}>
              <SearchIcon />
            </IconButton>
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
                    onClick={() => handleTodoClick(todo)}
                  >
                    <ListItemText
                      primary={todo.text}
                      secondary={todo.archived ? '(Archived)' : '(Active)'}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'white'
                        },
                        '& .MuiListItemText-secondary': {
                          color: 'rgba(255, 255, 255, 0.7)'
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

          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px',
            width: '100%',
            justifyContent: 'center'
          }}>
            <TextField
              sx={{
                maxWidth: '400px',
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
              fullWidth
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo"
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              Add
            </Button>
          </form>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error: {error}
            </Typography>
          )}

          {loading ? (
            <CircularProgress sx={{ color: 'white' }} />
          ) : (
            <List sx={{ width: '100%' }}>
              {todos.map(todo => (
                <ListItem 
                  key={todo.id}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    padding: '8px 0'
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
                      sx={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: 'white',
                        margin: 0,
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
          )}
        </Container>
      </div>

      {/* Side Peek Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: '300px',
            backgroundColor: '#121212',
            color: 'white',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)'
          }
        }}
      >
        {selectedTodo && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">Task Details</Typography>
              <IconButton 
                onClick={handleDrawerClose}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Title
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                p: 1.5,
                borderRadius: 1
              }}
            >
              {selectedTodo.text}
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Created
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                p: 1.5,
                borderRadius: 1
              }}
            >
              {format(selectedTodo.timestamp, 'PPpp')}
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 2 }} />
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: selectedTodo.archived ? 'error.main' : 'success.main',
                mt: 2
              }}
            >
              Status: {selectedTodo.archived ? 'Archived' : 'Active'}
            </Typography>
          </Box>
        )}
      </Drawer>
    </>
  )
}

export default App
