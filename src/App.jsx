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
  ToggleButton,
  ToggleButtonGroup,
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
  AllInbox as AllInboxIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
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
import Confetti from 'react-confetti';
import MailIcon from '@mui/icons-material/Mail';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState('all');

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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Simulate AI response
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
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
        timestamp: new Date(),
        isAI: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Detailed error:', error); // Add detailed error logging
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${error.message}`,
        timestamp: new Date(),
        isAI: true
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleNotificationClick = () => {
    console.log('Notification clicked'); // Debug log
    setNotificationCount(0);
    setShowConfetti(true);
    console.log('Confetti state set to true'); // Debug log
    setTimeout(() => {
      setShowConfetti(false);
      console.log('Confetti state set to false'); // Debug log
    }, 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={10}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}
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
              background: 'linear-gradient(rgb(82 82 82 / 15%), rgb(0 0 0 / 15%))',
              color: theme.palette.text.primary,
              borderRight: `1px solid ${theme.palette.divider}`
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
              { text: 'Emails', icon: <MailIcon />, onClick: () => handlePageChange('emails' ) },
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
          <Box sx={{ 
            mt: 'auto', // Push to bottom
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            pt: 2 
          }}>
            <Tooltip 
              title={!sidebarOpen ? 'Toggle theme' : ''} 
              placement="right"
              disableHoverListener={sidebarOpen}
            >
              <ListItemButton
                onClick={toggleColorMode}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
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
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </NavItemIcon>
                <NavItemText 
                  primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
                  sx={{
                    opacity: sidebarOpen ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      color: 'white',
                    },
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </Box>
        </SideNav>

        {/* Add Header/AppBar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED}px)`,
            ml: `${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED}px`,
            background: '#1E1E1E linear-gradient(rgb(82 82 82 / 15%), rgb(0 0 0 / 15%))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'none'
          }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <IconButton 
              color="inherit"
              onClick={handleNotificationClick}  // Make sure this is here
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Add margin top to main content to account for header */}
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3,
          bgcolor: theme.palette.background.default,
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1)',
          marginLeft: `${sidebarOpen ? 0 : -175}px`,
          mt: '64px', // Add this line for header spacing
        }}>
          {console.log('Current Page:', currentPage)}

          {currentPage === 'dashboard' && (
            <Box sx={{ p: 3 }}>
              {/* Add Dashboard Header */}
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'white',
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <DashboardIcon sx={{ color: '#4CAF50' }} />
                Dashboard
              </Typography>

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
            </Box>
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
                    .filter(todo => todo.isActive !== false)
                    .map((todo, index) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        key={todo.id} 
                        sx={{ 
                          mt: { 
                            xs: index >= 1 ? 5 : 0,  // On mobile, apply after first item
                            sm: index >= 2 ? 5 : 0,  // On tablet, apply after second item
                            md: index >= 3 ? 5 : 0   // On desktop, apply after third item
                          }
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
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
                          <Stack spacing={2} sx={{ height: '100%' }}> {/* Make stack take full height */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'transparent',
                                  border: '2px solid #4CAF50',
                                  color: '#4CAF50',
                                  width: 40,
                                  height: 40,
                                  flexShrink: 0 // Prevent avatar from shrinking
                                }}
                              >
                                {todo.text[0].toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}> {/* Add minWidth to enable text truncation */}
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    color: 'white',
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.3,
                                    mb: 0.5
                                  }}
                                >
                                  {todo.text}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    display: 'block'
                                  }}
                                >
                                  Created {new Date(todo.timestamp).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Push chips to bottom using margin-top: auto */}
                            <Box sx={{ mt: 'auto', pt: 2 }}> {/* Added pt: 2 for top padding */}
                              {(todo.phone || todo.email || todo.notes) && (
                                <Stack 
                                  direction="row" 
                                  spacing={1} 
                                  sx={{ 
                                    flexWrap: 'wrap',
                                    gap: 1, // Increased gap between chips
                                    '& .MuiChip-root': {
                                      mb: 1, // Add bottom margin to each chip
                                      mr: 1 // Add right margin to each chip
                                    }
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
                            </Box>
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
                    background: '#1E1E1E linear-gradient(rgb(82 82 82 / 15%), rgb(0 0 0 / 15%))',
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
          {currentPage === 'emails' && (
            <Box sx={{ p: 3 }}>
              {/* Header and Filter Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4 
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <MailIcon sx={{ color: '#4CAF50' }} />
                  Emails
                </Typography>

                {/* Filter Controls */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ToggleButtonGroup
                    value={emailFilter}
                    exclusive
                    onChange={(e, newFilter) => {
                      if (newFilter !== null) {
                        setEmailFilter(newFilter);
                      }
                    }}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiToggleButton-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(76, 175, 80, 0.2)',
                          color: '#4CAF50',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.25)',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="all">
                      <Tooltip title="All Emails">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AllInboxIcon />
                          <Typography>All</Typography>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="high">
                      <Tooltip title="High Priority">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PriorityHighIcon />
                          <Typography>Priority</Typography>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="unread">
                      <Tooltip title="Unread">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MarkEmailUnreadIcon />
                          <Typography>Unread</Typography>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {/* Email List */}
              <Grid container spacing={3}>
                {[
                  {
                    id: 1,
                    subject: "Project Update: Q1 Goals",
                    sender: "john.doe@company.com",
                    preview: "Hi team, I wanted to share our progress on Q1 objectives. We've made significant strides in our key initiatives and I'm pleased to report that we're tracking well against our targets. Here's a detailed breakdown of our achievements and areas that need attention...",
                    timestamp: "2024-03-15T10:30:00",
                    unread: true,
                    attachments: 2,
                    priority: "high",
                    body: `Dear Team,

I wanted to share our progress on Q1 objectives. We've made significant strides in our key initiatives and I'm pleased to report that we're tracking well against our targets.

Key Achievements:
• Launched new product feature ahead of schedule
• Increased customer satisfaction score by 15%
• Reduced operational costs by 22%

Next Steps:
1. Review feedback from beta testing
2. Prepare presentation for stakeholders
3. Schedule team retrospective

Please review the attached documents for detailed metrics and upcoming milestones.

Best regards,
John`
                  },
                  {
                    id: 2,
                    subject: "Client Meeting Notes",
                    sender: "sarah.smith@company.com",
                    preview: "Following up on our discussion with the client yesterday. They were very impressed with our proposal and had some valuable feedback to share...",
                    timestamp: "2024-03-15T09:15:00",
                    unread: false,
                    attachments: 1,
                    priority: "medium",
                    body: `Hi everyone,

Following up on our discussion with the client yesterday. They were very impressed with our proposal and had some valuable feedback to share.

Key Points Discussed:
• Timeline expectations
• Budget considerations
• Technical requirements

Action Items:
1. Update project scope document
2. Schedule follow-up meeting
3. Prepare revised estimates

Let me know if you have any questions.

Best,
Sarah`
                  },
                  {
                    id: 3,
                    subject: "Weekly Team Sync",
                    sender: "team.lead@company.com",
                    preview: "Here's the agenda for our upcoming team sync meeting. We'll be discussing project milestones, resource allocation, and upcoming deadlines. Please come prepared with your updates.",
                    timestamp: "2024-03-14T16:45:00",
                    unread: true,
                    attachments: 0,
                    priority: "normal",
                    body: `Team,

Here's our agenda for tomorrow's sync:

1. Project Updates
   - Current sprint progress
   - Blockers and challenges
   - Success stories

2. Resource Planning
   - Upcoming project needs
   - Team capacity
   - Training requirements

3. Open Discussion
   - Team suggestions
   - Process improvements
   - Questions & concerns

Please review and come prepared with your updates.

Regards,
Team Lead`
                  }
                ]
                  .filter(email => {
                    switch (emailFilter) {
                      case 'high':
                        return email.priority === 'high';
                      case 'unread':
                        return email.unread;
                      default:
                        return true;
                    }
                  })
                  .map((email) => (
                    <Grid item xs={12} key={email.id}>
                      <Paper
                        onClick={() => {
                          setSelectedEmail(email);
                          setEmailDrawerOpen(true);
                        }}
                        sx={{
                          p: 2,
                          bgcolor: email.unread ? 'rgba(76, 175, 80, 0.1)' : '#1E1E1E',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          {/* Sender Avatar */}
                          <Grid item>
                            <Avatar sx={{ 
                              bgcolor: email.unread ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
                              color: email.unread ? 'white' : 'rgba(255, 255, 255, 0.7)'
                            }}>
                              {email.sender[0].toUpperCase()}
                            </Avatar>
                          </Grid>

                          {/* Email Content */}
                          <Grid item xs>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'white',
                                  fontWeight: email.unread ? 600 : 400
                                }}
                              >
                                {email.subject}
                              </Typography>
                              {email.priority === 'high' && (
                                <Chip 
                                  label="High Priority" 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(244, 67, 54, 0.2)',
                                    color: '#f44336',
                                    height: '20px'
                                  }}
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                mb: 0.5
                              }}
                            >
                              {email.sender}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.5)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {email.preview}
                            </Typography>
                          </Grid>

                          {/* Email Metadata */}
                          <Grid item>
                            <Stack spacing={1} alignItems="flex-end">
                              <Typography 
                                variant="caption" 
                                sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                              >
                                {new Date(email.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                              {email.attachments > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AttachFileIcon sx={{ 
                                    fontSize: '16px',
                                    color: 'rgba(255, 255, 255, 0.5)'
                                  }} />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                  >
                                    {email.attachments}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>

              {/* Email Drawer */}
              <Drawer
                anchor="right"
                open={emailDrawerOpen}
                onClose={() => {
                  setEmailDrawerOpen(false);
                  setSelectedEmail(null);
                }}
                PaperProps={{
                  sx: {
                    width: '500px',
                    background: '#1E1E1E',
                    color: 'white',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.12)'
                  }
                }}
              >
                {selectedEmail && (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Email Header */}
                    <Box sx={{ 
                      p: 3, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{selectedEmail.subject}</Typography>
                        <IconButton 
                          onClick={() => setEmailDrawerOpen(false)}
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#4CAF50' }}>
                          {selectedEmail.sender[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{selectedEmail.sender}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {new Date(selectedEmail.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>

                      {selectedEmail.priority === 'high' && (
                        <Chip 
                          label="High Priority"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.2)',
                            color: '#f44336'
                          }}
                        />
                      )}
                    </Box>

                    {/* Email Body */}
                    <Box sx={{ 
                      p: 3, 
                      flex: 1, 
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedEmail.body}
                      </Typography>
                    </Box>

                    {/* Email Actions */}
                    <Box sx={{ 
                      p: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      gap: 1
                    }}>
                      <Button
                        startIcon={<ReplyIcon />}
                        variant="contained"
                        sx={{ 
                          bgcolor: '#4CAF50',
                          '&:hover': { bgcolor: '#45a049' }
                        }}
                      >
                        Reply
                      </Button>
                      <Button
                        startIcon={<ForwardIcon />}
                        variant="outlined"
                        sx={{ 
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': { borderColor: 'white' }
                        }}
                      >
                        Forward
                      </Button>
                      {selectedEmail.attachments > 0 && (
                        <Button
                          startIcon={<AttachFileIcon />}
                          variant="outlined"
                          sx={{ 
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': { borderColor: 'white' }
                          }}
                        >
                          Attachments ({selectedEmail.attachments})
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Drawer>
            </Box>
          )}
        </Box>

        {/* Original Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Chat Bubble */}
        <Fab 
          color="primary"
          aria-label="chat"
          onClick={() => setChatOpen(true)}
          sx={{ 
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#388E3C'
            }
          }}
        >
          <ChatIcon />
        </Fab>

        {/* Chat Dialog */}
        <Dialog
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          PaperProps={{
            sx: {
              width: '400px',
              height: '500px',
              maxHeight: '80vh',
              position: 'fixed',
              bottom: 24,
              right: 24,
              m: 0,
              background: '#1E1E1E linear-gradient(rgb(82 82 82 / 15%), rgb(0 0 0 / 15%))',
              color: 'white',
              borderRadius: 2,
            }
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'transparent'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            Chat
            <IconButton 
              onClick={() => setChatOpen(false)}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowY: 'auto'
            }}
          >
            {/* Messages Container */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isAI ? 'flex-start' : 'flex-end',
                    mb: 1,
                  }}
                >
                  {message.isAI && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        bgcolor: '#4CAF50',
                        fontSize: '0.875rem'
                      }}
                    >
                      AI
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1,
                      px: 2,
                      maxWidth: '70%',
                      backgroundColor: message.isAI ? 'rgba(255, 255, 255, 0.1)' : '#4CAF50',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        opacity: 0.7 
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#4CAF50',
                      fontSize: '0.875rem'
                    }}
                  >
                    AI
                  </Avatar>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontStyle: 'italic'
                    }}
                  >
                    AI is typing...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              component="form"
              onSubmit={handleSendMessage}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <TextField
                fullWidth
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message AI..."
                variant="standard"
                sx={{
                  mx: 1,
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'transparent',
                  },
                  '& .MuiInput-underline:hover:before': {
                    borderBottomColor: 'transparent',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: 'transparent',
                  },
                }}
              />
              <IconButton 
                type="submit" 
                sx={{ 
                  p: '10px',
                  color: messageInput.trim() ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)',
                }}
                disabled={!messageInput.trim()}
              >
                <SendIcon />
              </IconButton>
            </Paper>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}

export default App
