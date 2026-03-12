import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Center,
  Container,
  HStack,
  VStack,
  Icon,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  Grid,
  GridItem,
  Collapse,
  AspectRatio,
  Textarea,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartPie,
  FaFilter,
  FaInfoCircle,
  FaUserClock,
  FaChevronDown,
  FaChevronUp,
  FaHistory,
  FaDownload,
  FaEye,
  FaFileDownload,
  FaFileAlt,
  FaComments,
  FaStar,
  FaTrophy,
  FaAward,
  FaMedal,
  FaTasks,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaVideo,
  FaMusic,
  FaFileCsv,
  FaFilePowerpoint,
  FaFileExcel,
  FaPaperPlane,
  FaReply,
  FaRegCommentDots
} from "react-icons/fa";

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

// Helper function to determine submission status based on database schema
const determineSubmissionStatus = (submission, taskStatus, dueDate) => {
  const now = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  
  // If submission has marks (reviewed by mentor), it's reviewed
  if (submission.marks !== null && submission.marks !== undefined) {
    return "reviewed";
  }
  
  // If task status from student_tasks table is 'reviewed'
  if (taskStatus === 'reviewed') {
    return "reviewed";
  }
  
  // If submission exists but not reviewed
  if (submission.submission_date) {
    const submissionDate = new Date(submission.submission_date);
    
    // If due date exists and submission was after due date, it's completed
    if (due && submissionDate > due) {
      return "completed";
    }
    
    // If submission was before due date, it's submitted
    return "submitted";
  }
  
  // Check task status from student_tasks table
  if (taskStatus === 'submitted') {
    return "submitted";
  }
  
  if (taskStatus === 'in-progress') {
    return "in-progress";
  }
  
  if (taskStatus === 'completed') {
    return "completed";
  }
  
  // No submission yet - check if due date has passed
  if (due && now > due) {
    return "completed"; // Task is overdue but not submitted
  }
  
  // No submission yet and due date not passed
  return "pending";
};

export default function TaskHistory() {
  const router = useRouter();
  const [submissionsData, setSubmissionsData] = useState([]);
  const [queriesData, setQueriesData] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    dateRange: "all",
    search: "",
    sortBy: "date-desc"
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isQueryOpen, onOpen: onQueryOpen, onClose: onQueryClose } = useDisclosure();
  const { isOpen: isSubmissionOpen, onOpen: onSubmissionOpen, onClose: onSubmissionClose } = useDisclosure();
  
  const [stats, setStats] = useState({
    completed: 0,
    submitted: 0,
    reviewed: 0,
    totalMarks: 0,
    averageMarks: 0,
    pending: 0,
    totalTasks: 0
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("submissions");

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const headerGradient = useColorModeValue("linear(to-r, blue.500, purple.500)", "linear(to-r, blue.300, purple.300)");
  const statCardBg = useColorModeValue("white", "gray.750");
  const filterCardBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.100", "blue.800");

  const isMobile = useBreakpointValue({ base: true, md: false });

  const getStatusColor = (status) => {
    switch (status) {
      case "reviewed": return "purple";
      case "completed": return "green";
      case "submitted": return "blue";
      case "in-progress": return "orange";
      case "pending": return "gray";
      default: return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "reviewed": return FaCheckCircle;
      case "completed": return FaCheckCircle;
      case "submitted": return FaPaperPlane;
      case "in-progress": return FaClock;
      case "pending": return FaClock;
      default: return FaTasks;
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

  const getQueryStatusColor = (status) => {
    switch (status) {
      case "answered": return "green";
      case "closed": return "gray";
      case "open": return "blue";
      default: return "gray";
    }
  };

  const getQueryStatusIcon = (status) => {
    switch (status) {
      case "answered": return FaCheckCircle;
      case "closed": return FaTimesCircle;
      case "open": return FaClock;
      default: return FaComments;
    }
  };

  const calculateStats = useCallback((data) => {
    let reviewed = 0;
    let completed = 0;
    let submitted = 0;
    const pending = data.filter(item => item.status === "pending").length;
    
    // New logic for counting reviewed, completed, and submitted
    data.forEach(item => {
      if (item.status === "reviewed") {
        reviewed++;
        completed++; // Reviewed tasks are also considered completed
        submitted++; // Reviewed tasks are also considered submitted
      } else if (item.status === "completed") {
        completed++;
        // Check if it's also submitted (has submission date)
        if (item.submission_date) {
          submitted++;
        }
      } else if (item.status === "submitted") {
        submitted++;
        // If task is submitted and due date is over, it's also completed
        const now = new Date();
        const dueDate = item.due_date ? new Date(item.due_date) : null;
        if (dueDate && now > dueDate) {
          completed++;
        }
      }
    });

    const submissionsWithMarks = data.filter(item => item.marks !== null && item.marks !== undefined);
    const totalMarks = submissionsWithMarks.reduce((sum, item) => sum + (item.marks || 0), 0);
    const averageMarks = submissionsWithMarks.length > 0 ? Math.round(totalMarks / submissionsWithMarks.length) : 0;

    setStats({
      reviewed,
      completed,
      submitted,
      pending,
      totalMarks,
      averageMarks,
      totalTasks: data.length
    });
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    if (!userId) {
      router.push("/login");
      return;
    }

    setUserId(userId);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch submissions using the same endpoint as tasks page
        const submissionsRes = await fetch(`/api/student/get-submissions?studentId=${userId}`);
        let submissionsData = [];

        if (submissionsRes.ok) {
          const result = await submissionsRes.json();
          submissionsData = result.submissions || [];
          console.log("Submissions data:", submissionsData);
        } else {
          console.error("Failed to fetch submissions:", submissionsRes.status);
        }

        // Fetch queries - try multiple possible endpoints
        let queriesData = [];
        try {
          const queriesRes = await fetch(`/api/student/queries?studentId=${userId}`);
          if (queriesRes.ok) {
            const result = await queriesRes.json();
            queriesData = result.queries || result.data || [];
          } else {
            // Try alternative endpoint
            const altQueriesRes = await fetch(`/api/student/query-history?studentId=${userId}`);
            if (altQueriesRes.ok) {
              const result = await altQueriesRes.json();
              queriesData = result.queries || result.data || [];
            }
          }
        } catch (queryError) {
          console.error("Error fetching queries:", queryError);
        }

        console.log("Queries data:", queriesData);

        // Transform submissions data to match expected format with corrected status logic
        const transformedSubmissions = Object.values(submissionsData).map(submission => {
          // Use the task_status from the database if available, otherwise determine from submission
          const taskStatus = submission.task_status || submission.status;
          const dueDate = submission.task_due_date || submission.due_date;
          const status = determineSubmissionStatus(submission, taskStatus, dueDate);
          
          return {
            submission_id: submission.submission_id,
            task_id: submission.task_id,
            title: submission.task_title || submission.title || 'Task',
            // Extract category from task data, not submission data
            category: submission.task_category || submission.category || 'General',
            status: status,
            priority: submission.task_priority || submission.priority || 'medium',
            submission_date: submission.submission_date,
            due_date: dueDate,
            marks: submission.marks,
            mentor_feedback: submission.mentor_feedback,
            remarks: submission.remarks,
            file_paths: submission.file_paths || [],
            reviewed_by: submission.reviewed_by,
            reviewed_by_name: submission.reviewed_by_name,
            // Include the original task status for reference
            task_status: taskStatus
          };
        });

        setSubmissionsData(transformedSubmissions);
        setFilteredSubmissions(transformedSubmissions);
        calculateStats(transformedSubmissions);

        // Transform queries data to match expected format
        const transformedQueries = queriesData.map(query => ({
          query_id: query.query_id,
          task_id: query.task_id,
          title: query.task_title || 'Task',
          subject: query.subject,
          message: query.message,
          priority: query.priority || 'medium',
          query_date: query.query_date,
          status: query.status || 'open',
          answer: query.answer,
          answer_date: query.answer_date,
          mentor_name: query.mentor_name
        }));

        setQueriesData(transformedQueries);
        setFilteredQueries(transformedQueries);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, calculateStats]);

  useEffect(() => {
    let filtered = [...submissionsData];

    if (filters.status !== "all") {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.submission_date || item.created_at);
        return itemDate >= startDate;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm) ||
        (item.remarks && item.remarks.toLowerCase().includes(searchTerm)) ||
        (item.mentor_feedback && item.mentor_feedback.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.submission_date || a.created_at) - new Date(b.submission_date || b.created_at));
        break;
      case "date-desc":
        filtered.sort((a, b) => new Date(b.submission_date || b.created_at) - new Date(a.submission_date || a.created_at));
        break;
      case "marks-asc":
        filtered.sort((a, b) => (a.marks || 0) - (b.marks || 0));
        break;
      case "marks-desc":
        filtered.sort((a, b) => (b.marks || 0) - (a.marks || 0));
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        break;
      default:
        break;
    }

    setFilteredSubmissions(filtered);
    calculateStats(filtered);
  }, [filters, submissionsData, calculateStats]);

  const viewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionDetails(submission);
    onSubmissionOpen();
  };

  const viewQueryDetails = (query) => {
    setSelectedQuery(query);
    onQueryOpen();
  };

  const downloadFile = (filePath) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    link.click();
  };

  const exportToCSV = () => {
    const headers = "Task Title,Category,Status,Priority,Submission Date,Marks,Mentor Feedback,Remarks\n";
    const csvContent = filteredSubmissions.map(record => {
      return `"${record.title || ''}","${record.category || ''}","${record.status || ''}","${record.priority || ''}","${formatDate(record.submission_date)}","${record.marks || ''}","${(record.mentor_feedback || '').replace(/"/g, '""')}","${(record.remarks || '').replace(/"/g, '""')}"`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getGradeBadge = (marks) => {
    if (marks === null || marks === undefined) return null;
    
    if (marks >= 90) return { color: "green", text: "A+", icon: FaTrophy };
    if (marks >= 80) return { color: "green", text: "A", icon: FaAward };
    if (marks >= 70) return { color: "blue", text: "B", icon: FaMedal };
    if (marks >= 60) return { color: "orange", text: "C", icon: FaStar };
    if (marks >= 50) return { color: "yellow", text: "D", icon: FaStar };
    return { color: "red", text: "F", icon: FaTimesCircle };
  };

  // Centered loading component
  if (loading) {
    return (
      <Box
        minH="100vh"
        bg={subtleBg}
        fontFamily="'Segoe UI', sans-serif"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text fontFamily="'Segoe UI', sans-serif">Loading task history...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={8}>
      <Container maxW="6xl">
        {/* Header with decorative elements */}
        <Box position="relative" mb={8}>
          <AspectRatio ratio={16 / 3} maxH="160px">
            <Box
              bgGradient={headerGradient}
              borderRadius="2xl"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-50px"
                right="-50px"
                w="200px"
                h="200px"
                borderRadius="full"
                bg="whiteAlpha.200"
              />
              <Box
                position="absolute"
                bottom="-30px"
                left="-30px"
                w="150px"
                h="150px"
                borderRadius="full"
                bg="whiteAlpha.200"
              />
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
                direction="column"
                px={8}
                color="white"
                textAlign="center"
              >
                <HStack spacing={3}>
                  <Icon as={FaHistory} boxSize={8} />
                  <Heading size="xl" fontFamily="'Segoe UI', sans-serif">
                    Task History
                  </Heading>
                </HStack>
                <Text mt={2} fontSize="lg" opacity={0.9}>
                  Track your submissions, queries, grades, and mentor feedback
                </Text>
              </Flex>
            </Box>
          </AspectRatio>

          <Button
            position="absolute"
            left={4}
            top={4}
            colorScheme="whiteAlpha"
            variant="solid"
            onClick={() => router.push("/student/tasks")}
            leftIcon={<FaArrowLeft />}
            fontFamily="'Segoe UI', sans-serif"
            borderRadius="full"
            size={isMobile ? "sm" : "md"}
          >
            Back to Tasks
          </Button>

          <Tooltip label="View Statistics" hasArrow>
            <IconButton
              position="absolute"
              right={4}
              top={4}
              aria-label="View Statistics"
              icon={<FaChartPie />}
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={onOpen}
              borderRadius="full"
              size={isMobile ? "sm" : "md"}
            />
          </Tooltip>
        </Box>

        {/* Statistics Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">
              <HStack>
                <Icon as={FaChartPie} color={accentColor} />
                <Text>Task History Statistics</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={4}>
                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Reviewed</StatLabel>
                    <StatNumber color="purple.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.reviewed}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {stats.totalTasks > 0 ? Math.round((stats.reviewed / stats.totalTasks) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={stats.totalTasks > 0 ? (stats.reviewed / stats.totalTasks) * 100 : 0} colorScheme="purple" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Completed</StatLabel>
                    <StatNumber color="green.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.completed}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0} colorScheme="green" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Submitted</StatLabel>
                    <StatNumber color="blue.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.submitted}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {stats.totalTasks > 0 ? Math.round((stats.submitted / stats.totalTasks) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={stats.totalTasks > 0 ? (stats.submitted / stats.totalTasks) * 100 : 0} colorScheme="blue" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Average Marks</StatLabel>
                    <StatNumber color="orange.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.averageMarks}/100
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      Across all graded tasks
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Total Marks</StatLabel>
                    <StatNumber color="green.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.totalMarks}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      Sum of all marks received
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Pending</StatLabel>
                    <StatNumber color="gray.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.pending}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {stats.totalTasks > 0 ? Math.round((stats.pending / stats.totalTasks) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={stats.totalTasks > 0 ? (stats.pending / stats.totalTasks) * 100 : 0} colorScheme="gray" size="sm" mt={2} />
                  </Stat>
                </Card>
              </SimpleGrid>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Submission Details Modal */}
        <Modal isOpen={isSubmissionOpen} onClose={onSubmissionClose} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">
              <HStack>
                <Icon as={FaEye} color={accentColor} />
                <Text>Submission Details</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {submissionDetails && (
                <VStack spacing={6} align="stretch">
                  {/* Task Information */}
                  <Card bg={cardBg} p={4} borderRadius="lg">
                    <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Task Information</Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Task Title</Text>
                        <Text>{submissionDetails.title}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Category</Text>
                        <Tag colorScheme="blue">{submissionDetails.category}</Tag>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Priority</Text>
                        <Badge colorScheme={getPriorityColor(submissionDetails.priority)}>
                          {submissionDetails.priority}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Due Date</Text>
                        <Text>{formatDate(submissionDetails.due_date)}</Text>
                      </Box>
                    </Grid>
                  </Card>

                  {/* Submission Details */}
                  <Card bg={cardBg} p={4} borderRadius="lg">
                    <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Submission Details</Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Submission Date</Text>
                        <Text>{formatDate(submissionDetails.submission_date)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Status</Text>
                        <Badge colorScheme={getStatusColor(submissionDetails.status)}>
                          <HStack spacing={1}>
                            <Icon as={getStatusIcon(submissionDetails.status)} />
                            <Text>{submissionDetails.status}</Text>
                          </HStack>
                        </Badge>
                      </Box>
                      {submissionDetails.marks && (
                        <>
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Marks</Text>
                            <HStack>
                              <Text fontSize="xl" fontWeight="bold" color="green.500">
                                {submissionDetails.marks}/100
                              </Text>
                              {getGradeBadge(submissionDetails.marks) && (
                                <Badge colorScheme={getGradeBadge(submissionDetails.marks).color}>
                                  <HStack spacing={1}>
                                    <Icon as={getGradeBadge(submissionDetails.marks).icon} />
                                    <Text>{getGradeBadge(submissionDetails.marks).text}</Text>
                                  </HStack>
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Reviewed By</Text>
                            <Text>{submissionDetails.reviewed_by_name || submissionDetails.reviewed_by || 'Mentor'}</Text>
                          </Box>
                        </>
                      )}
                    </Grid>
                  </Card>

                  {/* Remarks and Feedback */}
                  <Card bg={cardBg} p={4} borderRadius="lg">
                    <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Remarks & Feedback</Heading>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" color="gray.600" mb={2}>Your Remarks</Text>
                        <Textarea
                          value={submissionDetails.remarks || 'No remarks provided'}
                          isReadOnly
                          rows={3}
                          bg="gray.50"
                        />
                      </Box>
                      {submissionDetails.mentor_feedback && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Mentor Feedback</Text>
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Feedback from Mentor</AlertTitle>
                              <AlertDescription>
                                {submissionDetails.mentor_feedback}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        </Box>
                      )}
                    </VStack>
                  </Card>

                  {/* Submitted Files */}
                  {submissionDetails.file_paths && submissionDetails.file_paths.length > 0 && (
                    <Card bg={cardBg} p={4} borderRadius="lg">
                      <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Submitted Files</Heading>
                      <VStack spacing={2} align="stretch">
                        {submissionDetails.file_paths.map((filePath, index) => {
                          const fileName = filePath.split('/').pop();
                          return (
                            <HStack
                              key={index}
                              p={3}
                              bg="gray.50"
                              borderRadius="md"
                              justify="space-between"
                              _hover={{ bg: "gray.100" }}
                            >
                              <HStack>
                                <Icon as={getFileIcon(fileName)} color={getFileColor(fileName)} />
                                <Text fontFamily="'Segoe UI', sans-serif">{fileName}</Text>
                              </HStack>
                              <Button
                                size="sm"
                                leftIcon={<FaFileDownload />}
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => downloadFile(filePath)}
                              >
                                Download
                              </Button>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </Card>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Query Details Modal */}
        <Modal isOpen={isQueryOpen} onClose={onQueryClose} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">
              <HStack>
                <Icon as={FaComments} color={accentColor} />
                <Text>Query Details</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedQuery && (
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} p={4} borderRadius="lg">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Task</Text>
                        <Text>{selectedQuery.title}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Priority</Text>
                        <Badge colorScheme={getPriorityColor(selectedQuery.priority)}>
                          {selectedQuery.priority}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Query Date</Text>
                        <Text>{formatDate(selectedQuery.query_date)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">Status</Text>
                        <Badge colorScheme={getQueryStatusColor(selectedQuery.status)}>
                          <HStack spacing={1}>
                            <Icon as={getQueryStatusIcon(selectedQuery.status)} />
                            <Text>{selectedQuery.status}</Text>
                          </HStack>
                        </Badge>
                      </Box>
                    </Grid>
                  </Card>

                  <Card bg={cardBg} p={4} borderRadius="lg">
                    <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Query Information</Heading>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" color="gray.600" mb={2}>Subject</Text>
                        <Text fontSize="lg" fontWeight="medium">{selectedQuery.subject}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600" mb={2}>Your Message</Text>
                        <Textarea
                          value={selectedQuery.message}
                          isReadOnly
                          rows={4}
                          bg="gray.50"
                        />
                      </Box>
                    </VStack>
                  </Card>

                  {selectedQuery.answer && (
                    <Card bg={cardBg} p={4} borderRadius="lg">
                      <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Mentor Response</Heading>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Answer</Text>
                          <Alert status="success" borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Response from Mentor</AlertTitle>
                              <AlertDescription>
                                {selectedQuery.answer}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        </Box>
                        {selectedQuery.answer_date && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Answered On</Text>
                            <Text>{formatDate(selectedQuery.answer_date)}</Text>
                          </Box>
                        )}
                        {selectedQuery.mentor_name && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Answered By</Text>
                            <Text>{selectedQuery.mentor_name}</Text>
                          </Box>
                        )}
                      </VStack>
                    </Card>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaCheckCircle} boxSize={16} color="purple.500" />
            </Box>
            <VStack>
              <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaCheckCircle} boxSize={3} />
                  <Text>Reviewed</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500" fontFamily="'Segoe UI', sans-serif">
                {stats.reviewed}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
            </Box>
            <VStack>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaCheckCircle} boxSize={3} />
                  <Text>Completed</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="green.500" fontFamily="'Segoe UI', sans-serif">
                {stats.completed}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaPaperPlane} boxSize={16} color="blue.500" />
            </Box>
            <VStack>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaPaperPlane} boxSize={3} />
                  <Text>Submitted</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500" fontFamily="'Segoe UI', sans-serif">
                {stats.submitted}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaStar} boxSize={16} color="orange.500" />
            </Box>
            <VStack>
              <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaStar} boxSize={3} />
                  <Text>Avg Marks</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500" fontFamily="'Segoe UI', sans-serif">
                {stats.averageMarks}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaUserClock} boxSize={16} color="gray.500" />
            </Box>
            <VStack>
              <Badge colorScheme="gray" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaUserClock} boxSize={3} />
                  <Text>Pending</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                {stats.pending}
              </Text>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Tabs for Submissions and Queries */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" mb={6}>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab fontFamily="'Segoe UI', sans-serif">
                <HStack spacing={2}>
                  <Icon as={FaPaperPlane} />
                  <Text>Submissions ({submissionsData.length})</Text>
                </HStack>
              </Tab>
              <Tab fontFamily="'Segoe UI', sans-serif">
                <HStack spacing={2}>
                  <Icon as={FaComments} />
                  <Text>Queries ({queriesData.length})</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {/* Enhanced Filters Section */}
                <Card bg={filterCardBg} mb={6} p={4} borderRadius="2xl" boxShadow="lg" border="1px solid" borderColor={borderColor}>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center" cursor="pointer" onClick={() => setShowFilters(!showFilters)}>
                      <Heading size="md" fontFamily="'Segoe UI', sans-serif">
                        <HStack>
                          <Icon as={FaFilter} color="blue.500" />
                          <Text>Filters & Options</Text>
                        </HStack>
                      </Heading>
                      <HStack>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilters({ status: "all", priority: "all", dateRange: "all", search: "", sortBy: "date-desc" });
                          }}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Clear All
                        </Button>
                        <Icon as={showFilters ? FaChevronUp : FaChevronDown} color="blue.500" />
                      </HStack>
                    </Flex>

                    <Collapse in={showFilters} animateOpacity>
                      <VStack spacing={4} align="stretch">
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                          <GridItem>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Status</Text>
                              <Select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                borderRadius="lg"
                                fontFamily="'Segoe UI', sans-serif"
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                              >
                                <option value="all">All Status</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="completed">Completed</option>
                                <option value="submitted">Submitted</option>
                                <option value="in-progress">In Progress</option>
                                <option value="pending">Pending</option>
                              </Select>
                            </VStack>
                          </GridItem>

                          <GridItem>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Priority</Text>
                              <Select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                borderRadius="lg"
                                fontFamily="'Segoe UI', sans-serif"
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                              >
                                <option value="all">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </Select>
                            </VStack>
                          </GridItem>

                          <GridItem>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Date Range</Text>
                              <Select
                                value={filters.dateRange}
                                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                borderRadius="lg"
                                fontFamily="'Segoe UI', sans-serif"
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                              >
                                <option value="all">All Time</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="quarter">Last 3 Months</option>
                                <option value="year">Last Year</option>
                              </Select>
                            </VStack>
                          </GridItem>
                        </Grid>

                        <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={4}>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FaSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search by task title, description, remarks, or feedback..."
                              value={filters.search}
                              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                              borderRadius="lg"
                              fontFamily="'Segoe UI', sans-serif"
                              bg="white"
                              _dark={{ bg: "gray.700" }}
                            />
                          </InputGroup>

                          <Select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            borderRadius="lg"
                            fontFamily="'Segoe UI', sans-serif"
                            bg="white"
                            _dark={{ bg: "gray.700" }}
                          >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="marks-desc">Highest Marks</option>
                            <option value="marks-asc">Lowest Marks</option>
                            <option value="priority">By Priority</option>
                          </Select>
                        </Grid>
                      </VStack>
                    </Collapse>
                  </VStack>
                </Card>

                {/* Results Count and Actions */}
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                  <HStack>
                    <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontWeight="medium">
                      Showing {filteredSubmissions.length} of {submissionsData.length} submissions
                    </Text>
                    <Badge colorScheme={filteredSubmissions.length === submissionsData.length ? "gray" : "blue"} fontFamily="'Segoe UI', sans-serif">
                      {filteredSubmissions.length === submissionsData.length ? "No filters" : "Filtered"}
                    </Badge>
                  </HStack>

                  <HStack spacing={3}>
                    <HStack>
                      <Icon as={FaInfoCircle} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                        Last updated: {new Date().toLocaleDateString('en-GB')}
                      </Text>
                    </HStack>

                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<FaDownload />}
                      onClick={exportToCSV}
                      fontFamily="'Segoe UI', sans-serif"
                      borderRadius="lg"
                    >
                      Export CSV
                    </Button>
                  </HStack>
                </Flex>

                {/* Submissions Table - Date only, no timestamp */}
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerGradient}>
                      <Tr>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Task Title</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Category</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Status</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Priority</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Submission Date</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Marks</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Feedback</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredSubmissions.length === 0 ? (
                        <Tr>
                          <Td colSpan={8} textAlign="center" py={12}>
                            <VStack spacing={3}>
                              <Icon as={FaTasks} boxSize={10} color="gray.400" />
                              <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontSize="lg">
                                No submission records found
                              </Text>
                              <Text fontFamily="'Segoe UI', sans-serif" color="gray.500">
                                Try adjusting your filters or search term
                              </Text>
                              <Button
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => setFilters({ status: "all", priority: "all", dateRange: "all", search: "", sortBy: "date-desc" })}
                                fontFamily="'Segoe UI', sans-serif"
                                size="sm"
                                mt={2}
                              >
                                Clear all filters
                              </Button>
                            </VStack>
                          </Td>
                        </Tr>
                      ) : (
                        filteredSubmissions.map((record) => (
                          <Tr key={record.submission_id} _hover={{ bg: subtleBg }} transition="all 0.2s">
                            <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                              <Text noOfLines={2}>{record.title}</Text>
                            </Td>
                            <Td>
                              <Tag colorScheme="blue" fontFamily="'Segoe UI', sans-serif" borderRadius="full">
                                {record.category}
                              </Tag>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getStatusColor(record.status)}
                                fontFamily="'Segoe UI', sans-serif"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="sm"
                              >
                                <HStack spacing={1} justify="center">
                                  <Icon as={getStatusIcon(record.status)} boxSize={3} />
                                  <Text>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</Text>
                                </HStack>
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getPriorityColor(record.priority)}
                                fontFamily="'Segoe UI', sans-serif"
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                {record.priority}
                              </Badge>
                            </Td>
                            <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                              {formatDate(record.submission_date)}
                            </Td>
                            <Td>
                              {record.marks ? (
                                <HStack spacing={2}>
                                  <Text fontFamily="'Segoe UI', sans-serif" fontWeight="bold" color="green.500">
                                    {record.marks}/100
                                  </Text>
                                  {getGradeBadge(record.marks) && (
                                    <Badge colorScheme={getGradeBadge(record.marks).color} fontSize="xs">
                                      <HStack spacing={1}>
                                        <Icon as={getGradeBadge(record.marks).icon} boxSize={2} />
                                        <Text>{getGradeBadge(record.marks).text}</Text>
                                      </HStack>
                                    </Badge>
                                  )}
                                </HStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                  Not graded
                                </Text>
                              )}
                            </Td>
                            <Td>
                              {record.mentor_feedback ? (
                                <Tooltip label={record.mentor_feedback} hasArrow>
                                  <Badge colorScheme="blue" cursor="pointer" fontFamily="'Segoe UI', sans-serif">
                                    <HStack spacing={1}>
                                      <Icon as={FaRegCommentDots} />
                                      <Text>View Feedback</Text>
                                    </HStack>
                                  </Badge>
                                </Tooltip>
                              ) : (
                                <Text fontSize="sm" color="gray.500">-</Text>
                              )}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="View submission details" hasArrow>
                                  <IconButton
                                    icon={<FaEye />}
                                    aria-label="View details"
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => viewSubmissionDetails(record)}
                                  />
                                </Tooltip>
                                {record.file_paths && record.file_paths.length > 0 && (
                                  <Tooltip label="Download files" hasArrow>
                                    <IconButton
                                      icon={<FaFileDownload />}
                                      aria-label="Download files"
                                      size="sm"
                                      colorScheme="green"
                                      variant="ghost"
                                      onClick={() => record.file_paths.forEach(file => downloadFile(file))}
                                    />
                                  </Tooltip>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              <TabPanel>
                {/* Queries Table - Date only, no timestamp */}
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerGradient}>
                      <Tr>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Task Title</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Subject</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Priority</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Query Date</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Status</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Answer Date</Th>
                        <Th color="black" fontFamily="'Segoe UI', sans-serif">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {queriesData.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={12}>
                            <VStack spacing={3}>
                              <Icon as={FaComments} boxSize={10} color="gray.400" />
                              <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontSize="lg">
                                No query records found
                              </Text>
                              <Text fontFamily="'Segoe UI', sans-serif" color="gray.500">
                                You haven&apos;t submitted any queries yet
                              </Text>
                              <Button
                                colorScheme="blue"
                                onClick={() => router.push("/student/tasks")}
                                fontFamily="'Segoe UI', sans-serif"
                                size="sm"
                                mt={2}
                              >
                                Go to Tasks
                              </Button>
                            </VStack>
                          </Td>
                        </Tr>
                      ) : (
                        queriesData.map((query) => (
                          <Tr key={query.query_id} _hover={{ bg: subtleBg }} transition="all 0.2s">
                            <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                              <Text noOfLines={2}>{query.title}</Text>
                            </Td>
                            <Td fontFamily="'Segoe UI', sans-serif">
                              <Text noOfLines={2}>{query.subject}</Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getPriorityColor(query.priority)}
                                fontFamily="'Segoe UI', sans-serif"
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                {query.priority}
                              </Badge>
                            </Td>
                            <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                              {formatDate(query.query_date)}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getQueryStatusColor(query.status)}
                                fontFamily="'Segoe UI', sans-serif"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="sm"
                              >
                                <HStack spacing={1} justify="center">
                                  <Icon as={getQueryStatusIcon(query.status)} boxSize={3} />
                                  <Text>{query.status.charAt(0).toUpperCase() + query.status.slice(1)}</Text>
                                </HStack>
                              </Badge>
                            </Td>
                            <Td fontFamily="'Segoe UI', sans-serif">
                              {query.answer_date ? formatDate(query.answer_date) : '-'}
                            </Td>
                            <Td>
                              <Tooltip label="View query details" hasArrow>
                                <IconButton
                                  icon={<FaEye />}
                                  aria-label="View query details"
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => viewQueryDetails(query)}
                                />
                              </Tooltip>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}