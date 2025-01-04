// Test auto-commit - this comment should be saved automatically
//works bru
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
  InputAdornment,
  Fade,
  Collapse,
  LinearProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer as SideNav,
  List as NavList,
  ListItem as NavItem,
  ListItemIcon as NavItemIcon,
  ListItemText as NavItemText,
  ListItemButton,
  Tooltip,
  Grid,
  Snackbar,
  Alert,
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
import { alpha } from '@mui/material/styles'
import NotesIcon from '@mui/icons-material/Notes'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import { styled, keyframes } from '@mui/material/styles'
import { 
  AttachFile as AttachFileIcon,
  DateRange as DateRangeIcon,
  Label as LabelIcon,
  PriorityHigh as PriorityHighIcon,
  Add as AddIcon,
  FormatListBulleted as TodoIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutomationIcon,
  Timer as TriggerIcon,
  FilterAlt as FilterIcon,
  Code as FunctionIcon,
  Send as SendIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  BugReport as BugReportIcon,
  Cloud as CloudIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  PlayArrow as RunningIcon,
  Stop as StoppedIcon,
  Folder as FolderIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedSection = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 0.3s ease-out`,
}));

const ProgressWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  backgroundColor: alpha('#FFFFFF', 0.03),
  borderRadius: '8px',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: alpha('#FFFFFF', 0.05),
  },
}));

function App() {
  const [todos, setTodos] = useState([])
  const [allTodos, setAllTodos] = useState([])  // New state for all todos
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
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
  const [activeSection, setActiveSection] = useState('details'); // or 'attachments' or 'timeline'
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState('todos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define sidebar width constants
  const SIDEBAR_WIDTH = 240;
  const SIDEBAR_WIDTH_COLLAPSED = 65;

  // Add automation node types
  const nodeTypes = {
    trigger: { icon: <TriggerIcon />, color: '#ff9800' },
    filter: { icon: <FilterIcon />, color: '#2196f3' },
    function: { icon: <FunctionIcon />, color: '#4CAF50' },
    action: { icon: <SendIcon />, color: '#e91e63' },
  };

  // Add sample automation
  const sampleAutomation = {
    name: "Task Completion Notification",
    description: "Send notification when task is marked as complete",
    nodes: [
      { id: 1, type: 'trigger', label: 'Task Completed', description: 'Triggers when a task is marked as complete' },
      { id: 2, type: 'filter', label: 'High Priority Only', description: 'Only continue if task was high priority' },
      { id: 3, type: 'function', label: 'Format Message', description: 'Prepare notification message' },
      { id: 4, type: 'action', label: 'Send Notification', description: 'Send message to specified channel' },
    ]
  };

  // Add this new sample automation
  const supportTicketAutomation = {
    name: "Customer Support Ticket Processing",
    description: "Automatically process and route new support tickets based on priority and type",
    nodes: [
      { 
        id: 1, 
        type: 'trigger', 
        label: 'New Zendesk Ticket', 
        description: 'Triggers when a new support ticket is created',
        config: {
          webhook: 'https://api.zendesk.com/webhooks/tickets',
          interval: '5 minutes'
        }
      },
      { 
        id: 2, 
        type: 'function', 
        label: 'Analyze Sentiment', 
        description: 'Analyze ticket content for sentiment and urgency',
        config: {
          api: 'OpenAI',
          model: 'gpt-4',
          maxTokens: 100
        }
      },
      { 
        id: 3, 
        type: 'filter', 
        label: 'Priority Router', 
        description: 'Route based on sentiment and keywords',
        config: {
          conditions: [
            { field: 'sentiment', operator: 'lessThan', value: -0.5 },
            { field: 'keywords', operator: 'contains', value: ['urgent', 'broken', 'error'] }
          ]
        }
      },
      { 
        id: 4, 
        type: 'function', 
        label: 'Ticket Enrichment', 
        description: 'Add customer data from CRM',
        config: {
          source: 'Salesforce',
          fields: ['customerTier', 'lastPurchase', 'totalSpent']
        }
      },
      { 
        id: 5, 
        type: 'action', 
        label: 'Slack Alert', 
        description: 'Send alert to support team',
        config: {
          channel: '#urgent-support',
          mention: '@support-team'
        }
      },
      { 
        id: 6, 
        type: 'action', 
        label: 'Update Ticket', 
        description: 'Update ticket with priority and assignment',
        config: {
          priority: 'high',
          assignTo: 'urgent-queue'
        }
      }
    ]
  };

  // Add more sample automations
  const automationsList = [
    {
      id: 1,
      name: "Customer Support Ticket Processing",
      description: "Automatically process and route new support tickets based on priority and type",
      status: "running",
      folder: "Support",
      lastRun: "2024-03-10T15:30:00"
    },
    {
      id: 2,
      name: "Lead Nurturing Workflow",
      description: "Qualify and nurture leads through email campaigns",
      status: "stopped",
      folder: "Marketing",
      lastRun: "2024-03-09T12:15:00"
    },
    {
      id: 3,
      name: "Invoice Processing",
      description: "Process invoices and update accounting system",
      status: "running",
      folder: "Finance",
      lastRun: "2024-03-10T16:45:00"
    }
  ];

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'todos'),
            where('completed', '==', false),
            where('archived', '==', false)
          )
        );
        
        const fetchedTodos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTodos(fetchedTodos);
        setAllTodos(fetchedTodos);
      } catch (error) {
        console.error("Error fetching todos:", error);
        setError("Failed to fetch todos");
      }
    };

    fetchTodos();
  }, []);

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

  useEffect(() => {
    if (selectedTodo) {
      // Calculate progress based on completed subtasks
      const total = columns['not-started'].items.length + 
                   columns['in-progress'].items.length + 
                   columns['completed'].items.length;
      const completed = columns['completed'].items.length;
      setProgress(total > 0 ? (completed / total) * 100 : 0);
    }
  }, [columns, selectedTodo]);

  useEffect(() => {
    const fetchCompletedCount = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'todos'),
            where('completed', '==', true)
          )
        );
        setCompletedTasksCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching completed count:", error);
      }
    };

    fetchCompletedCount();
  }, []);

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

  const renderKanbanBoard = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} style={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: column.color, mb: 1 }}>
              {column.title}
            </Typography>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    minHeight: 100,
                    padding: 8,
                    backgroundColor: snapshot.isDraggingOver 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 4
                  }}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: 8,
                            marginBottom: 8,
                            backgroundColor: snapshot.isDragging 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            ...provided.draggableProps.style
                          }}
                        >
                          {item.text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );

  // Add SpeedDial actions
  const actions = [
    { icon: <AttachFileIcon />, name: 'Add Attachment' },
    { icon: <DateRangeIcon />, name: 'Set Due Date' },
    { icon: <LabelIcon />, name: 'Add Label' },
    { icon: <PriorityHighIcon />, name: 'Set Priority' },
  ];

  const handleActiveToggle = async (todoId, isActive) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        isActive: isActive
      });
      
      const updatedTodo = { ...selectedTodo, isActive: isActive };
      setSelectedTodo(updatedTodo);
      setAllTodos(prevAll => prevAll.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === todoId ? updatedTodo : todo
      ));

      // Show notification
      setNotification({
        open: true,
        message: `${updatedTodo.text} is now ${isActive ? 'active' : 'inactive'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating active status:", error);
      setNotification({
        open: true,
        message: 'Failed to update task status',
        severity: 'error'
      });
    }
  };

  // Add handleCloseNotification function
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Add function to count active tasks
  const getActiveTasks = () => {
    return todos.filter(todo => !todo.completed && !todo.archived).length;
  };

  const toggleTodo = async (todoId) => {
    const todoToUpdate = todos.find(todo => todo.id === todoId);
    if (!todoToUpdate) return;

    try {
      const todoRef = doc(db, 'todos', todoId);
      
      // First update Firebase
      await updateDoc(todoRef, {
        completed: true,
        completedAt: new Date().getTime()
      });

      // Then update local state
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      setAllTodos(prevAll => prevAll.map(todo =>
        todo.id === todoId ? { ...todo, completed: true, completedAt: new Date().getTime() } : todo
      ));
      
      // Increment completed counter
      setCompletedTasksCount(prev => prev + 1);

    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const handlePageChange = (page) => {
    console.log('Changing page to:', page);
    setCurrentPage(page);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Updated Sidebar */}
      <SideNav
        variant="permanent"
        sx={{
          width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            backgroundColor: '#1E1E1E',
            color: 'white',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)'
          },
        }}
      >
        {/* App Title/Logo with Toggle */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          minHeight: '64px',
        }}>
          {sidebarOpen ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TodoIcon sx={{ color: '#4CAF50' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Task Manager
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setSidebarOpen(false)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </>
          ) : (
            <Tooltip title="Expand Sidebar" placement="right">
              <IconButton 
                onClick={() => setSidebarOpen(true)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <MenuOpenIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Updated Navigation Links */}
        <NavList>
          {[
            { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => handlePageChange('dashboard' ) },
            { text: 'Tasks', icon: <TodoIcon />, onClick: () => handlePageChange('todos' ) },
            { text: 'Automations', icon: <AutomationIcon />, onClick: () => handlePageChange('automations' ) },
            { text: 'Profile', icon: <ProfileIcon />, page: 'profile' },
            { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
          ].map((item) => (
            <NavItem key={item.page} disablePadding>
              <Tooltip 
                title={!sidebarOpen ? item.text : ''} 
                placement="right"
                disableHoverListener={sidebarOpen}
              >
                <ListItemButton
                  selected={currentPage === item.page}
                  onClick={item.onClick}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarOpen ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <NavItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 2 : 'auto',
                      justifyContent: 'center',
                      color: currentPage === item.page ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {item.icon}
                  </NavItemIcon>
                  <NavItemText 
                    primary={item.text}
                    sx={{
                      opacity: sidebarOpen ? 1 : 0,
                      '& .MuiListItemText-primary': {
                        color: currentPage === item.page ? '#4CAF50' : 'white',
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </NavItem>
          ))}
        </NavList>
      </SideNav>

      {/* Updated Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        marginLeft: `${sidebarOpen ? 0 : -175}px`,
      }}>
        {console.log('Current Page:', currentPage)}

        {currentPage === 'dashboard' && (
          <Grid container spacing={3}>
            {console.log('Dashboard todos:', todos)} {/* Debug log */}
            {/* Active Tasks Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: '#1E1E1E', 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                height: '100%'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 3
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.2)', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    <TaskIcon sx={{ color: '#4CAF50', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    {getActiveTasks()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Active Tasks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Completed Tasks Widget - Replace Weekly Progress Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: '#1E1E1E', 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                height: '100%'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 3
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(33, 150, 243, 0.2)', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    <CheckCircleIcon sx={{ color: '#2196f3', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    {completedTasksCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Completed Tasks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Placeholder: Monthly Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: '#1E1E1E', 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                height: '100%'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 3
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 152, 0, 0.2)', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    <AssessmentIcon sx={{ color: '#ff9800', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    87%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={87}
                    sx={{ 
                      width: '80%', 
                      mb: 2,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#ff9800',
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Monthly Completion Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Placeholder: Time Tracking */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: '#1E1E1E', 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                height: '100%'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 3
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(233, 30, 99, 0.2)', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    <ScheduleIcon sx={{ color: '#e91e63', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    24.5h
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Time Spent This Week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(156, 39, 176, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <SpeedIcon sx={{ color: '#9c27b0', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>98%</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Performance Score</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Growth Rate Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(0, 150, 136, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <TimelineIcon sx={{ color: '#009688', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>+15%</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Monthly Growth</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Distribution Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(121, 85, 72, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <PieChartIcon sx={{ color: '#795548', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>65/35</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Task Distribution</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Analytics Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(63, 81, 181, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <BarChartIcon sx={{ color: '#3f51b5', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>1.2K</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Weekly Analytics</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Issues Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <BugReportIcon sx={{ color: '#f44336', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>3</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Open Issues</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Cloud Usage Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(0, 188, 212, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <CloudIcon sx={{ color: '#00bcd4', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>82%</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cloud Usage</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* System Load Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 87, 34, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <MemoryIcon sx={{ color: '#ff5722', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>45%</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>System Load</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Storage Widget */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#1E1E1E', color: 'white', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(96, 125, 139, 0.2)', mb: 2, width: 56, height: 56 }}>
                    <StorageIcon sx={{ color: '#607d8b', fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>756GB</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Storage Used</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Tasks Gallery Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TaskIcon sx={{ color: '#4CAF50' }} />
                  Active Tasks Gallery
                </Typography>
                
                <Grid container spacing={2}>
                  {todos
                    .filter(todo => todo.isActive !== false)
                    .map(todo => (
                      <Grid item xs={12} sm={6} md={4} key={todo.id}>
                        <Paper
                          onClick={() => {
                            console.log('Dashboard task clicked:', todo); // Debug log
                            setSelectedTodo(todo);
                            setNoteInput(todo.notes || '');
                            setDrawerOpen(true);
                          }}
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'transparent',
                                  border: '2px solid #4CAF50',
                                  color: '#4CAF50',
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {todo.text[0].toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    color: 'white',
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                >
                                  {todo.text}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  Created {new Date(todo.timestamp).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>

                            {(todo.phone || todo.email || todo.notes) && (
                              <Stack 
                                direction="row" 
                                spacing={1} 
                                sx={{ 
                                  mt: 1,
                                  flexWrap: 'wrap',
                                  gap: 0.5
                                }}
                              >
                                {todo.phone && (
                                  <Chip
                                    icon={<PhoneIcon sx={{ fontSize: '16px' }} />}
                                    label="Has Phone"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                                      color: '#4CAF50',
                                      '& .MuiChip-icon': {
                                        color: '#4CAF50'
                                      }
                                    }}
                                  />
                                )}
                                {todo.email && (
                                  <Chip
                                    icon={<EmailIcon sx={{ fontSize: '16px' }} />}
                                    label="Has Email"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(33, 150, 243, 0.2)',
                                      color: '#2196f3',
                                      '& .MuiChip-icon': {
                                        color: '#2196f3'
                                      }
                                    }}
                                  />
                                )}
                                {todo.notes && (
                                  <Chip
                                    icon={<NotesIcon sx={{ fontSize: '16px' }} />}
                                    label="Has Notes"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(255, 152, 0, 0.2)',
                                      color: '#ff9800',
                                      '& .MuiChip-icon': {
                                        color: '#ff9800'
                                      }
                                    }}
                                  />
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}
        {currentPage === 'todos' && (
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

            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mb: 2,
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
                placeholder="Add a new todo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button 
                type="submit" 
                disabled={loading}
                sx={{ 
                  color: 'white',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Add
              </Button>
            </Paper>

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

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ 
                color: 'white', 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TaskIcon sx={{ color: '#4CAF50' }} />
                Active Tasks Gallery
              </Typography>
              
              <Grid container spacing={2}>
                {displayedTodos
                  .filter(todo => todo.isActive !== false) // Show tasks that are active or where isActive is not set
                  .map(todo => (
                    <Grid item xs={12} sm={6} md={4} key={todo.id}>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => {
                          setSelectedTodo(todo);
                          setNoteInput(todo.notes || '');
                          setDrawerOpen(true);
                        }}
                      >
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'transparent',
                                border: '2px solid #4CAF50',
                                color: '#4CAF50',
                                width: 40,
                                height: 40
                              }}
                            >
                              {todo.text[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'white',
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}
                              >
                                {todo.text}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Created {new Date(todo.timestamp).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          {(todo.phone || todo.email || todo.notes) && (
                            <Stack 
                              direction="row" 
                              spacing={1} 
                              sx={{ 
                                mt: 1,
                                flexWrap: 'wrap',
                                gap: 0.5
                              }}
                            >
                              {todo.phone && (
                                <Chip
                                  icon={<PhoneIcon sx={{ fontSize: '16px' }} />}
                                  label="Has Phone"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                                    color: '#4CAF50',
                                    '& .MuiChip-icon': {
                                      color: '#4CAF50'
                                    }
                                  }}
                                />
                              )}
                              {todo.email && (
                                <Chip
                                  icon={<EmailIcon sx={{ fontSize: '16px' }} />}
                                  label="Has Email"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(33, 150, 243, 0.2)',
                                    color: '#2196f3',
                                    '& .MuiChip-icon': {
                                      color: '#2196f3'
                                    }
                                  }}
                                />
                              )}
                              {todo.notes && (
                                <Chip
                                  icon={<NotesIcon sx={{ fontSize: '16px' }} />}
                                  label="Has Notes"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                                    color: '#ff9800',
                                    '& .MuiChip-icon': {
                                      color: '#ff9800'
                                    }
                                  }}
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Box>

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedTodo(null);
              }}
              PaperProps={{
                sx: {
                  width: '450px',
                  backgroundColor: '#1E1E1E', // Darker background
                  color: 'white',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              {selectedTodo && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Enhanced Header with Progress */}
                  <Fade in timeout={500}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'linear-gradient(45deg, #2C2C2C 0%, #1E1E1E 100%)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)'
                        }}
                      />
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'transparent',
                            width: 60,
                            height: 60,
                            fontSize: '24px',
                            border: '2px solid #4CAF50',
                            background: alpha('#4CAF50', 0.2),
                            color: '#4CAF50'
                          }}
                        >
                          {selectedTodo.text[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 600,
                            letterSpacing: '-0.5px',
                            mb: 0.5
                          }}>
                            {selectedTodo.text}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem'
                            }}>
                              {new Date(selectedTodo.timestamp).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedTodo.isActive ?? true}
                            onChange={(e) => handleActiveToggle(selectedTodo.id, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#4CAF50',
                                '&:hover': {
                                  backgroundColor: alpha('#4CAF50', 0.08),
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#4CAF50',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {selectedTodo.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        }
                        sx={{ mb: 2 }}
                      />

                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={selectedTodo.isActive ? "Active" : "Inactive"}
                          color={selectedTodo.isActive ? "success" : "default"}
                          size="small"
                          sx={{
                            borderRadius: '6px',
                            '& .MuiChip-label': {
                              fontWeight: 500,
                              color: 'white'
                            }
                          }}
                        />
                        <Chip 
                          label={selectedTodo.completed ? "Completed" : "In Progress"}
                          color={selectedTodo.completed ? "primary" : "warning"}
                          size="small"
                          sx={{
                            borderRadius: '6px',
                            '& .MuiChip-label': {
                              fontWeight: 500,
                              color: 'white'
                            }
                          }}
                        />
                      </Stack>

                      {/* Add Progress Section */}
                      <ProgressWrapper sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={40}
                            sx={{
                              color: '#4CAF50',
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Overall Progress
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                mt: 1,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  backgroundColor: '#4CAF50',
                                },
                              }}
                            />
                          </Box>
                        </Stack>
                      </ProgressWrapper>
                    </Box>
                  </Fade>

                  {/* Content with Animations */}
                  <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Fade in timeout={700}>
                      <Box sx={{ p: 3 }}>
                        {/* Contact Section */}
                        <Box sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            mb: 3,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.9)'
                          }}>
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
                                    <PhoneIcon sx={{ color: '#4CAF50' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: alpha('#FFFFFF', 0.03),
                                  borderRadius: '8px',
                                  '&:hover': {
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                  },
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiInputBase-input': {
                                  color: 'white',
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
                                    <EmailIcon sx={{ color: '#4CAF50' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: alpha('#FFFFFF', 0.03),
                                  borderRadius: '8px',
                                  '&:hover': {
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                  },
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiInputBase-input': {
                                  color: 'white',
                                }
                              }}
                            />
                          </Stack>

                          {/* Notes Section */}
                          <Typography variant="h6" sx={{ 
                            mb: 3,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'rgba(255, 255, 255, 0.9)'
                          }}>
                            <NotesIcon sx={{ color: '#4CAF50' }} />
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
                                backgroundColor: alpha('#FFFFFF', 0.03),
                                borderRadius: '8px',
                                '&:hover': {
                                  backgroundColor: alpha('#FFFFFF', 0.05),
                                },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: 'white',
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Fade>
                  </Box>

                  {/* Speed Dial for Quick Actions */}
                  <SpeedDial
                    ariaLabel="Task actions"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                    }}
                    icon={<SpeedDialIcon />}
                    onClose={() => setShowSpeedDial(false)}
                    onOpen={() => setShowSpeedDial(true)}
                    open={showSpeedDial}
                  >
                    {actions.map((action) => (
                      <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => {
                          // Handle action click
                          setShowSpeedDial(false);
                        }}
                      />
                    ))}
                  </SpeedDial>
                </Box>
              )}
            </Drawer>
          </Container>
        )}
        {currentPage === 'automations' && (
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4 
            }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                Automations
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#45a049' }
                }}
              >
                Create New Automation
              </Button>
            </Box>

            {/* Automation Cards */}
            <Grid container spacing={3}>
              {automationsList.map((automation) => (
                <Grid item xs={12} key={automation.id}>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: '#1E1E1E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      '&:hover': {
                        bgcolor: '#2A2A2A'
                      }
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: automation.status === 'running' 
                                ? 'rgba(76, 175, 80, 0.2)' 
                                : 'rgba(158, 158, 158, 0.2)',
                              color: automation.status === 'running' ? '#4CAF50' : '#9E9E9E'
                            }}
                          >
                            {automation.status === 'running' ? <RunningIcon /> : <StoppedIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>
                              {automation.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {automation.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack 
                          direction="row" 
                          spacing={3} 
                          alignItems="center" 
                          justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        >
                          <Chip 
                            icon={<FolderIcon />} 
                            label={automation.folder}
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Last Run
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {new Date(automation.lastRun).toLocaleString()}
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Add Snackbar component at the end of the return statement, before the closing Box tag */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default App
