import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Card,
  CardBody,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  Progress,
  Tag,
  Center,
  Select,
  Avatar,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  keyframes,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  SimpleGrid
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaPlayCircle,
  FaEye,
  FaPaperPlane,
  FaFileUpload,
  FaCalendarAlt,
  FaUserTie,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFilter,
  FaSort,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaRocket,
  FaCloudUploadAlt,
  FaFileAlt,
  FaDownload,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaHistory,
  FaGraduationCap,
  FaBook,
  FaLightbulb,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Animation keyframes
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

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Date formatting functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Invalid date';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper to format date for input fields (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

export default function MentorTasksDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    category: "",
    custom_category: "",
    estimated_hours: "",
    resources: "",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    category: "",
    custom_category: "",
    estimated_hours: "",
    resources: "",
    status: "pending"
  });

  // Modal states
  const { isOpen: isSubmitOpen, onOpen: onSubmitOpen, onClose: onSubmitClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const primaryColor = useColorModeValue("blue.500", "blue.300");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Enhanced toast notifications
  const showToast = useCallback(({ title, description, status, emoji, duration = 4000, isClosable = true }) => {
    const statusConfig = {
      success: {
        bg: "green.500",
        color: "white",
        icon: emoji || "🎉",
      },
      error: {
        bg: "red.500",
        color: "white",
        icon: emoji || "❌",
      },
      warning: {
        bg: "orange.500",
        color: "white",
        icon: emoji || "⚠️",
      },
      info: {
        bg: "blue.500",
        color: "white",
        icon: emoji || "💡",
      }
    };

    const config = statusConfig[status] || statusConfig.info;

    toast({
      position: "top-right",
      duration,
      isClosable,
      render: ({ onClose }) => (
        <Alert
          status={status}
          variant="solid"
          borderRadius="lg"
          boxShadow="xl"
          alignItems="flex-start"
          bg={config.bg}
          color={config.color}
          position="relative"
          pr={8}
        >
          <AlertIcon boxSize="20px" mr={3} fontSize="lg">
            {config.icon}
          </AlertIcon>
          <Box flex="1">
            <AlertTitle fontSize="md" fontWeight="bold" mb={1}>
              {title}
            </AlertTitle>
            <AlertDescription fontSize="sm">
              {description}
            </AlertDescription>
          </Box>
          
          {isClosable && (
            <Button
              position="absolute"
              top={2}
              right={2}
              size="xs"
              variant="ghost"
              onClick={onClose}
              color={config.color}
              _hover={{
                bg: "rgba(255, 255, 255, 0.2)",
              }}
              _active={{
                bg: "rgba(255, 255, 255, 0.3)",
              }}
              minW="auto"
              w="20px"
              h="20px"
              p={0}
              borderRadius="sm"
            >
              ×
            </Button>
          )}
        </Alert>
      )
    });
  }, [toast]);

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "green";
      default: return "gray";
    }
  };

  const getStatusColor = (task) => {
    const status = task.display_status || task.status;
    
    switch (status) {
      case "completed": return "green";
      case "reviewed": return "purple";
      case "submitted": return "blue";
      case "in-progress": return "orange";
      case "rejected": return "red";
      case "resubmitted": return "blue";
      case "pending": return "gray";
      default: return "gray";
    }
  };

  const getStatusIcon = (task) => {
    const status = task.display_status || task.status;
    
    switch (status) {
      case 'completed': return FaCheckCircle;
      case 'reviewed': return FaCheckCircle;
      case 'submitted': return FaPaperPlane;
      case 'in-progress': return FaPlayCircle;
      case 'rejected': return FaExclamationTriangle;
      case 'resubmitted': return FaPaperPlane;
      case 'pending': return FaClock;
      default: return FaTasks;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // FIXED: Get urgency badge for tasks - only for non-submitted tasks
  const getUrgencyBadge = (task) => {
    if (!task) return null;
    
    // Don't show urgency badge for completed/reviewed/submitted tasks
    const status = task.display_status || task.status;
    if (['completed', 'reviewed', 'submitted', 'resubmitted'].includes(status)) {
      return null;
    }
    
    const daysRemaining = getDaysRemaining(task.due_date);
    if (daysRemaining === null) return null;
    
    if (daysRemaining < 0) {
      return {
        color: 'red',
        text: 'Overdue!',
        icon: FaExclamationTriangle,
        animation: `${pulse} 1s infinite`
      };
    } else if (daysRemaining === 0) {
      return {
        color: 'orange',
        text: 'Due today!',
        icon: FaClock,
        animation: `${pulse} 2s infinite`
      };
    } else if (daysRemaining <= 2) {
      return {
        color: 'orange',
        text: `${daysRemaining} days left`,
        icon: FaClock,
      };
    } else if (daysRemaining <= 7) {
      return {
        color: 'yellow',
        text: `${daysRemaining} days left`,
        icon: FaClock,
      };
    }
    
    return null;
  };

  // Fetch student tasks with submissions
  const fetchStudentTasks = useCallback(async (studentId) => {
    try {
      const mentorId = localStorage.getItem("userId");
      const response = await fetch(
        `/api/mentor/tasks/student-with-submissions?studentId=${studentId}&mentorId=${mentorId}`
      );
      const data = await response.json();

      if (response.ok) {
        setStudentTasks(data.tasks || []);
      } else {
        console.warn("Could not fetch tasks:", data.message);
        setStudentTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setStudentTasks([]);
    }
  }, []);

  // Fetch students on component mount
  useEffect(() => {
    const minimumLoadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    const fetchStudents = async () => {
      const startTime = Date.now();

      try {
        const mentorId = localStorage.getItem("userId");
        
        if (!mentorId) {
          showToast({
            title: "Access Denied 🔐",
            description: "Please log in again.",
            status: "error",
            emoji: "🔐"
          });
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/mentor/student-details?mentorId=${mentorId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStudents(data.students);
          if (data.students.length > 0) {
            setSelectedStudent(data.students[0]);
          }
        } else {
          throw new Error(data.message || "Failed to fetch students");
        }
      } catch (error) {
        showToast({
          title: "Student Fetch Failed 🚨",
          description: "Couldn't locate your students.",
          status: "error",
          emoji: "😵"
        });
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime);
        
        if (minimumLoadTimePassed) {
          setIsLoading(false);
        } else {
          setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        }
      }
    };

    fetchStudents();

    return () => clearTimeout(minimumLoadTimer);
  }, [toast, router, minimumLoadTimePassed, showToast]);

  // Fetch tasks when student changes
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentTasks(selectedStudent.user_id);
    }
  }, [selectedStudent, fetchStudentTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "category") {
      setShowCustomCategory(value === "Other");
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "category") {
      setShowCustomCategory(value === "Other");
    }
    
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mentorId = localStorage.getItem("userId");
      const finalCategory = formData.category === "Other" ? formData.custom_category : formData.category;
      
      const taskData = {
        ...formData,
        category: finalCategory,
        assigned_by: mentorId,
        assigned_to: selectedStudent.user_id,
      };

      delete taskData.custom_category;

      const response = await fetch("/api/mentor/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Task Assigned! 🎉",
          description: `New task successfully assigned to ${selectedStudent.name}!`,
          status: "success",
          emoji: "✨"
        });
        setFormData({
          title: "",
          description: "",
          due_date: "",
          priority: "medium",
          category: "",
          custom_category: "",
          estimated_hours: "",
          resources: "",
        });
        setShowCustomCategory(false);
        onSubmitClose();
        fetchStudentTasks(selectedStudent.user_id);
      } else {
        throw new Error(data.message || "Failed to assign task");
      }
    } catch (error) {
      console.error('Task assignment error:', error);
      showToast({
        title: "Task Assignment Failed 🚨",
        description: error.message || "Task failed to assign!",
        status: "error",
        emoji: "😵"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalCategory = editFormData.category === "Other" ? editFormData.custom_category : editFormData.category;
      
      const taskData = {
        ...editFormData,
        category: finalCategory,
        task_id: selectedTask.task_id,
      };

      delete taskData.custom_category;

      const response = await fetch("/api/mentor/tasks/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Task Updated! 🎨",
          description: "Task has been updated successfully!",
          status: "success",
          emoji: "💫"
        });
        setEditFormData({
          title: "",
          description: "",
          due_date: "",
          priority: "medium",
          category: "",
          custom_category: "",
          estimated_hours: "",
          resources: "",
          status: "pending"
        });
        setShowCustomCategory(false);
        onEditClose();
        fetchStudentTasks(selectedStudent.user_id);
        onDetailsClose();
      } else {
        throw new Error(data.message || "Failed to update task");
      }
    } catch (error) {
      showToast({
        title: "Update Failed 🚨",
        description: "Couldn't update the task.",
        status: "error",
        emoji: "😵"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone!")) return;

    try {
      const response = await fetch(`/api/mentor/tasks/delete?taskId=${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Task Deleted! 🗑️",
          description: "Task successfully deleted.",
          status: "info",
          emoji: "✅"
        });
        fetchStudentTasks(selectedStudent.user_id);
        onDetailsClose();
      } else {
        throw new Error(data.message || "Failed to delete task");
      }
    } catch (error) {
      showToast({
        title: "Deletion Failed 🚨",
        description: "This task could not be deleted.",
        status: "error",
        emoji: "😵"
      });
    }
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      due_date: formatDateForInput(task.due_date),
      priority: task.priority || "medium",
      category: task.category || "",
      custom_category: task.category === "Other" ? task.custom_category : "",
      estimated_hours: task.estimated_hours || "",
      resources: task.resources || "",
      status: task.status || "pending"
    });
    onDetailsOpen();
  };

  const handleEditTask = () => {
    onDetailsClose();
    onEditOpen();
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = studentTasks
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "high" || filter === "medium" || filter === "low") {
        return task.priority === filter;
      }
      const status = task.display_status || task.status;
      return status === filter;
    })
    .filter((task) => 
      !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.priority === b.priority) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // FIXED: Updated Statistics - Count all tasks that have been submitted at least once
  const taskStats = {
    total: studentTasks.length,
    active: studentTasks.filter(t => 
      (t.display_status || t.status) === "pending"
    ).length,
    submitted: studentTasks.filter(t => 
      t.has_submission || 
      ['submitted', 'resubmitted', 'reviewed'].includes(t.display_status || t.status)
    ).length,
    notSubmitted: studentTasks.filter(t => 
      (t.display_status || t.status) === "in-progress" && !t.has_submission
    ).length,
  };

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.submitted / taskStats.total) * 100) 
    : 0;

  //Loading state  
  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear(to-r, green.500, green.600)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaTasks} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
          <Text fontWeight="medium" fontSize="lg">
            Loading Task Assignment...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing tools for assigning tasks to students</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} position="relative" overflow="hidden">
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
          {/* Header section with buttons */}
          <HStack justifyContent="space-between" mb={8} flexWrap="wrap" gap={4}>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => router.push("/mentor/dashboard")}
              leftIcon={<FaArrowLeft />}
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
              onClick={onSubmitOpen}
              leftIcon={<FaPlus />}
              borderRadius="lg"
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, purple.600)",
                transform: "translateY(-2px)",
                boxShadow: "xl"
              }}
              transition="all 0.3s"
            >
              Create New Task
            </Button>
          </HStack>

          {/* Main content */}
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="2xl"
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="gray.100"
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
                  <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
                    <Box>
                      <Heading
                        color="gray.800"
                        fontSize="3xl"
                        fontWeight="700"
                        mb={2}
                        pb={1}
                        bgGradient="linear(to-r, blue.600, purple.600)"
                        bgClip="text"
                      >
                        Task Management
                      </Heading>
                      <Text color="gray.600" fontSize="lg">
                        Manage tasks and guide your students
                        {students.length > 0 && ` • ${students.length} students assigned`}
                      </Text>
                      
                      {/* Progress badges */}
                      <HStack mt={3} spacing={3}>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                          Active Tasks: {taskStats.active}
                        </Badge>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                          Submitted: {taskStats.submitted}
                        </Badge>
                        <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                          Total Tasks: {taskStats.total}
                        </Badge>
                      </HStack>
                    </Box>
                    <Box
                      animation={`${float} 4s ease-in-out infinite`}
                      mt={{ base: 4, md: 0 }}
                      fontSize="6xl"
                      textAlign="center"
                    >
                      👨‍🏫
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Student Selection */}
            {students.length > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card
                  bg="white"
                  border="2px solid"
                  borderColor="blue.100"
                  borderRadius="xl"
                  boxShadow="lg"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    boxShadow: "xl",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.3s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={FaGraduationCap} color="blue.500" />
                        <Text fontWeight="600" color="blue.700" fontSize="lg">
                          Select Student
                        </Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                        {students.map((student) => (
                          <Card
                            key={student.user_id}
                            bg={selectedStudent?.user_id === student.user_id ? "blue.50" : "white"}
                            border="2px solid"
                            borderColor={selectedStudent?.user_id === student.user_id ? "blue.200" : "gray.100"}
                            borderRadius="lg"
                            cursor="pointer"
                            onClick={() => setSelectedStudent(student)}
                            _hover={{
                              borderColor: "blue.300",
                              transform: "translateY(-2px)",
                              boxShadow: "md"
                            }}
                            transition="all 0.3s"
                            position="relative"
                            overflow="hidden"
                          >
                            <CardBody p={4}>
                              <VStack spacing={3} align="center">
                                <Avatar 
                                  size="lg" 
                                  name={student.name} 
                                  src={student.profile_photo || ''} 
                                  bg={selectedStudent?.user_id === student.user_id ? "blue.500" : "blue.400"} 
                                  color="white"
                                  border="3px solid"
                                  borderColor={selectedStudent?.user_id === student.user_id ? "blue.200" : "white"}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <VStack spacing={1} align="center">
                                  <Text 
                                    fontWeight="600" 
                                    fontSize="md" 
                                    color={selectedStudent?.user_id === student.user_id ? "blue.700" : "gray.700"}
                                    textAlign="center"
                                  >
                                    {student.name}
                                  </Text>
                                  <Text 
                                    fontSize="xs" 
                                    color={selectedStudent?.user_id === student.user_id ? "blue.600" : "gray.500"} 
                                    noOfLines={1}
                                    textAlign="center"
                                  >
                                    {student.email}
                                  </Text>
                                  {student.college && (
                                    <Text 
                                      fontSize="xs" 
                                      color="gray.500"
                                      textAlign="center"
                                      noOfLines={1}
                                    >
                                      {student.college}
                                    </Text>
                                  )}
                                </VStack>
                                {selectedStudent?.user_id === student.user_id && (
                                  <Box
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    p={1}
                                    bg="blue.500"
                                    borderRadius="full"
                                  >
                                    <Icon as={FaCheck} color="white" boxSize={2} />
                                  </Box>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </MotionBox>
            )}

            {/* Student Profile & Stats */}
            {selectedStudent && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Grid
                  templateColumns={{ base: "1fr", lg: "3fr 1fr" }}
                  gap={6}
                >
                  {/* Student Profile Card */}
                  <Card 
                    bg={cardBg} 
                    borderRadius="xl" 
                    boxShadow="lg"
                    _hover={{
                      boxShadow: "xl",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={6} alignItems="center">
                        <Avatar 
                          size="2xl" 
                          name={selectedStudent.name} 
                          src={selectedStudent.profile_photo || ''}
                          bg={primaryColor} 
                          color="white"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <VStack align="start" spacing={3}>
                          <Heading size="lg">{selectedStudent.name}</Heading>
                          <Text color="gray.600">{selectedStudent.email}</Text>
                          <HStack spacing={4}>
                            <Badge colorScheme="blue" variant="subtle">
                              Student ID: {selectedStudent.student_id}
                            </Badge>
                            <Badge colorScheme="green" variant="subtle">
                              {selectedStudent.college}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {selectedStudent.branch} • {selectedStudent.year_of_study}
                          </Text>
                          {/* FIXED: Handle areas_of_interest as string */}
                          {selectedStudent.areas_of_interest && (
                            <HStack spacing={2} flexWrap="wrap">
                              <Tag size="sm" colorScheme="blue" variant="subtle">
                                {selectedStudent.areas_of_interest}
                              </Tag>
                            </HStack>
                          )}
                        </VStack>
                      </Grid>
                    </CardBody>
                  </Card>

                  {/* Quick Stats */}
                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg"
                    _hover={{
                      boxShadow: "xl",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Stat textAlign="center">
                          <StatLabel color="gray.600" fontSize="sm">Submission Rate</StatLabel>
                          <StatNumber fontSize="3xl" color={completionRate >= 80 ? "green.500" : completionRate >= 50 ? "orange.500" : "red.500"}>
                            {completionRate}%
                          </StatNumber>
                          <StatHelpText>
                            {taskStats.submitted} of {taskStats.total} tasks
                          </StatHelpText>
                        </Stat>
                        <Progress 
                          value={completionRate} 
                          colorScheme={completionRate >= 80 ? "green" : completionRate >= 50 ? "orange" : "red"} 
                          borderRadius="full" 
                          size="lg" 
                          hasStripe
                          isAnimated
                        />
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </MotionBox>
            )}

            {/* Stats Overview - Updated to only show 3 stats */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={6}
              >
                <Card bg={cardBg} borderRadius="xl" boxShadow="lg" _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }} transition="all 0.3s">
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text color="gray.600" fontSize="sm">Active Tasks</Text>
                        <Heading size="lg" color={primaryColor}>{taskStats.active}</Heading>
                        <Text fontSize="xs" color="gray.500">
                          Not started yet
                        </Text>
                      </VStack>
                      <Box p={3} bg="blue.50" borderRadius="lg">
                        <Icon as={FaTasks} color={primaryColor} boxSize={5} />
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderRadius="xl" boxShadow="lg" _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }} transition="all 0.3s">
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text color="gray.600" fontSize="sm">Submitted</Text>
                        <Heading size="lg" color="green.500">{taskStats.submitted}</Heading>
                        <Text fontSize="xs" color="gray.500">
                          Awaiting review
                        </Text>
                      </VStack>
                      <Box p={3} bg="green.50" borderRadius="lg">
                        <Icon as={FaPaperPlane} color="green.500" boxSize={5} />
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderRadius="xl" boxShadow="lg" _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }} transition="all 0.3s">
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text color="gray.600" fontSize="sm">Not Submitted</Text>
                        <Heading size="lg" color="red.500">{taskStats.notSubmitted}</Heading>
                        <Text fontSize="xs" color="gray.500">
                          In progress
                        </Text>
                      </VStack>
                      <Box p={3} bg="red.50" borderRadius="lg">
                        <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} />
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              </Grid>
            </MotionBox>

            {/* Tasks Panel */}
            <MotionBox
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" _hover={{ boxShadow: "xl" }} transition="all 0.3s">
                <CardBody p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Filters and Search */}
                    <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr auto" }} gap={4} alignItems="end">
                      <FormControl>
                        <FormLabel display="flex" alignItems="center">
                          <Icon as={FaSearch} mr={2} color="blue.500" /> Search Tasks
                        </FormLabel>
                        <Input
                          placeholder="Search by title, description, or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel display="flex" alignItems="center">
                          <Icon as={FaFilter} mr={2} color="blue.500" /> Status
                        </FormLabel>
                        <Select 
                          value={filter} 
                          onChange={(e) => setFilter(e.target.value)}
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                          }}
                        >
                          <option value="all">All Tasks</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="submitted">Submitted</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel display="flex" alignItems="center">
                          <Icon as={FaSort} mr={2} color="blue.500" /> Priority
                        </FormLabel>
                        <Select 
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                          }}
                        >
                          <option value="all">All Priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </Select>
                      </FormControl>

                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setFilter("all");
                        }}
                        variant="outline"
                        colorScheme="blue"
                        borderRadius="lg"
                        _hover={{ transform: "scale(1.05)" }}
                        transition="all 0.2s"
                      >
                        Clear
                      </Button>
                    </Grid>

                    {/* Tasks Grid */}
                    {filteredAndSortedTasks.length === 0 ? (
                      <Center py={12}>
                        <VStack spacing={4}>
                          <Icon as={FaTasks} boxSize={16} color="gray.400" />
                          <Text fontSize="xl" color="gray.500">
                            {studentTasks.length === 0 ? "No tasks assigned yet" : "No tasks match your search"}
                          </Text>
                          <Text color="gray.400">
                            {studentTasks.length === 0 ? "Create your first task to get started!" : "Adjust your search filters."}
                          </Text>
                          {studentTasks.length === 0 && (
                            <Button colorScheme="blue" onClick={onSubmitOpen} leftIcon={<FaPlus />}
                              bgGradient="linear(to-r, blue.500, purple.500)"
                              _hover={{
                                bgGradient: "linear(to-r, blue.600, purple.600)",
                              }}
                            >
                              Create First Task
                            </Button>
                          )}
                        </VStack>
                      </Center>
                    ) : (
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                        {filteredAndSortedTasks.map((task) => {
                          const urgencyBadge = getUrgencyBadge(task);
                          const daysRemaining = getDaysRemaining(task.due_date);
                          const status = task.display_status || task.status;
                          const isTaskCompleted = ['completed', 'reviewed', 'submitted', 'resubmitted'].includes(status);
                          
                          return (
                            <MotionCard
                              key={task.task_id}
                              variants={itemVariants}
                              bg={cardBg}
                              borderRadius="xl"
                              boxShadow="lg"
                              border="1px solid"
                              borderColor="gray.200"
                              _hover={{
                                transform: "translateY(-4px)",
                                boxShadow: "xl",
                              }}
                              position="relative"
                              cursor="pointer"
                              onClick={() => handleViewTaskDetails(task)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* FIXED: Urgency/Overdue Badge - Only show for non-submitted tasks */}
                              {!isTaskCompleted && urgencyBadge && (
                                <Box
                                  position="absolute"
                                  top={-2}
                                  right={-2}
                                  zIndex={2}
                                >
                                  <Badge
                                    colorScheme={urgencyBadge.color}
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    animation={urgencyBadge.animation}
                                  >
                                    <HStack spacing={1}>
                                      <Icon as={urgencyBadge.icon} />
                                      <Text>{urgencyBadge.text}</Text>
                                    </HStack>
                                  </Badge>
                                </Box>
                              )}

                              {/* FIXED: Submission Badge - Enhanced with different statuses */}
                              {task.has_submission && (
                                <Box
                                  position="absolute"
                                  top={-2}
                                  left={-2}
                                  zIndex={2}
                                >
                                  <Badge
                                    colorScheme={
                                      status === 'reviewed' ? 'green' :
                                      status === 'resubmitted' ? 'blue' : 'blue'
                                    }
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    <HStack spacing={1}>
                                      <Icon as={FaPaperPlane} />
                                      <Text>
                                        {status === 'reviewed' ? 'Reviewed' : 
                                         status === 'resubmitted' ? 'Resubmitted' : 'Submitted'}
                                      </Text>
                                    </HStack>
                                  </Badge>
                                </Box>
                              )}

                              <CardBody>
                                <VStack align="stretch" spacing={4}>
                                  {/* Task Header */}
                                  <Flex justify="space-between" align="start">
                                    <Badge
                                      colorScheme={getPriorityColor(task.priority)}
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      {task.priority?.toUpperCase() || 'MEDIUM'}
                                    </Badge>
                                    <Icon as={getStatusIcon(task)} color={`${getStatusColor(task)}.500`} />
                                  </Flex>

                                  {/* Task Title and Category */}
                                  <Box>
                                    <Heading size="md" mb={1} noOfLines={2} pb={1}>
                                      {task.title}
                                    </Heading>
                                    {task.category && (
                                      <HStack>
                                        <Tag size="sm" colorScheme="blue" borderRadius="full">
                                          {task.category}
                                        </Tag>
                                      </HStack>
                                    )}
                                  </Box>

                                  {/* Task Description */}
                                  <Text fontSize="sm" color="gray.600" noOfLines={3}>
                                    {task.description || 'No description provided'}
                                  </Text>

                                  {/* Task Meta Information */}
                                  <VStack spacing={2} align="stretch">
                                    <HStack justify="space-between" fontSize="sm">
                                      <HStack>
                                        <Icon as={FaCalendarAlt} color="blue.500" />
                                        <Text>Deadline</Text>
                                      </HStack>
                                      <Text fontWeight="medium">
                                        {task.due_date ? formatDate(task.due_date) : 'No deadline'}
                                        {daysRemaining !== null && !isTaskCompleted && (
                                          <Badge 
                                            ml={2} 
                                            colorScheme={
                                              daysRemaining < 0 ? 'red' : 
                                              daysRemaining === 0 ? 'orange' : 
                                              daysRemaining <= 2 ? 'orange' : 'gray'
                                            }
                                            fontSize="xs"
                                          >
                                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : 
                                             daysRemaining === 0 ? 'Today' : 
                                             daysRemaining === 1 ? '1 day' : `${daysRemaining} days`}
                                          </Badge>
                                        )}
                                      </Text>
                                    </HStack>

                                    <HStack justify="space-between" fontSize="sm">
                                      <HStack>
                                        <Icon as={FaClock} color="blue.500" />
                                        <Text>Est. Duration</Text>
                                      </HStack>
                                      <Text fontWeight="medium">
                                        {task.estimated_hours || 'Not set'} hours
                                      </Text>
                                    </HStack>

                                    {/* Submission Status */}
                                    {task.has_submission && (
                                      <HStack justify="space-between" fontSize="sm">
                                        <HStack>
                                          <Icon as={FaPaperPlane} color="blue.500" />
                                          <Text>Submission</Text>
                                        </HStack>
                                        <Badge colorScheme={getStatusColor(task)} fontSize="xs">
                                          {status.toUpperCase()}
                                        </Badge>
                                      </HStack>
                                    )}
                                  </VStack>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    w="100%"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewTaskDetails(task);
                                    }}
                                    leftIcon={<FaEye />}
                                    _hover={{ transform: "translateY(-1px)" }}
                                    transition="all 0.2s"
                                  >
                                    View Details
                                  </Button>
                                </VStack>
                              </CardBody>
                            </MotionCard>
                          );
                        })}
                      </Grid>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          </VStack>
        </Box>
      </Box>

      {/* Modals */}

      {/* Assign Task Modal */}
      <Modal isOpen={isSubmitOpen} onClose={onSubmitClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            <HStack>
              <Box p={2} bg="blue.50" borderRadius="md">
                <Icon as={FaPlus} color={primaryColor} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Create New Task</Text>
                {selectedStudent && (
                  <Text fontSize="sm" color="gray.600">For: {selectedStudent.name}</Text>
                )}
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Task Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Task Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed task description and requirements..."
                  rows={4}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
              </FormControl>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="100%">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Research">Research</option>
                    <option value="Business">Business</option>
                    <option value="Language">Language</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </Grid>

              {showCustomCategory && (
                <FormControl>
                  <FormLabel>Custom Category</FormLabel>
                  <Input
                    name="custom_category"
                    value={formData.custom_category}
                    onChange={handleInputChange}
                    placeholder="Enter custom category"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>
              )}

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="100%">
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estimated Hours</FormLabel>
                  <NumberInput min={0} max={100} borderRadius="lg">
                    <NumberInputField
                      name="estimated_hours"
                      value={formData.estimated_hours}
                      onChange={handleInputChange}
                      placeholder="Hours"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Resources (Optional)</FormLabel>
                <Input
                  name="resources"
                  value={formData.resources}
                  onChange={handleInputChange}
                  placeholder="Links to helpful resources"
                  autocomplete="off"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
                <FormHelperText>Comma-separated resource links</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onSubmitClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Creating..."
              leftIcon={<FaPlus />}
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, purple.600)",
              }}
            >
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh" overflowY="auto">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            <HStack>
              <Box p={2} bg="blue.50" borderRadius="md">
                <Icon as={FaTasks} color={primaryColor} />
              </Box>
              <Text>Task Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedTask && (
              <VStack spacing={6} align="stretch">
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedTask)} fontSize="md">
                      {(selectedTask.display_status || selectedTask.status)?.replace('-', ' ').toUpperCase() || 'PENDING'}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Priority</Text>
                    <Badge colorScheme={getPriorityColor(selectedTask.priority)} fontSize="md">
                      {selectedTask.priority?.toUpperCase() || 'MEDIUM'}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Due Date</Text>
                    <Text>
                      {selectedTask.due_date ? formatDate(selectedTask.due_date) : 'No deadline'}
                      {getDaysRemaining(selectedTask.due_date) !== null && (
                        <Badge 
                          ml={2} 
                          colorScheme={
                            getDaysRemaining(selectedTask.due_date) < 0 ? 'red' : 
                            getDaysRemaining(selectedTask.due_date) === 0 ? 'orange' : 'gray'
                          }
                        >
                          {getDaysRemaining(selectedTask.due_date) < 0 ? 
                            `${Math.abs(getDaysRemaining(selectedTask.due_date))} days overdue` : 
                            getDaysRemaining(selectedTask.due_date) === 0 ? 'Due today' : 
                            `${getDaysRemaining(selectedTask.due_date)} days left`}
                        </Badge>
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Estimated Hours</Text>
                    <Text>{selectedTask.estimated_hours || 'Not set'} hours</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Category</Text>
                    <Text>{selectedTask.category || 'General'}</Text>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" mb={2}>Description</Text>
                  <Text whiteSpace="pre-wrap" bg="gray.50" p={3} borderRadius="lg">
                    {selectedTask.description || 'No description provided'}
                  </Text>
                </Box>

                {selectedTask.resources && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={2}>Resources</Text>
                    <Text whiteSpace="pre-wrap" bg="blue.50" p={3} borderRadius="lg">
                      {selectedTask.resources}
                    </Text>
                  </Box>
                )}

                {/* Submission Details Section - Simplified without review actions */}
                {selectedTask.has_submission && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={3} fontSize="lg">
                      Submission Details
                    </Text>
                    <VStack align="stretch" spacing={3} bg="blue.50" p={4} borderRadius="lg">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Submission Status:</Text>
                        <Badge colorScheme={getStatusColor(selectedTask)} fontSize="sm">
                          {selectedTask.submission_data.status.toUpperCase()}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Submitted on:</Text>
                        <Text>{formatDateTime(selectedTask.submission_data.submission_date)}</Text>
                      </HStack>
                      
                      {selectedTask.submission_data.marks !== null && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Marks:</Text>
                          <Text fontWeight="bold" color="green.600">
                            {selectedTask.submission_data.marks}/100
                          </Text>
                        </HStack>
                      )}
                      
                      {selectedTask.submission_data.remarks && (
                        <Box>
                          <Text fontWeight="medium" mb={1}>Student Remarks:</Text>
                          <Text whiteSpace="pre-wrap" bg="white" p={2} borderRadius="md">
                            {selectedTask.submission_data.remarks}
                          </Text>
                        </Box>
                      )}
                      
                      {selectedTask.submission_data.mentor_feedback && (
                        <Box>
                          <Text fontWeight="medium" mb={1}>Your Feedback:</Text>
                          <Text whiteSpace="pre-wrap" bg="white" p={2} borderRadius="md">
                            {selectedTask.submission_data.mentor_feedback}
                          </Text>
                        </Box>
                      )}

                      {/* File Attachments */}
                      {selectedTask.submission_data.file_paths && selectedTask.submission_data.file_paths.length > 0 && (
                        <Box>
                          <Text fontWeight="medium" mb={2}>Attached Files:</Text>
                          <VStack align="stretch" spacing={1}>
                            {selectedTask.submission_data.file_paths.map((filePath, index) => (
                              <HStack key={index} bg="white" p={2} borderRadius="md">
                                <Icon as={FaFileAlt} color="blue.500" />
                                <Text fontSize="sm" flex={1}>{filePath.split('/').pop()}</Text>
                                <Button size="sm" colorScheme="blue" variant="ghost">
                                  <FaDownload />
                                </Button>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="bold" color="gray.600" mb={2}>Timeline</Text>
                  <HStack justify="space-between" bg="purple.50" p={3} borderRadius="lg">
                    <Text fontSize="sm">
                      Created: {selectedTask.created_at ? formatDate(selectedTask.created_at) : 'Unknown'}
                    </Text>
                    <Text fontSize="sm">
                      Due: {selectedTask.due_date ? formatDate(selectedTask.due_date) : 'No deadline'}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            <Button colorScheme="red" variant="outline" mr={3} onClick={() => handleDeleteTask(selectedTask.task_id)} leftIcon={<FaTrash />}>
              Delete Task
            </Button>
            <Button colorScheme="blue" onClick={handleEditTask} leftIcon={<FaEdit />}>
              Edit Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            <HStack>
              <Box p={2} bg="blue.50" borderRadius="md">
                <Icon as={FaEdit} color={primaryColor} />
              </Box>
              <Text>Edit Task</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Task Title</FormLabel>
                <Input
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Task Description</FormLabel>
                <Textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={4}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
              </FormControl>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="100%">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Research">Research</option>
                    <option value="Business">Business</option>
                    <option value="Language">Language</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleEditInputChange}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="100%">
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    name="due_date"
                    value={editFormData.due_date}
                    onChange={handleEditInputChange}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estimated Hours</FormLabel>
                  <NumberInput 
                    min={0} 
                    max={100} 
                    borderRadius="lg"
                    value={editFormData.estimated_hours}
                    onChange={(valueString) => 
                      setEditFormData(prev => ({ ...prev, estimated_hours: valueString }))
                    }
                  >
                    <NumberInputField
                      name="estimated_hours"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Resources</FormLabel>
                <Input
                  name="resources"
                  value={editFormData.resources}
                  onChange={handleEditInputChange}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleEditSubmit}
              isLoading={isSubmitting}
              loadingText="Updating..."
              leftIcon={<FaEdit />}
            >
              Update Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}