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
  Select,
  Grid,
  Progress,
  Tag,
  Center,
  keyframes,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaPlayCircle,
  FaEye,
  FaPaperPlane,
  FaQuestionCircle,
  FaFileUpload,
  FaCalendarAlt,
  FaUserTie,
  FaExclamationTriangle,
  FaRocket,
  FaArrowLeft,
  FaHistory,
  FaFilter,
  FaSort,
  FaSearch,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaCloudUploadAlt,
  FaFileAlt,
  FaEdit,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaDownload,
  FaTrash,
  FaVideo,
  FaMusic,
  FaFileCsv,
  FaFilePowerpoint,
  FaFileExcel,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";

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

// File type icon mapping
const getFileIcon = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return FaFilePdf;
    case 'doc': case 'docx': return FaFileWord;
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'svg': case 'webp': return FaFileImage;
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return FaFileArchive;
    case 'txt': case 'js': case 'html': case 'css': case 'json': case 'xml': return FaFileCode;
    case 'mp4': case 'avi': case 'mov': case 'wmv': case 'flv': return FaVideo;
    case 'mp3': case 'wav': case 'ogg': case 'flac': return FaMusic;
    case 'csv': return FaFileCsv;
    case 'xls': case 'xlsx': return FaFileExcel;
    case 'ppt': case 'pptx': return FaFilePowerpoint;
    default: return FaFileAlt;
  }
};

// File type color mapping
const getFileColor = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'red.500';
    case 'doc': case 'docx': return 'blue.500';
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'svg': case 'webp': return 'green.500';
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return 'orange.500';
    case 'txt': case 'js': case 'html': case 'css': case 'json': case 'xml': return 'purple.500';
    case 'mp4': case 'avi': case 'mov': case 'wmv': case 'flv': return 'pink.500';
    case 'mp3': case 'wav': case 'ogg': case 'flac': return 'teal.500';
    case 'csv': return 'green.600';
    case 'xls': case 'xlsx': return 'green.400';
    case 'ppt': case 'pptx': return 'orange.600';
    default: return 'gray.500';
  }
};

// Check if file is previewable (images, PDFs, etc.)
const isPreviewable = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  const previewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'pdf'];
  return previewableExtensions.includes(extension);
};

// Get file preview type
const getPreviewType = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (extension === 'pdf') {
    return 'pdf';
  }
  return null;
};

// Check if internship has started
const hasInternshipStarted = (startDate) => {
  if (!startDate) return false;
  
  try {
    const internshipStart = new Date(startDate);
    const today = new Date();
    
    // Clear time part for accurate date comparison
    internshipStart.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return today >= internshipStart;
  } catch (error) {
    console.error('Error checking internship date:', error);
    return false;
  }
};

export default function MentorTasks() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [studentInfo, setStudentInfo] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  
  // States for mentor allocation and internship check
  const [mentorAllocated, setMentorAllocated] = useState(null);
  const [internshipStarted, setInternshipStarted] = useState(null);
  const [internshipStartDate, setInternshipStartDate] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal states
  const { isOpen: isSubmitOpen, onOpen: onSubmitOpen, onClose: onSubmitClose } = useDisclosure();
  const { isOpen: isQueryOpen, onOpen: onQueryOpen, onClose: onQueryClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [currentPreview, setCurrentPreview] = useState(null);

  // Form states
  const [submissionData, setSubmissionData] = useState({
    remarks: "",
    files: []
  });
  const [queryData, setQueryData] = useState({
    subject: "",
    message: "",
    priority: "medium"
  });
  const [editData, setEditData] = useState({
    remarks: "",
    files: [],
    existingFiles: []
  });

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

  // Enhanced toast notifications
  const showToast = useCallback(({ title, description, status, emoji, duration = 4000, isClosable = true }) => {
    const statusConfig = {
      success: {
        bg: "linear-gradient(135deg, #48BB78 0%, #38A169 100%)",
        color: "white",
        icon: emoji || "🎉",
        borderColor: "green.200"
      },
      error: {
        bg: "linear-gradient(135deg, #F56565 0%, #E53E3E 100%)",
        color: "white",
        icon: emoji || "❌",
        borderColor: "red.200"
      },
      warning: {
        bg: "linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)",
        color: "white",
        icon: emoji || "⚠️",
        borderColor: "orange.200"
      },
      info: {
        bg: "linear-gradient(135deg, #4299E1 0%, #3182CE 100%)",
        color: "white",
        icon: emoji || "💡",
        borderColor: "blue.200"
      }
    };

    const config = statusConfig[status] || statusConfig.info;

    toast({
      position: "top-right",
      duration,
      isClosable,
      render: ({ onClose }) => (
        <Alert
          variant="left-accent"
          bg={config.bg}
          color={config.color}
          borderRadius="xl"
          boxShadow="2xl"
          border="2px solid"
          borderColor={config.borderColor}
          alignItems="flex-start"
          fontFamily="'Segoe UI', sans-serif"
        >
          <AlertIcon boxSize="24px" mr={3} fontSize="xl">
            {config.icon}
          </AlertIcon>
          <Box flex="1">
            <AlertTitle fontSize="lg" fontWeight="bold" mb={1}>
              {title}
            </AlertTitle>
            <AlertDescription fontSize="md">
              {description}
            </AlertDescription>
          </Box>
          <Button
            size="sm"
            variant="ghost"
            color="current"
            onClick={onClose}
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
          >
            <FaTimes />
          </Button>
        </Alert>
      )
    });
  }, [toast]);

  // Check if task is editable (before due date including same day but before end of day)
  const isTaskEditable = (task) => {
    if (!task || !task.due_date) return true;
    
    try {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      
      // Set both dates to the same time (end of day for due date)
      const dueDateEndOfDay = new Date(dueDate);
      dueDateEndOfDay.setHours(23, 59, 59, 999);
      
      return now <= dueDateEndOfDay;
    } catch (error) {
      console.error('Error parsing due date:', error);
      return true;
    }
  };

  // Get days remaining for a task
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    try {
      const due = new Date(dueDate);
      const now = new Date();
      
      // Set both dates to start of day for accurate day calculation
      const dueStartOfDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = dueStartOfDay - nowStartOfDay;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return null;
    }
  };

  // Check if task is considered completed/done
  const isTaskCompleted = (task) => {
    if (!task) return false;
    
    // If task status is 'completed' in database, it's done
    if (task.status === 'completed') return true;
    
    // If task status is 'reviewed' in database, it's done
    if (task.status === 'reviewed') return true;
    
    // If task has submission and status is 'submitted', check if it's past due date
    const submission = submissions[task.task_id];
    if (submission && task.status === 'submitted') {
      if (!task.due_date) return false;
      
      try {
        const dueDate = new Date(task.due_date);
        const now = new Date();
        
        // Set both dates to the same time (end of day for due date)
        const dueDateEndOfDay = new Date(dueDate);
        dueDateEndOfDay.setHours(23, 59, 59, 999);
        
        return now > dueDateEndOfDay;
      } catch (error) {
        console.error('Error checking if task is completed:', error);
        return false;
      }
    }
    
    return false;
  };

  // Check if task should show as completed in UI
  const shouldShowAsCompleted = (task) => {
    if (!task) return false;
    
    // If task status is 'completed' or 'reviewed' in database
    if (task.status === 'completed' || task.status === 'reviewed') return true;
    
    // If task has submission and is past due date
    const submission = submissions[task.task_id];
    if (submission && task.status === 'submitted') {
      return isTaskCompleted(task);
    }
    
    return false;
  };

  // Get urgency badge - don't show for completed/reviewed tasks
  const getUrgencyBadge = (task) => {
    if (!task || shouldShowAsCompleted(task)) return null;
    
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

  // Generate file previews
  const generateFilePreviews = (files) => {
    const previews = {};
    
    files.forEach(file => {
      if (isPreviewable(file.name)) {
        const previewType = getPreviewType(file.name);
        if (previewType === 'image') {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews[file.name] = {
              type: 'image',
              url: e.target.result,
              name: file.name
            };
            setFilePreviews(prev => ({ ...prev, ...previews }));
          };
          reader.readAsDataURL(file);
        } else if (previewType === 'pdf') {
          previews[file.name] = {
            type: 'pdf',
            url: URL.createObjectURL(file),
            name: file.name
          };
          setFilePreviews(prev => ({ ...prev, ...previews }));
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'reviewed': return 'purple';
      case 'submitted': return 'blue';
      case 'in-progress': return 'blue';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FaCheckCircle;
      case 'reviewed': return FaCheckCircle;
      case 'submitted': return FaCheckCircle;
      case 'in-progress': return FaPlayCircle;
      case 'pending': return FaClock;
      default: return FaTasks;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Check if task has submission (for button display)
  const hasSubmission = (task) => {
    if (!task || !task.task_id) return false;
    
    const submission = submissions[task.task_id];
    
    // Check if submission exists and has valid data
    return submission && 
           submission.submission_id && 
           (submission.remarks || submission.file_paths || submission.status === 'submitted');
  };

  // Enhanced canEditSubmission function - check if task has submission and is before due date
  const canEditSubmission = (task) => {
    if (!task) return false;
    
    // Allow editing if task has been submitted and is before due date
    const hasSubmission = submissions[task.task_id];
    const isBeforeDueDate = isTaskEditable(task);
    
    return hasSubmission && isBeforeDueDate && task.status === 'submitted';
  };

  // Calculate progress correctly - count completed and reviewed tasks as done
  const calculateProgress = () => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    
    // Count tasks that are completed, reviewed, or submitted and past due date
    const completedTasks = tasks.filter(task => 
      shouldShowAsCompleted(task)
    ).length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  // Count completed tasks for display - include reviewed and completed
  const getCompletedTaskCount = () => {
    return tasks.filter(task => shouldShowAsCompleted(task)).length;
  };

  // Count submitted tasks - include all tasks with status 'submitted' regardless of completion
  const getSubmittedTaskCount = () => {
    return tasks.filter(task => 
      task.status === 'submitted' || hasSubmission(task)
    ).length;
  };

  // Enhanced data fetching with proper status handling
  useEffect(() => {
    const minimumLoadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    const fetchData = async () => {
      const startTime = Date.now();

      try {
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");
        
        if (!userId) {
          router.push('/login');
          return;
        }

        const userData = {
          user_id: userId,
          user_role: userRole,
          name: "",
          email: ""
        };
        
        setUser(userData);

        // Fetch all data in parallel
        const [studentResponse, applicationResponse, tasksResponse, submissionsResponse] = await Promise.allSettled([
          fetch(`/api/userdetails?userId=${userId}`),
          fetch(`/api/application-details?userId=${userId}`),
          fetch(`/api/student/tasks?studentId=${userId}`),
          fetch(`/api/student/get-submissions?studentId=${userId}`)
        ]);

        // Process student data
        if (studentResponse.status === 'fulfilled' && studentResponse.value.ok) {
          const studentData = await studentResponse.value.json();
          setStudentInfo(studentData);
          
          if (studentData.name || studentData.email) {
            setUser(prevUser => ({
              ...prevUser,
              name: studentData.name || prevUser.name,
              email: studentData.email || prevUser.email,
              student_id: studentData.student_number
            }));
          }
        }

        // Process application data for mentor allocation
        let mentorAllocatedResult = false;
        let internshipStartedResult = false;
        let internshipStartDateResult = null;
        let mentorNameResult = "";

        if (applicationResponse.status === 'fulfilled' && applicationResponse.value.ok) {
          const applicationData = await applicationResponse.value.json();

          mentorAllocatedResult = applicationData.mentor && applicationData.mentor.trim() !== '';
          
          if (applicationData.start_date) {
            internshipStartDateResult = applicationData.start_date;
            internshipStartedResult = hasInternshipStarted(applicationData.start_date);
          }

          if (mentorAllocatedResult) {
            try {
              const mentorResponse = await fetch(`/api/mentor-name?mentorId=${applicationData.mentor}`);
              if (mentorResponse.ok) {
                const mentorData = await mentorResponse.json();
                mentorNameResult = mentorData.name || "Mentor";
              } else {
                mentorNameResult = applicationData.mentor;
              }
            } catch (error) {
              console.error('Error fetching mentor name:', error);
              mentorNameResult = applicationData.mentor;
            }
          }
        }

        setMentorAllocated(mentorAllocatedResult);
        setInternshipStarted(internshipStartedResult);
        setInternshipStartDate(internshipStartDateResult);
        setMentorName(mentorNameResult);

        // Only fetch tasks and submissions if internship has started and mentor is allocated
        if (internshipStartedResult && mentorAllocatedResult) {
          // Process tasks data
          if (tasksResponse.status === 'fulfilled' && tasksResponse.value.ok) {
            const tasksData = await tasksResponse.value.json();
            setTasks(tasksData);
            setFilteredTasks(tasksData);
            
            // Process submissions data
            if (submissionsResponse.status === 'fulfilled' && submissionsResponse.value.ok) {
              const submissionsData = await submissionsResponse.value.json();
              setSubmissions(submissionsData.submissions || {});
            } else {
              // Fallback: Fetch submissions individually if bulk fetch fails
              const individualSubmissions = {};
              for (const task of tasksData) {
                try {
                  const submissionResponse = await fetch(`/api/student/get-submission?taskId=${task.task_id}&studentId=${userId}`);
                  if (submissionResponse.ok) {
                    const submissionData = await submissionResponse.json();
                    if (submissionData.submission) {
                      individualSubmissions[task.task_id] = submissionData.submission;
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching submission for task ${task.task_id}:`, error);
                }
              }
              setSubmissions(individualSubmissions);
            }

            if (tasksData.length > 0 && !mentorNameResult) {
              const task = tasksData[0];
              const taskMentorName = task.mentor_name || task.assigned_by_name;
              if (taskMentorName) {
                setMentorName(taskMentorName);
              }
            }
          } else {
            throw new Error('Failed to fetch tasks');
          }

          // Final mentor name fallback
          if (!mentorNameResult) {
            try {
              const mentorResponse = await fetch(`/api/mentorname?studentId=${userId}`);
              if (mentorResponse.ok) {
                const mentorData = await mentorResponse.json();
                if (mentorData.name && mentorData.name !== 'Not assigned') {
                  setMentorName(mentorData.name);
                }
              }
            } catch (error) {
              console.error('Error fetching mentor name:', error);
            }
          }
        }

        setDataLoaded(true);

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast({
          title: "Loading Error 🚨",
          description: "Failed to load tasks. Please try refreshing the page.",
          status: "error",
          emoji: "😵",
          isClosable: true,
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

    fetchData();

    return () => clearTimeout(minimumLoadTimer);
  }, [router, minimumLoadTimePassed, showToast]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionData({
      ...submissionData,
      files: [...submissionData.files, ...files]
    });
    generateFilePreviews(files);
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditData({
      ...editData,
      files: [...editData.files, ...files]
    });
    generateFilePreviews(files);
  };

  // Remove file from submission
  const removeFile = (fileName, isEdit = false) => {
    if (isEdit) {
      setEditData(prev => ({
        ...prev,
        files: prev.files.filter(file => file.name !== fileName)
      }));
    } else {
      setSubmissionData(prev => ({
        ...prev,
        files: prev.files.filter(file => file.name !== fileName)
      }));
    }
    
    // Clean up preview URLs
    if (filePreviews[fileName] && filePreviews[fileName].url.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviews[fileName].url);
    }
    
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
  };

  // Open file preview
  const openFilePreview = (fileName, fileData = null) => {
    if (fileData) {
      setCurrentPreview({
        name: fileName,
        type: getPreviewType(fileName),
        url: fileData.url || URL.createObjectURL(fileData),
        data: fileData
      });
    } else if (filePreviews[fileName]) {
      setCurrentPreview(filePreviews[fileName]);
    }
    onPreviewOpen();
  };

  // Updated openSubmitModal function to be more robust
  const openSubmitModal = (task) => {
    if (!task) return;
    
    // Check if submission already exists - more robust check
    const submissionExists = hasSubmission(task);
    
    if (submissionExists) {
      showToast({
        title: "Submission Exists 📝",
        description: "This task already has a submission. Please use the edit option.",
        status: "info",
        emoji: "📝"
      });
      
      return;
    }
    
    setSelectedTask(task);
    setSubmissionData({ remarks: "", files: [] });
    setFilePreviews({});
    onSubmitOpen();
  };

  const openEditModal = (task) => {
    if (!task) return;
    setSelectedTask(task);
    const submission = submissions[task.task_id];
    
    const existingFiles = submission?.file_paths || [];
    
    setEditData({
      remarks: submission?.remarks || "",
      files: [],
      existingFiles: Array.isArray(existingFiles) ? existingFiles : []
    });
    setFilePreviews({});
    onEditOpen();
  };

  const openQueryModal = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setQueryData({ subject: "", message: "", priority: "medium" });
    onQueryOpen();
  };

  const openDetailsModal = (task) => {
    if (!task) return;
    setSelectedTask(task);
    onDetailsOpen();
  };

  // Task submission function with proper status handling and compulsory file upload
  const handleSubmitTask = async () => {
    if (!selectedTask) {
      showToast({
        title: "Oops! Missing Task 🎯",
        description: "No task selected for submission.",
        status: "error",
        emoji: "🎯"
      });
      return;
    }

    if (!submissionData.remarks.trim()) {
      showToast({
        title: "Missing Remarks 📝",
        description: "Please enter submission remarks to continue.",
        status: "warning",
        emoji: "📝"
      });
      return;
    }

    // COMPULSORY FILE UPLOAD CHECK - ADDED THIS VALIDATION
    if (submissionData.files.length === 0) {
      showToast({
        title: "Files Required 📁",
        description: "Please upload at least one file to submit your task.",
        status: "warning",
        emoji: "📁"
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      showToast({
        title: "Session Expired 🔐",
        description: "Please refresh the page and try again.",
        status: "error",
        emoji: "🔐"
      });
      return;
    }

    // Check if submission already exists
    if (hasSubmission(selectedTask)) {
      showToast({
        title: "Submission Exists 📝",
        description: "This task already has a submission. Please use the edit option to update it.",
        status: "warning",
        emoji: "📝"
      });
      onSubmitClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('task_id', selectedTask.task_id);
      formData.append('student_id', userId);
      formData.append('remarks', submissionData.remarks);
      formData.append('submission_date', new Date().toISOString());

      // Append files if any
      submissionData.files.forEach((file) => {
        formData.append('files', file, file.name);
      });

      const response = await fetch('/api/student/task-submission', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Submission already exists. Please use the edit option.');
        }
        throw new Error(result.error || 'Failed to submit task');
      }

      // Update both tasks and submissions state immediately with 'submitted' status
      const updatedTasks = tasks.map(task =>
        task.task_id === selectedTask.task_id ? { ...task, status: 'submitted' } : task
      );
      setTasks(updatedTasks);

      // Update submissions state with the new submission data
      const newSubmission = {
        ...result.submission,
        file_paths: result.submission.file_paths || [],
        status: 'submitted'
      };
      
      setSubmissions(prev => ({
        ...prev,
        [selectedTask.task_id]: newSubmission
      }));

      showToast({
        title: "Task Submitted! 🎉",
        description: "Your work has been sent to your mentor for review. You can edit until the due date!",
        status: "success",
        emoji: "✨",
        duration: 5000
      });

      onSubmitClose();
      setSubmissionData({ remarks: "", files: [] });
      setFilePreviews({});
    } catch (error) {
      console.error('Error submitting task:', error);
      showToast({
        title: "Submission Failed 🚨",
        description: error.message || "Please check your connection and try again.",
        status: "error",
        emoji: "😵"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit submission function with proper status handling and compulsory file check
  const handleEditSubmission = async () => {
    if (!selectedTask) {
      showToast({
        title: "Oops! Missing Task 🎯",
        description: "No task selected for editing.",
        status: "error",
        emoji: "🎯"
      });
      return;
    }

    if (!editData.remarks.trim()) {
      showToast({
        title: "Missing Remarks 📝",
        description: "Please enter submission remarks to continue.",
        status: "warning",
        emoji: "📝"
      });
      return;
    }

    // COMPULSORY FILE CHECK FOR EDIT - Must have either existing files or new files
    const totalFiles = (editData.existingFiles?.length || 0) + (editData.files?.length || 0);
    if (totalFiles === 0) {
      showToast({
        title: "Files Required 📁",
        description: "Please keep at least one file or upload new files to update your submission.",
        status: "warning",
        emoji: "📁"
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      showToast({
        title: "Session Expired 🔐",
        description: "Please refresh the page and try again.",
        status: "error",
        emoji: "🔐"
      });
      return;
    }

    if (!isTaskEditable(selectedTask)) {
      showToast({
        title: "Editing Not Allowed ⏰",
        description: "This task cannot be edited after the due date has passed.",
        status: "error",
        emoji: "⏰"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('task_id', selectedTask.task_id);
      formData.append('student_id', userId);
      formData.append('remarks', editData.remarks);
      formData.append('submission_date', new Date().toISOString());
      formData.append('existing_files', JSON.stringify(editData.existingFiles));

      // Append new files
      editData.files.forEach((file) => {
        formData.append('new_files', file, file.name);
      });

      const response = await fetch('/api/student/edit-submission', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update submission');

      // Keep task status as 'submitted' in student_tasks table for edits
      const updatedTasks = tasks.map(task =>
        task.task_id === selectedTask.task_id ? { ...task, status: 'submitted' } : task
      );
      setTasks(updatedTasks);

      // Update submissions state with the edited submission data
      const updatedSubmission = {
        ...result.submission,
        file_paths: result.submission.file_paths || [],
        status: 'submitted'
      };

      setSubmissions(prev => ({
        ...prev,
        [selectedTask.task_id]: updatedSubmission
      }));

      showToast({
        title: "Submission Updated! 🎨",
        description: "Your submission has been updated successfully!",
        status: "success",
        emoji: "💫",
        duration: 5000
      });

      onEditClose();
      setEditData({ remarks: "", files: [], existingFiles: [] });
      setFilePreviews({});
    } catch (error) {
      console.error('Error updating submission:', error);
      showToast({
        title: "Update Failed 🚨",
        description: error.message || "Please try again in a moment.",
        status: "error",
        emoji: "😵"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ask query with proper timestamp formatting
  const handleAskQuery = async () => {
    if (!selectedTask) {
      showToast({
        title: "Oops! Missing Task 🎯",
        description: "No task selected for query.",
        status: "error",
        emoji: "🎯"
      });
      return;
    }

    if (!queryData.subject.trim() || !queryData.message.trim()) {
      showToast({
        title: "Incomplete Query 📝",
        description: "Please fill in both subject and message fields.",
        status: "warning",
        emoji: "📝"
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      showToast({
        title: "Session Expired 🔐",
        description: "Please refresh the page and try again.",
        status: "error",
        emoji: "🔐"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format timestamp for PostgreSQL compatibility
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').replace('Z', '');
      
      const response = await fetch('/api/student/task-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: selectedTask.task_id,
          student_id: userId,
          mentor_id: selectedTask.assigned_by,
          subject: queryData.subject,
          message: queryData.message,
          priority: queryData.priority,
          query_date: formattedDate
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send query');

      showToast({
        title: "Query Sent! 💬",
        description: "Your question has been sent to your mentor. He will respond soon!",
        status: "success",
        emoji: "🚀",
        duration: 5000
      });

      onQueryClose();
      setQueryData({ subject: "", message: "", priority: "medium" });
    } catch (error) {
      console.error('Error sending query:', error);
      showToast({
        title: "Send Failed 🚨",
        description: error.message || "Couldn't send your question. Please try again.",
        status: "error",
        emoji: "😵"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeExistingFile = (filePath) => {
    setEditData(prev => ({
      ...prev,
      existingFiles: prev.existingFiles.filter(file => file !== filePath)
    }));
  };

  const downloadFile = (filePath) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    link.click();
  };

  // File preview component
  const FilePreviewModal = () => (
    <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="4xl" closeOnOverlayClick={true}>
      <ModalOverlay />
      <ModalContent borderRadius="2xl" maxH="90vh" overflow="hidden">
        <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
          <HStack>
            <Icon as={getFileIcon(currentPreview?.name)} color={getFileColor(currentPreview?.name)} />
            <Text isTruncated maxW="80%">{currentPreview?.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0} display="flex" alignItems="center" justifyContent="center" bg="gray.900">
          {currentPreview?.type === 'image' && (
            <Image
              src={currentPreview?.url}
              alt={currentPreview?.name}
              maxH="70vh"
              maxW="100%"
              objectFit="contain"
            />
          )}
          {currentPreview?.type === 'pdf' && (
            <Box w="100%" h="70vh">
              <iframe
                src={currentPreview?.url}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title={currentPreview?.name}
              />
            </Box>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <Button
            leftIcon={<FaDownload />}
            colorScheme="blue"
            onClick={() => downloadFile(currentPreview?.url)}
            fontFamily="'Segoe UI', sans-serif"
          >
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Show message if no mentor is assigned
  if (!isLoading && !mentorAllocated) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
        {/* Background elements */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="blue.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 8s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="10%"
          left="10%"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="purple.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 10s ease-in-out infinite`}
        />
        
        <Box position="relative" zIndex="1">
          <Center>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg="blue.100"
                  color="blue.500"
                >
                  <Icon as={FaUserTie} boxSize={10} />
                </Box>
                <Heading size="lg" color="blue.500" fontFamily="'Segoe UI', sans-serif">Mentor Required</Heading>
                <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
                  You cannot submit tasks until a mentor has been assigned to you.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait for our team to allocate a mentor to your account. Once a mentor is assigned, 
                  you&apos;ll be able to submit your tasks through this portal.
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  You can submit tasks only after a mentor is allocated to you.
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => router.push("/student/dashboard")}
                  mt={4}
                  fontFamily="'Segoe UI', sans-serif"
                  rightIcon={<FaRocket />}
                >
                  Back to Dashboard
                </Button>
              </VStack>
            </MotionBox>
          </Center>
        </Box>
      </Box>
    );
  }

  // Early return for internship not started
  if (!isLoading && !internshipStarted) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <Card maxW="md" p={8} textAlign="center" boxShadow="xl" borderRadius="2xl">
          <Box color="orange.500" mb={6}>
            <Icon as={FaExclamationTriangle} boxSize={16} />
          </Box>
          <Heading size="lg" mb={4} color="gray.700">
            Internship Not Started Yet
          </Heading>
          <Text mb={6} color="gray.600">
            {internshipStartDate 
              ? `You can submit tasks starting from ${new Date(internshipStartDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}`
              : "Your internship start date has not been set yet. Please contact your program coordinator."}
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push("/student/dashboard")}
            leftIcon={<FaArrowLeft />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  // Show loading state while data is being fetched
  if (isLoading || mentorAllocated === null || internshipStarted === null || !dataLoaded) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #0891B2 0%, #0E7490 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaTasks} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
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
          {/* Header section with buttons */}
          <HStack justifyContent="space-between" mb={8} flexWrap="wrap" gap={4}>
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
              colorScheme="purple"
              variant="outline"
              onClick={() => router.push("/student/task-history")}
              rightIcon={<FaHistory />}
              fontFamily="'Segoe UI', sans-serif"
              borderRadius="lg"
              _hover={{
                bg: "purple.50",
                boxShadow: "md"
              }}
              transition="all 0.3s"
            >
              View History
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
                        fontFamily="'Segoe UI', sans-serif"
                        fontSize="3xl"
                        fontWeight="700"
                        mb={2}
                        bgGradient="linear(to-r, blue.600, purple.600)"
                        bgClip="text"
                      >
                        Mentor Tasks
                      </Heading>
                      <Text color="gray.600" fontSize="lg" fontFamily="'Segoe UI', sans-serif">
                        Manage your assigned tasks and communicate with your mentor
                        {tasks.length > 0 && ` • ${getCompletedTaskCount()}/${tasks.length} completed`}
                      </Text>
                      
                      {/* Progress badges */}
                      <HStack mt={3} spacing={3}>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                          Total: {tasks.length}
                        </Badge>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                          Done: {getCompletedTaskCount()}
                        </Badge>
                        <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                          Pending: {tasks.filter(t => t.status === 'pending').length}
                        </Badge>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                          Submitted: {getSubmittedTaskCount()}
                        </Badge>
                      </HStack>
                    </Box>
                    <Box
                      animation={`${float} 4s ease-in-out infinite`}
                      mt={{ base: 4, md: 0 }}
                      fontSize="6xl"
                      textAlign="center"
                    >
                      🚀
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Progress Overview */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                bg="white"
                border="1px solid"
                borderColor="blue.100"
                borderRadius="xl"
                boxShadow="lg"
                position="relative"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{
                  boxShadow: "xl",
                  transform: "translateY(-2px)"
                }}
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="bold" color="blue.700" fontFamily="'Segoe UI', sans-serif">
                        Task Progress Overview
                      </Text>
                      <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                        {calculateProgress()}% Complete
                      </Badge>
                    </Flex>
                    <Progress 
                      value={calculateProgress()} 
                      size="lg" 
                      colorScheme="blue" 
                      borderRadius="full"
                      bg="blue.50"
                      hasStripe
                      isAnimated
                    />
                    <HStack justify="space-between" fontSize="sm" color="gray.600" flexWrap="wrap" gap={2}>
                      <Text>Total Tasks: {tasks.length}</Text>
                      <Text>Completed: {getCompletedTaskCount()}</Text>
                      <Text>Submitted: {getSubmittedTaskCount()}</Text>
                      <Text>Pending: {tasks.filter(t => t.status === 'pending').length}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Student Information Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                bg="white"
                border="1px solid"
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
                <CardBody p={5}>
                  <Box
                    position="absolute"
                    top="0"
                    right="0"
                    w="60px"
                    h="60px"
                    bg="blue.50"
                    borderRadius="0 0 0 60px"
                    zIndex="0"
                  />
                  <Box position="relative" zIndex="1">
                    <Heading size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                      <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                        Student Information
                      </Box>
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
                      <HStack justify="space-between" p={2} borderRadius="md" _hover={{ bg: "blue.50" }} transition="all 0.2s">
                        <HStack>
                          <Icon as={FaUser} color="blue.500" />
                          <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Name</Text>
                        </HStack>
                        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="500">{user?.name || ''}</Text>
                      </HStack>

                      <HStack justify="space-between" p={2} borderRadius="md" _hover={{ bg: "blue.50" }} transition="all 0.2s">
                        <HStack>
                          <Icon as={FaIdCard} color="blue.500" />
                          <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Student ID</Text>
                        </HStack>
                        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="500">
                          {studentInfo?.student_number || studentInfo?.student_id || 'Not assigned'}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" p={2} borderRadius="md" _hover={{ bg: "blue.50" }} transition="all 0.2s">
                        <HStack>
                          <Icon as={FaEnvelope} color="blue.500" />
                          <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Email</Text>
                        </HStack>
                        <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif" fontWeight="500">{user?.email || ''}</Text>
                      </HStack>

                      <HStack justify="space-between" p={2} borderRadius="md" _hover={{ bg: "blue.50" }} transition="all 0.2s">
                        <HStack>
                          <Icon as={FaUserTie} color="blue.500" />
                          <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Mentor</Text>
                        </HStack>
                        <Badge
                          colorScheme="green"
                          fontFamily="'Segoe UI', sans-serif"
                          fontSize="sm"
                          py={1}
                          px={3}
                          borderRadius="full"
                        >
                          {mentorName || "Not assigned"}
                        </Badge>
                      </HStack>
                    </Grid>
                  </Box>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Filters and Search */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card bg={cardBg} borderRadius="xl" boxShadow="lg" _hover={{ boxShadow: "xl" }} transition="all 0.3s">
                <CardBody>
                  <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr auto" }} gap={4} alignItems="end">
                    <FormControl>
                      <FormLabel display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
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
                      <FormLabel display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                        <Icon as={FaFilter} mr={2} color="blue.500" /> Status
                      </FormLabel>
                      <Select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="completed">Completed</option>
                        <option value="reviewed">Reviewed</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                        <Icon as={FaSort} mr={2} color="blue.500" /> Priority
                      </FormLabel>
                      <Select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)}
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
                        setStatusFilter("all");
                        setPriorityFilter("all");
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
                </CardBody>
              </Card>
            </MotionBox>

            {/* Tasks Grid */}
            <MotionBox
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredTasks.length === 0 ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Icon as={FaTasks} boxSize={16} color="gray.400" />
                    <Text fontSize="xl" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                      {tasks.length === 0 ? "No tasks assigned yet" : "No tasks match your filters"}
                    </Text>
                    <Text color="gray.400" fontFamily="'Segoe UI', sans-serif">
                      {tasks.length === 0 ? "Your mentor hasn't assigned any tasks yet." : "Try adjusting your search or filters."}
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  {filteredTasks.map((task) => {
                    const urgencyBadge = getUrgencyBadge(task);
                    const daysRemaining = getDaysRemaining(task.due_date);
                    const taskHasSubmission = hasSubmission(task);
                    const canEdit = canEditSubmission(task);
                    const isCompleted = shouldShowAsCompleted(task);
                    const isReviewed = task.status === 'reviewed';
                    
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
                          transition: "all 0.3s"
                        }}
                        position="relative"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Urgency/Overdue Badge */}
                        {urgencyBadge && (
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
                              <Icon as={getStatusIcon(task.status)} color={`${getStatusColor(task.status)}.500`} />
                            </Flex>

                            {/* Task Title and Category */}
                            <Box>
                              <Heading size="md" mb={1} noOfLines={2} fontFamily="'Segoe UI', sans-serif" pb={1}>
                                {task.title}
                              </Heading>
                              {task.category && (
                                <Tag size="sm" colorScheme="blue" borderRadius="full" fontFamily="'Segoe UI', sans-serif">
                                  {task.category}
                                </Tag>
                              )}
                            </Box>

                            {/* Task Description */}
                            <Text fontSize="sm" color="gray.600" noOfLines={3} fontFamily="'Segoe UI', sans-serif">
                              {task.description || 'No description provided'}
                            </Text>

                            {/* Task Meta Information */}
                            <VStack spacing={2} align="stretch">
                              <HStack justify="space-between" fontSize="sm">
                                <HStack>
                                  <Icon as={FaCalendarAlt} color="blue.500" />
                                  <Text fontFamily="'Segoe UI', sans-serif">Due Date</Text>
                                </HStack>
                                <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                                  {task.due_date ? formatDate(task.due_date) : 'Not set'}
                                  {daysRemaining !== null && !isCompleted && (
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
                                  <Text fontFamily="'Segoe UI', sans-serif">Est. Hours</Text>
                                </HStack>
                                <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                                  {task.estimated_hours || 'N/A'} hrs
                                </Text>
                              </HStack>

                              <HStack justify="space-between" fontSize="sm">
                                <HStack>
                                  <Icon as={FaUserTie} color="blue.500" />
                                  <Text fontFamily="'Segoe UI', sans-serif">Assigned By</Text>
                                </HStack>
                                <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif" fontSize="xs" noOfLines={1}>
                                  {task.mentor_name || task.assigned_by_name || 'Mentor'}
                                </Text>
                              </HStack>
                            </VStack>

                            {/* Submission Status */}
                            {taskHasSubmission && (
                              <Box>
                                <Badge 
                                  colorScheme={
                                    isReviewed ? 'purple' :
                                    isCompleted ? 'green' :
                                    submissions[task.task_id].status === 'reviewed' ? 'purple' :
                                    submissions[task.task_id].status === 'rejected' ? 'red' : 'blue'
                                  }
                                  fontSize="xs"
                                  borderRadius="full"
                                  px={2}
                                  py={1}
                                >
                                  {isReviewed ? 'REVIEWED' :
                                   isCompleted ? 'COMPLETED' : 
                                   submissions[task.task_id].status?.toUpperCase() || 'SUBMITTED'}
                                </Badge>
                                {submissions[task.task_id].mentor_feedback && (
                                  <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>
                                    Feedback: {submissions[task.task_id].mentor_feedback}
                                  </Text>
                                )}
                                {canEdit && (
                                  <Text fontSize="xs" color="green.600" mt={1} fontStyle="italic">
                                    ✓ Editable until due date
                                  </Text>
                                )}
                                {isReviewed && (
                                  <Text fontSize="xs" color="purple.600" mt={1} fontStyle="italic">
                                    ✓ Reviewed by mentor
                                  </Text>
                                )}
                                {isCompleted && !isReviewed && (
                                  <Text fontSize="xs" color="green.600" mt={1} fontStyle="italic">
                                    ✓ Final submission completed
                                  </Text>
                                )}
                              </Box>
                            )}

                            {/* Action Buttons */}
                            <VStack spacing={2}>
                              <Button
                                leftIcon={<FaEye />}
                                variant="outline"
                                size="sm"
                                w="full"
                                onClick={() => openDetailsModal(task)}
                                fontFamily="'Segoe UI', sans-serif"
                                colorScheme="blue"
                                _hover={{ transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                              >
                                View Details
                              </Button>

                              <HStack spacing={2} w="full">
                                {/* Updated button logic for new status flow */}
                                {!taskHasSubmission ? (
                                  <Button
                                    leftIcon={<FaFileUpload />}
                                    colorScheme="blue"
                                    size="sm"
                                    flex={1}
                                    onClick={() => openSubmitModal(task)}
                                    fontFamily="'Segoe UI', sans-serif"
                                    bgGradient="linear(to-r, blue.500, purple.500)"
                                    _hover={{
                                      bgGradient: "linear(to-r, blue.600, purple.600)",
                                      transform: "translateY(-1px)"
                                    }}
                                    isDisabled={!isTaskEditable(task)}
                                    title={!isTaskEditable(task) ? "Cannot submit after due date" : ""}
                                    transition="all 0.2s"
                                  >
                                    Submit
                                  </Button>
                                ) : canEdit ? (
                                  <Button
                                    leftIcon={<FaEdit />}
                                    colorScheme="orange"
                                    size="sm"
                                    flex={1}
                                    onClick={() => openEditModal(task)}
                                    fontFamily="'Segoe UI', sans-serif"
                                    title="Edit your submission (available until due date)"
                                    _hover={{ transform: "translateY(-1px)" }}
                                    transition="all 0.2s"
                                  >
                                    Edit
                                  </Button>
                                ) : isReviewed ? (
                                  <Button
                                    leftIcon={<FaCheckCircle />}
                                    colorScheme="purple"
                                    size="sm"
                                    flex={1}
                                    variant="outline"
                                    fontFamily="'Segoe UI', sans-serif"
                                    isDisabled
                                    title="Task reviewed by mentor"
                                  >
                                    Reviewed
                                  </Button>
                                ) : isCompleted ? (
                                  <Button
                                    leftIcon={<FaCheckCircle />}
                                    colorScheme="green"
                                    size="sm"
                                    flex={1}
                                    variant="outline"
                                    fontFamily="'Segoe UI', sans-serif"
                                    isDisabled
                                    title="Task completed and finalized"
                                  >
                                    Completed
                                  </Button>
                                ) : (
                                  <Button
                                    leftIcon={<FaCheckCircle />}
                                    colorScheme="blue"
                                    size="sm"
                                    flex={1}
                                    variant="outline"
                                    fontFamily="'Segoe UI', sans-serif"
                                    isDisabled
                                    title="Submitted - awaiting final completion"
                                  >
                                    Submitted
                                  </Button>
                                )}
                                
                                <Button
                                  leftIcon={<FaQuestionCircle />}
                                  variant="outline"
                                  size="sm"
                                  flex={1}
                                  onClick={() => openQueryModal(task)}
                                  fontFamily="'Segoe UI', sans-serif"
                                  colorScheme="purple"
                                  _hover={{ transform: "translateY(-1px)" }}
                                  transition="all 0.2s"
                                >
                                  Ask
                                </Button>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </MotionCard>
                    );
                  })}
                </Grid>
              )}
            </MotionBox>
          </VStack>
        </Box>
      </Box>

      {/* Task Submission Modal */}
      <Modal isOpen={isSubmitOpen} onClose={onSubmitClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
            Submit Task: {selectedTask?.title || 'Loading...'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {!selectedTask ? (
              <Center py={8}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <VStack spacing={4}>
                {!isTaskEditable(selectedTask) && (
                  <Box
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="lg"
                    p={4}
                    w="full"
                  >
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="red.500" />
                      <Text color="red.700" fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                        This task is past its due date and cannot be submitted.
                      </Text>
                    </HStack>
                  </Box>
                )}

                <FormControl>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">Submission Remarks</FormLabel>
                  <Textarea
                    placeholder="Describe your work, challenges faced, and any additional notes..."
                    value={submissionData.remarks}
                    onChange={(e) => setSubmissionData({ ...submissionData, remarks: e.target.value })}
                    rows={4}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">
                    Upload Files <Badge colorScheme="red" fontSize="xs" ml={1}>Required</Badge>
                  </FormLabel>
                  <Box
                    border="2px dashed"
                    borderColor={submissionData.files.length === 0 ? "red.300" : "gray.300"}
                    borderRadius="xl"
                    p={8}
                    textAlign="center"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: submissionData.files.length === 0 ? "red.400" : "blue.400",
                      bg: submissionData.files.length === 0 ? "red.50" : "blue.50",
                    }}
                    position="relative"
                    overflow="hidden"
                    cursor="pointer"
                    animation={submissionData.files.length === 0 ? `${pulse} 2s infinite` : "none"}
                    bg={submissionData.files.length === 0 ? "red.50" : "transparent"}
                  >
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.mp4,.avi,.mov,.mp3,.wav,.csv,.xls,.xlsx,.ppt,.pptx,.txt,.js,.html,.css,.json,.xml"
                      onChange={handleFileChange}
                      position="absolute"
                      top={0}
                      left={0}
                      width="100%"
                      height="100%"
                      opacity={0}
                      cursor="pointer"
                      zIndex={2}
                      isDisabled={!isTaskEditable(selectedTask)}
                    />
                    <VStack spacing={4}>
                      <Box color={submissionData.files.length === 0 ? "red.500" : "blue.500"}>
                        <Icon as={FaCloudUploadAlt} boxSize={10} />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold" fontFamily="'Segoe UI', sans-serif" fontSize="lg">
                          {submissionData.files.length === 0 ? "Files Required - Upload Your Work" : "Drag & Drop Files Here"}
                        </Text>
                        <Text fontSize="sm" color={submissionData.files.length === 0 ? "red.500" : "gray.500"} fontFamily="'Segoe UI', sans-serif" mt={1}>
                          {submissionData.files.length === 0 ? "At least one file is required to submit" : "or click to browse your files"}
                        </Text>
                      </Box>
                      <Badge colorScheme={submissionData.files.length === 0 ? "red" : "blue"} fontFamily="'Segoe UI', sans-serif" fontSize="xs" borderRadius="full">
                        PDF, DOC, IMAGES, ZIP, and more (Max 10MB each)
                      </Badge>
                    </VStack>
                  </Box>

                  {submissionData.files.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="medium" mb={2} fontFamily="'Segoe UI', sans-serif">
                        Selected Files ({submissionData.files.length}):
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {submissionData.files.map((file, index) => (
                          <HStack
                            key={index}
                            bg="gray.50"
                            p={3}
                            borderRadius="lg"
                            justify="space-between"
                            border="1px solid"
                            borderColor="gray.200"
                            transition="all 0.3s"
                            _hover={{
                              bg: "blue.50",
                              borderColor: "blue.200",
                            }}
                          >
                            <HStack overflow="hidden" flex={1}>
                              <Icon as={getFileIcon(file.name)} color={getFileColor(file.name)} />
                              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                <Text
                                  fontSize="sm"
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontWeight="medium"
                                  isTruncated
                                  width="100%"
                                >
                                  {file.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatFileSize(file.size)}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack>
                              {isPreviewable(file.name) && (
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => openFilePreview(file.name, file)}
                                  title="Preview file"
                                >
                                  <FaEye />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeFile(file.name, false)}
                                title="Remove file"
                                >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onSubmitClose} fontFamily="'Segoe UI', sans-serif">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitTask}
              isLoading={isSubmitting}
              leftIcon={<FaPaperPlane />}
              fontFamily="'Segoe UI', sans-serif"
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, purple.600)",
              }}
              isDisabled={!selectedTask || !isTaskEditable(selectedTask) || submissionData.files.length === 0}
              title={submissionData.files.length === 0 ? "Please upload at least one file to submit" : ""}
            >
              Submit Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Submission Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
            Edit Submission: {selectedTask?.title || 'Loading...'}
            {selectedTask && (
              <Text fontSize="sm" color="gray.600" fontWeight="normal" mt={1}>
                You can edit your submission until {formatDate(selectedTask.due_date)}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {!selectedTask ? (
              <Center py={8}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <VStack spacing={4}>
                {!isTaskEditable(selectedTask) && (
                  <Box
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="lg"
                    p={4}
                    w="full"
                  >
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="red.500" />
                      <Text color="red.700" fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                        This task is past its due date and can no longer be edited.
                      </Text>
                    </HStack>
                  </Box>
                )}

                <FormControl>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">Submission Remarks</FormLabel>
                  <Textarea
                    placeholder="Describe your work, challenges faced, and any additional notes..."
                    value={editData.remarks}
                    onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                    rows={4}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">
                    Files <Badge colorScheme="red" fontSize="xs" ml={1}>At least one file required</Badge>
                  </FormLabel>
                  
                  {/* Existing Files Section */}
                  {editData.existingFiles && editData.existingFiles.length > 0 && (
                    <Box mb={4}>
                      <Text fontWeight="medium" mb={2} fontFamily="'Segoe UI', sans-serif" color="green.600">
                        Existing Files ({editData.existingFiles.length}):
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {editData.existingFiles.map((filePath, index) => (
                          <HStack
                            key={index}
                            bg="green.50"
                            p={3}
                            borderRadius="lg"
                            justify="space-between"
                            border="1px solid"
                            borderColor="green.200"
                            _hover={{ bg: "green.100" }}
                            transition="all 0.2s"
                          >
                            <HStack overflow="hidden" flex={1}>
                              <Icon as={getFileIcon(filePath)} color={getFileColor(filePath)} />
                              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                <Text
                                  fontSize="sm"
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontWeight="medium"
                                  isTruncated
                                  width="100%"
                                >
                                  {filePath.split('/').pop() || filePath}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Uploaded previously
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => downloadFile(filePath)}
                                title="Download file"
                              >
                                <FaDownload />
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeExistingFile(filePath)}
                                isDisabled={!isTaskEditable(selectedTask)}
                                title="Remove file"
                              >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Add New Files Section */}
                  <Box
                    border="2px dashed"
                    borderColor={(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.300" : "gray.300"}
                    borderRadius="xl"
                    p={8}
                    textAlign="center"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: (editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.400" : "blue.400",
                      bg: (editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.50" : "blue.50",
                    }}
                    position="relative"
                    overflow="hidden"
                    cursor="pointer"
                    bg={(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.50" : "transparent"}
                  >
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.mp4,.avi,.mov,.mp3,.wav,.csv,.xls,.xlsx,.ppt,.pptx,.txt,.js,.html,.css,.json,.xml"
                      onChange={handleEditFileChange}
                      position="absolute"
                      top={0}
                      left={0}
                      width="100%"
                      height="100%"
                      opacity={0}
                      cursor="pointer"
                      zIndex={2}
                      isDisabled={!isTaskEditable(selectedTask)}
                    />
                    <VStack spacing={4}>
                      <Box color={(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.500" : "blue.500"}>
                        <Icon as={FaCloudUploadAlt} boxSize={10} />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold" fontFamily="'Segoe UI', sans-serif" fontSize="lg">
                          {(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 
                            ? "Files Required - Upload Your Work" 
                            : "Drag & Drop Additional Files"}
                        </Text>
                        <Text fontSize="sm" color={(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.500" : "gray.500"} fontFamily="'Segoe UI', sans-serif" mt={1}>
                          {(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 
                            ? "At least one file is required to update submission" 
                            : "or click to browse your files"}
                        </Text>
                      </Box>
                      <Badge colorScheme={(editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red" : "blue"} fontFamily="'Segoe UI', sans-serif" fontSize="xs" borderRadius="full">
                        PDF, DOC, IMAGES, ZIP, and more (Max 10MB each)
                      </Badge>
                    </VStack>
                  </Box>

                  {editData.files.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="medium" mb={2} fontFamily="'Segoe UI', sans-serif" color="blue.600">
                        New Files to Add ({editData.files.length}):
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {editData.files.map((file, index) => (
                          <HStack
                            key={index}
                            bg="blue.50"
                            p={3}
                            borderRadius="lg"
                            justify="space-between"
                            border="1px solid"
                            borderColor="blue.200"
                            _hover={{ bg: "blue.100" }}
                            transition="all 0.2s"
                          >
                            <HStack overflow="hidden" flex={1}>
                              <Icon as={getFileIcon(file.name)} color={getFileColor(file.name)} />
                              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                <Text
                                  fontSize="sm"
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontWeight="medium"
                                  isTruncated
                                  width="100%"
                                >
                                  {file.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatFileSize(file.size)}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack>
                              {isPreviewable(file.name) && (
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => openFilePreview(file.name, file)}
                                  title="Preview file"
                                >
                                  <FaEye />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeFile(file.name, true)}
                                title="Remove file"
                              >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* File requirement status */}
                  <Box mt={2}>
                    <Text fontSize="sm" color={
                      (editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0 ? "red.500" : "green.500"
                    } fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                      {((editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0)
                        ? "❌ No files selected. At least one file is required."
                        : `✅ ${(editData.existingFiles?.length || 0) + (editData.files?.length || 0)} file(s) ready`}
                    </Text>
                  </Box>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onEditClose} fontFamily="'Segoe UI', sans-serif">
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleEditSubmission}
              isLoading={isSubmitting}
              leftIcon={<FaEdit />}
              fontFamily="'Segoe UI', sans-serif"
              isDisabled={!selectedTask || !isTaskEditable(selectedTask) || ((editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0)}
              title={((editData.existingFiles?.length || 0) + (editData.files?.length || 0) === 0) ? "Please keep at least one file to update submission" : ""}
            >
              Update Submission
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Ask Query Modal */}
      <Modal isOpen={isQueryOpen} onClose={onQueryClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
            Ask Question About: {selectedTask?.title || 'Loading...'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {!selectedTask ? (
              <Center py={8}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">Subject</FormLabel>
                  <Input
                    placeholder="Brief subject of your question..."
                    value={queryData.subject}
                    onChange={(e) => setQueryData({ ...queryData, subject: e.target.value })}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">Priority</FormLabel>
                  <Select
                    value={queryData.priority}
                    onChange={(e) => setQueryData({ ...queryData, priority: e.target.value })}
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

                <FormControl>
                  <FormLabel fontFamily="'Segoe UI', sans-serif">Your Question</FormLabel>
                  <Textarea
                    placeholder="Describe your question in detail..."
                    value={queryData.message}
                    onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
                    rows={6}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                    }}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onQueryClose} fontFamily="'Segoe UI', sans-serif">
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleAskQuery}
              isLoading={isSubmitting}
              leftIcon={<FaPaperPlane />}
              fontFamily="'Segoe UI', sans-serif"
              isDisabled={!selectedTask}
            >
              Send Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh" overflowY="auto">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
            Task Details: {selectedTask?.title || 'Loading...'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {!selectedTask ? (
              <Center py={8}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <VStack spacing={6} align="stretch">
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedTask.status)} fontSize="md" fontFamily="'Segoe UI', sans-serif">
                      {selectedTask.status?.replace('-', ' ').toUpperCase() || 'PENDING'}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Priority</Text>
                    <Badge colorScheme={getPriorityColor(selectedTask.priority)} fontSize="md" fontFamily="'Segoe UI', sans-serif">
                      {selectedTask.priority?.toUpperCase() || 'MEDIUM'}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Due Date</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">
                      {selectedTask.due_date ? formatDate(selectedTask.due_date) : 'Not set'}
                      {getDaysRemaining(selectedTask.due_date) !== null && !shouldShowAsCompleted(selectedTask) && (
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
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Estimated Hours</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">{selectedTask.estimated_hours || 'Not specified'} hours</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Assigned By</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">
                      {selectedTask.mentor_name || selectedTask.assigned_by_name || 'Mentor'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontFamily="'Segoe UI', sans-serif">Category</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">{selectedTask.category || 'General'}</Text>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="bold" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">Description</Text>
                  <Text whiteSpace="pre-wrap" fontFamily="'Segoe UI', sans-serif" bg="gray.50" p={3} borderRadius="lg">
                    {selectedTask.description || 'No description provided'}
                  </Text>
                </Box>

                {selectedTask.resources && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">Resources</Text>
                    <Text whiteSpace="pre-wrap" fontFamily="'Segoe UI', sans-serif" bg="blue.50" p={3} borderRadius="lg">
                      {selectedTask.resources}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="bold" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">Timeline</Text>
                  <HStack justify="space-between" fontFamily="'Segoe UI', sans-serif" bg="purple.50" p={3} borderRadius="lg">
                    <Text fontSize="sm">
                      Assigned: {selectedTask.created_at ? formatDate(selectedTask.created_at) : 'Unknown'}
                    </Text>
                    <Text fontSize="sm">
                      Due: {selectedTask.due_date ? formatDate(selectedTask.due_date) : 'Not set'}
                    </Text>
                  </HStack>
                </Box>

                {submissions[selectedTask.task_id] && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">Submission Details</Text>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" bg="green.50" p={3} borderRadius="lg">
                        <Text fontWeight="medium">Submission Status:</Text>
                        <Badge colorScheme={
                          selectedTask.status === 'reviewed' ? 'purple' :
                          shouldShowAsCompleted(selectedTask) ? 'green' :
                          submissions[selectedTask.task_id].status === 'reviewed' ? 'purple' :
                          submissions[selectedTask.task_id].status === 'rejected' ? 'red' : 'blue'
                        }>
                          {selectedTask.status === 'reviewed' ? 'REVIEWED' :
                           shouldShowAsCompleted(selectedTask) ? 'COMPLETED' : 
                           submissions[selectedTask.task_id].status?.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Box bg="yellow.50" p={3} borderRadius="lg">
                        <Text fontWeight="medium" mb={1}>Remarks:</Text>
                        <Text fontSize="sm">{submissions[selectedTask.task_id].remarks}</Text>
                      </Box>
                      {submissions[selectedTask.task_id].mentor_feedback && (
                        <Box bg="orange.50" p={3} borderRadius="lg">
                          <Text fontWeight="medium" mb={1}>Mentor Feedback:</Text>
                          <Text fontSize="sm" color="gray.700">{submissions[selectedTask.task_id].mentor_feedback}</Text>
                        </Box>
                      )}
                      <Box bg={isTaskEditable(selectedTask) ? "green.50" : "red.50"} p={3} borderRadius="lg">
                        <Text fontWeight="medium" mb={1}>Editing Status:</Text>
                        <Text fontSize="sm" color={isTaskEditable(selectedTask) ? "green.600" : "red.600"}>
                          {isTaskEditable(selectedTask) 
                            ? "✓ You can edit this submission until the due date" 
                            : "✗ Editing is no longer available (past due date)"}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onDetailsClose} fontFamily="'Segoe UI', sans-serif">
              Close
            </Button>
            {/* Show proper button in details modal */}
            {!submissions[selectedTask?.task_id] ? (
              <Button 
                colorScheme="blue" 
                onClick={() => openSubmitModal(selectedTask)}
                fontFamily="'Segoe UI', sans-serif"
                bgGradient="linear(to-r, blue.500, purple.500)"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, purple.600)",
                }}
                isDisabled={!isTaskEditable(selectedTask)}
              >
                Submit Task
              </Button>
            ) : canEditSubmission(selectedTask) ? (
              <Button 
                colorScheme="orange" 
                onClick={() => openEditModal(selectedTask)}
                fontFamily="'Segoe UI', sans-serif"
                leftIcon={<FaEdit />}
              >
                Edit Submission
              </Button>
            ) : selectedTask.status === 'reviewed' ? (
              <Button 
                colorScheme="purple" 
                variant="outline"
                fontFamily="'Segoe UI', sans-serif"
                isDisabled
              >
                Reviewed
              </Button>
            ) : (
              <Button 
                colorScheme="green" 
                variant="outline"
                fontFamily="'Segoe UI', sans-serif"
                isDisabled
              >
                {shouldShowAsCompleted(selectedTask) ? 'Completed' : 'Submitted'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* File Preview Modal */}
      <FilePreviewModal />
    </Box>
  );
}