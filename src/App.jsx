// Test auto-commit - this comment should be saved automatically
//works bru
import { useState, useEffect, useMemo, useRef } from 'react'
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
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ChatIcon from '@mui/icons-material/Chat';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import OpenAI from 'openai';

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

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

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
  const [mode, setMode] = useState('dark');
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
      isAI: true
    }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            // Dark mode colors
            background: {
              default: '#121212',
              paper: '#1E1E1E',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
          } : {
            // Light mode colors
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#2c2c2c',
              secondary: 'rgba(0, 0, 0, 0.7)',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
          }),
          primary: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#1E1E1E' 
                  : '#ffffff',
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.12)',
              }),
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#1E1E1E' 
                  : '#ffffff',
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.12)',
              }),
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: ({ theme }) => ({
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }),
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: ({ theme }) => ({
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(76, 175, 80, 0.15)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(76, 175, 80, 0.25)',
                  },
                },
              }),
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              }),
            },
          },
        },
      }),
    [mode],
  );

  // Add a console.log to debug
  console.log('Current theme mode:', mode);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      // Update notification and increment counter
      setNotification({
        open: true,
        message: `${updatedTodo.text} is now ${isActive ? 'active' : 'inactive'}`,
        severity: 'success'
      });
      setNotificationCount(prev => prev + 1); // Add this line
      
    } catch (error) {
      console.error("Error updating active status:", error);
      setNotification({
        open: true,
        message: 'Failed to update task status',
        severity: 'error'
      });
      setNotificationCount(prev => prev + 1); // Add this line for error notifications too
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

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
    setNotificationCount(prev => prev + 1);
  };

  // Replace the generateAIResponse function
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
<<<<<<< HEAD
      console.log('Sending request to OpenAI...'); // Add logging
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        // ... existing fetch configuration ...
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData); // Add detailed error logging
        throw new Error(`API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Received response:', data); // Add response logging

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const aiMessage = {
        id: Date.now(),
        text: data.choices[0].message.content,
=======
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant in a task management application. Help users organize and manage their tasks effectively."
          },
          { role: "user", content: userMessage }
        ],
        model: "gpt-3.5-turbo",
      });

      const aiMessage = {
        id: Date.now(),
        text: completion.choices[0].message.content,
>>>>>>> 7986aab122fc47fed15463a2c62be46ad75094c5
        timestamp: new Date(),
        isAI: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
<<<<<<< HEAD
      console.error('Detailed error:', error); // Add detailed error logging
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${error.message}`,
        timestamp: new Date(),
        isAI: true
      };
      setMessages(prev => [...prev, errorMessage]);
=======
      console.error('Error generating AI response:', error);
      // Show error message to user
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isAI: true
      }]);
>>>>>>> 7986aab122fc47fed15463a2c62be46ad75094c5
    } finally {
      setIsTyping(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (messageInput.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: messageInput,
      timestamp: new Date(),
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');

    // Generate AI response
    await generateAIResponse(userMessage.text);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <SideNav
          variant="permanent"
          sx={{
            width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
              boxSizing: 'border-box',
              background: 'linear-gradient(rgb(82 82 82 / 15%), rgb(0 0 0 / 15%))',
              color: theme.palette.text.primary,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {/* Sidebar content */}
        </SideNav>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Main content */}
        </Box>

        {/* Chat and other components */}
      </Box>
    </ThemeProvider>
  )
}

export default App
