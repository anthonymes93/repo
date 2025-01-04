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
  InputBase
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <Container>
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
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
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
        </Container>
      </div>
    </div>
  )
}

export default App
