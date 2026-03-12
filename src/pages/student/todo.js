import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  useToast,
  Text,
  Card,
  CardBody,
  Flex,
  Icon,
  Badge,
  useColorModeValue,
  Checkbox,
  IconButton,
  Textarea,
  Grid,
  GridItem,
  keyframes,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaFilter,
  FaSort,
  FaRocket,
  FaArrowLeft,
  FaTasks,
  FaCheckCircle,
  FaEllipsisV,
  FaList,
  FaEye,
  FaChartLine,
  FaFire,
  FaTrophy,
  FaBrain,
  FaLightbulb,
  FaUserTie,
  FaCalendarDay,
  FaRegLaughBeam,
  FaRegSadTear,
  FaMagic,
  FaStar,
  FaBolt,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0,-8px,0); }
  70% { transform: translate3d(0,-4px,0); }
  90% { transform: translate3d(0,-2px,0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Motion component for animations
const MotionBox = motion(Box);

export default function InternshipTodoList() {
  const router = useRouter();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingTask, setEditingTask] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");

  // Color values matching the deliverables theme
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const primaryColor = useColorModeValue("blue.500", "blue.300");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // Get current user ID for unique todo list
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.userId) {
          setUserId(parsedUser.userId);
        }
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }
  }, []);

  // Load tasks from localStorage with minimum 2-second loading
  useEffect(() => {
    const loadTasks = async () => {
      // Start timing
      const startTime = Date.now();
      
      // Load tasks from localStorage using user-specific key
      const taskKey = userId ? `internship-tasks-${userId}` : 'internship-tasks';
      const savedTasks = localStorage.getItem(taskKey);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      
      // Calculate remaining time to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
      
      // Wait for remaining time before hiding loader
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setIsLoading(false);
    };

    loadTasks();
  }, [userId]);

  // Save tasks to localStorage with user-specific key
  useEffect(() => {
    const taskKey = userId ? `internship-tasks-${userId}` : 'internship-tasks';
    localStorage.setItem(taskKey, JSON.stringify(tasks));
  }, [tasks, userId]);

  // Simple toast notifications
  const showToast = (title, status = "info", description = "") => {
    toast({
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const addTask = () => {
    if (newTask.trim() === "") {
      showToast("Task title is required", "warning");
      return;
    }

    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      description: newTaskDescription.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null,
      priority: priority,
    };

    setTasks([task, ...tasks]);
    setNewTask("");
    setNewTaskDescription("");
    setDueDate("");
    setPriority("medium");
    onClose();

    showToast("Task added successfully", "success");
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const task = tasks.find(t => t.id === id);
    if (!task.completed) {
      showToast("Task completed!", "success");
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    showToast("Task deleted", "info");
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task.title);
    setNewTaskDescription(task.description || "");
    setDueDate(task.dueDate || "");
    setPriority(task.priority);
    onOpen();
  };

  const updateTask = () => {
    if (newTask.trim() === "") {
      showToast("Task title can't be empty", "warning");
      return;
    }

    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { 
            ...task, 
            title: newTask.trim(),
            description: newTaskDescription.trim(),
            dueDate: dueDate,
            priority: priority
          } 
        : task
    ));

    setNewTask("");
    setNewTaskDescription("");
    setDueDate("");
    setPriority("medium");
    setEditingTask(null);
    onClose();

    showToast("Task updated successfully", "success");
  };

  const clearCompleted = () => {
    const completedCount = tasks.filter(task => task.completed).length;
    setTasks(tasks.filter(task => !task.completed));
    
    if (completedCount > 0) {
      showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, "success");
    } else {
      showToast("No completed tasks to clear", "info");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "green";
      default: return "gray";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return FaExclamationTriangle;
      case "medium": return FaClock;
      case "low": return FaCheck;
      default: return FaClock;
    }
  };

  const getMotivationalMessage = () => {
    const completionRate = taskStats.completionRate;
    if (completionRate === 100) return { message: "Perfect! You've completed all tasks!", icon: "🏆" };
    if (completionRate >= 80) return { message: "Amazing progress! Almost there!", icon: "🔥" };
    if (completionRate >= 50) return { message: "Great work! Keep going!", icon: "💪" };
    if (completionRate >= 25) return { message: "Good start! You're making progress!", icon: "🚀" };
    return { message: "Let's get started! Add your first task.", icon: "🌟" };
  };

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Calculate stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    highPriority: tasks.filter(task => task.priority === 'high' && !task.completed).length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0,
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    // Default sort by creation date
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const motivational = getMotivationalMessage();

  // Loading state
  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaList} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="pink.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading your tasks...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="blue.50"
        opacity="0.3"
        zIndex="0"
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-80px"
        left="-80px"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="purple.50"
        opacity="0.3"
        zIndex="0"
        animation={`${float} 7s ease-in-out infinite`}
      />

      <Box position="relative" zIndex="1" p={6}>
        <Box maxW="7xl" mx="auto">
          {/* Header section */}
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => router.push("/student/dashboard")}
              leftIcon={<FaArrowLeft />}
              fontFamily="'Segoe UI', sans-serif"
              borderRadius="lg"
              borderWidth="2px"
              _hover={{
                bg: "blue.50",
                boxShadow: "md"
              }}
              transition="all 0.3s"
            >
              Back to Dashboard
            </Button>

            <Button
              colorScheme="blue"
              onClick={onOpen}
              leftIcon={<FaPlus />}
              fontFamily="'Segoe UI', sans-serif"
              borderRadius="lg"
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, purple.600)",
                boxShadow: "xl",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s"
              animation={`${pulse} 3s infinite`}
            >
              Add New Task
            </Button>
          </Flex>

          {/* Main content area */}
          <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
            {/* Sidebar - Stats */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Motivational Card */}
                <Card
                  bgGradient="linear(to-br, blue.500, purple.600)"
                  color="white"
                  borderRadius="2xl"
                  boxShadow="xl"
                  position="relative"
                  overflow="hidden"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="white"
                        bgOpacity="0.2"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="60px"
                        height="60px"
                      >
                        <Text fontSize="2xl">{motivational.icon}</Text>
                      </Box>
                      <Text fontWeight="bold" fontSize="lg" color="white">
                        {motivational.message}
                      </Text>
                      <Progress 
                        value={taskStats.completionRate} 
                        colorScheme="white" 
                        size="sm" 
                        borderRadius="full"
                        bg="whiteAlpha.300"
                        width="100%"
                      />
                      <Text fontSize="sm" opacity="0.9" color="white">
                        {taskStats.completionRate}% Complete
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Quick Stats */}
                <Card bg={cardBg} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.700" fontFamily="'Segoe UI', sans-serif">
                        Task Statistics
                      </Heading>
                      
                      <Stat>
                        <StatLabel>Total Tasks</StatLabel>
                        <StatNumber>{taskStats.total}</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {taskStats.completed} completed
                        </StatHelpText>
                      </Stat>

                      <Stat>
                        <StatLabel>Pending Tasks</StatLabel>
                        <StatNumber color="orange.500">{taskStats.pending}</StatNumber>
                        <StatHelpText>
                          {taskStats.highPriority} high priority
                        </StatHelpText>
                      </Stat>

                      <Stat>
                        <StatLabel>Completion Rate</StatLabel>
                        <StatNumber color="green.500">{taskStats.completionRate}%</StatNumber>
                        <StatHelpText>Overall progress</StatHelpText>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Quick Actions */}
                <Card bg={cardBg} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm" color="gray.700" fontFamily="'Segoe UI', sans-serif">Quick Actions</Heading>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => setFilter("active")}
                        leftIcon={<FaClock />}
                        fontFamily="'Segoe UI', sans-serif"
                      >
                        Show Pending
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        onClick={() => setFilter("completed")}
                        leftIcon={<FaCheckCircle />}
                        fontFamily="'Segoe UI', sans-serif"
                      >
                        Show Completed
                      </Button>
                      {taskStats.completed > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={clearCompleted}
                          leftIcon={<FaTrash />}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Clear Completed
                        </Button>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>

            {/* Main Content - Task List */}
            <GridItem>
              <Card
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "6px",
                  bgGradient: "linear(to-r, blue.400, purple.400)",
                  backgroundSize: "200% 200%",
                  animation: `${gradient} 3s ease infinite`,
                }}
              >
                <CardBody p={8}>
                  {/* Header */}
                  <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                      <Heading
                        size="xl"
                        color="gray.800"
                        mb={2}
                        fontFamily="'Segoe UI', sans-serif"
                        bgGradient="linear(to-r, blue.600, purple.600)"
                        bgClip="text"
                      >
                        My Internship Tasks
                      </Heading>
                      <Text color="gray.600" fontFamily="'Segoe UI', sans-serif">
                        Manage your tasks and track progress
                      </Text>
                    </Box>
                    <Box
                      fontSize="4xl"
                      animation={`${float} 4s ease-in-out infinite`}
                    >
                      📋
                    </Box>
                  </Flex>

                  {/* Controls */}
                  <HStack justify="space-between" mb={8} flexWrap="wrap" gap={4}>
                    <HStack spacing={4} flexWrap="wrap">
                      <Menu>
                        <MenuButton 
                          as={Button} 
                          rightIcon={<FaFilter />} 
                          variant="outline" 
                          size="sm"
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Filter: {filter === "all" ? "All" : filter === "active" ? "Active" : "Completed"}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => setFilter("all")} fontFamily="'Segoe UI', sans-serif">All Tasks</MenuItem>
                          <MenuItem onClick={() => setFilter("active")} fontFamily="'Segoe UI', sans-serif">Active</MenuItem>
                          <MenuItem onClick={() => setFilter("completed")} fontFamily="'Segoe UI', sans-serif">Completed</MenuItem>
                        </MenuList>
                      </Menu>

                      <Menu>
                        <MenuButton 
                          as={Button} 
                          rightIcon={<FaSort />} 
                          variant="outline" 
                          size="sm"
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Sort: {sortBy === "date" ? "Date" : sortBy === "priority" ? "Priority" : sortBy === "title" ? "Title" : "Due Date"}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => setSortBy("date")} fontFamily="'Segoe UI', sans-serif">Creation Date</MenuItem>
                          <MenuItem onClick={() => setSortBy("dueDate")} fontFamily="'Segoe UI', sans-serif">Due Date</MenuItem>
                          <MenuItem onClick={() => setSortBy("priority")} fontFamily="'Segoe UI', sans-serif">Priority</MenuItem>
                          <MenuItem onClick={() => setSortBy("title")} fontFamily="'Segoe UI', sans-serif">Title</MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>

                    <Badge 
                      colorScheme="blue" 
                      fontSize="md" 
                      px={4} 
                      py={2} 
                      borderRadius="full"
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      {sortedTasks.length} tasks
                    </Badge>
                  </HStack>

                  {/* Task List */}
                  <VStack spacing={4} align="stretch" maxH="60vh" overflowY="auto" p={2}>
                    {sortedTasks.length === 0 ? (
                      <Center py={10} flexDirection="column">
                        <Box fontSize="6xl" mb={4}>📝</Box>
                        <Text fontSize="lg" color="gray.500" textAlign="center" mb={2} fontFamily="'Segoe UI', sans-serif">
                          {filter === "completed" 
                            ? "No completed tasks yet" 
                            : filter === "active" 
                            ? "No active tasks - great job!" 
                            : "No tasks yet. Add your first task to get started!"}
                        </Text>
                        <Button 
                          colorScheme="blue" 
                          variant="outline" 
                          onClick={onOpen}
                          leftIcon={<FaPlus />}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Create Your First Task
                        </Button>
                      </Center>
                    ) : (
                      sortedTasks.map(task => (
                        <MotionBox
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            bg={task.completed ? "green.50" : isTaskOverdue(task) ? "red.50" : "white"}
                            border="2px solid"
                            borderColor={task.completed ? "green.200" : isTaskOverdue(task) ? "red.200" : "gray.100"}
                            borderRadius="xl"
                            boxShadow="sm"
                            transition="all 0.3s"
                            _hover={{
                              boxShadow: "lg",
                              borderColor: task.completed ? "green.300" : isTaskOverdue(task) ? "red.300" : "blue.200",
                              transform: "translateY(-2px)",
                            }}
                          >
                            <CardBody py={4}>
                              <Flex align="center" justify="space-between">
                                <HStack align="center" spacing={4} flex="1">
                                  <Box position="relative">
                                    <Checkbox
                                      size="lg"
                                      colorScheme="green"
                                      isChecked={task.completed}
                                      onChange={() => toggleTask(task.id)}
                                    />
                                  </Box>
                                  <Box flex="1">
                                    <Text
                                      fontSize="lg"
                                      fontWeight="semibold"
                                      color={task.completed ? "gray.500" : "gray.800"}
                                      textDecoration={task.completed ? "line-through" : "none"}
                                      mb={1}
                                      fontFamily="'Segoe UI', sans-serif"
                                    >
                                      {task.title}
                                    </Text>
                                    {task.description && (
                                      <Text
                                        fontSize="sm"
                                        color={task.completed ? "gray.400" : "gray.600"}
                                        noOfLines={1}
                                        mb={2}
                                        fontFamily="'Segoe UI', sans-serif"
                                      >
                                        {task.description}
                                      </Text>
                                    )}
                                    <HStack spacing={3}>
                                      <Badge
                                        colorScheme={getPriorityColor(task.priority)}
                                        fontSize="xs"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontFamily="'Segoe UI', sans-serif"
                                      >
                                        <HStack spacing={1}>
                                          <Icon as={getPriorityIcon(task.priority)} boxSize={2} />
                                          <Text textTransform="capitalize">{task.priority}</Text>
                                        </HStack>
                                      </Badge>
                                      {task.dueDate && (
                                        <Badge
                                          colorScheme={isTaskOverdue(task) ? "red" : "blue"}
                                          fontSize="xs"
                                          borderRadius="full"
                                          px={2}
                                          py={1}
                                        >
                                          <HStack spacing={1}>
                                            <Icon as={FaCalendarDay} boxSize={2} />
                                            <Text>
                                              {new Date(task.dueDate).toLocaleDateString()}
                                              {isTaskOverdue(task) && " ⚠️"}
                                            </Text>
                                          </HStack>
                                        </Badge>
                                      )}
                                      <Text fontSize="xs" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                        Created: {new Date(task.createdAt).toLocaleDateString()}
                                      </Text>
                                    </HStack>
                                  </Box>
                                </HStack>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="Edit task"
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => startEditTask(task)}
                                  />
                                  <IconButton
                                    aria-label="Delete task"
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => deleteTask(task.id)}
                                  />
                                </HStack>
                              </Flex>
                            </CardBody>
                          </Card>
                        </MotionBox>
                      ))
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" fontFamily="'Segoe UI', sans-serif">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            <Heading fontSize="xl" fontFamily="'Segoe UI', sans-serif">
              {editingTask ? "Edit Task" : "Add New Task"}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Task Title *</FormLabel>
                <Input
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  focusBorderColor="blue.500"
                  fontFamily="'Segoe UI', sans-serif"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Description (Optional)</FormLabel>
                <Textarea
                  placeholder="Add details, notes, or context for this task..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  rows={3}
                  focusBorderColor="blue.500"
                  fontFamily="'Segoe UI', sans-serif"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Due Date (Optional)</FormLabel>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  focusBorderColor="blue.500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Priority Level</FormLabel>
                <HStack spacing={3}>
                  {["low", "medium", "high"].map((level) => (
                    <Button
                      key={level}
                      variant={priority === level ? "solid" : "outline"}
                      colorScheme={getPriorityColor(level)}
                      onClick={() => setPriority(level)}
                      size="md"
                      borderRadius="lg"
                      leftIcon={<Icon as={getPriorityIcon(level)} />}
                      flex="1"
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onClose} fontFamily="'Segoe UI', sans-serif">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={editingTask ? updateTask : addTask}
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, purple.600)",
              }}
              size="lg"
              fontFamily="'Segoe UI', sans-serif"
              isDisabled={!newTask.trim()}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}