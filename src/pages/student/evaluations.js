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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Center,
  keyframes,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Wrap,
  WrapItem,
  Tag,
  Input,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  FaTasks,
  FaCheckCircle,
  FaStar,
  FaTrophy,
  FaAward,
  FaChartLine,
  FaUserTie,
  FaComments,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaExclamationTriangle,
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
  FaTimes,
  FaRocket,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaHandshake,
  FaArrowLeft,
  FaPhone,
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

// File type icon mapping
const getFileIcon = (fileName) => {
  if (!fileName) return FaFileAlt;
  const extension = fileName.split('.').pop()?.toLowerCase();
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
  if (!fileName) return 'gray.500';
  const extension = fileName.split('.').pop()?.toLowerCase();
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

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'approved': case 'completed': case 'reviewed': case 'answered': return 'green';
    case 'submitted': case 'open': return 'blue';
    case 'pending': return 'orange';
    case 'rejected': return 'red';
    default: return 'gray';
  }
};

// Get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    case 'low': return 'green';
    default: return 'gray';
  }
};

// Get marks color based on score (without percentage)
const getMarksColor = (marks) => {
  if (!marks && marks !== 0) return 'gray.500';
  if (marks >= 90) return 'green.500';
  if (marks >= 80) return 'blue.500';
  if (marks >= 70) return 'orange.500';
  if (marks >= 60) return 'yellow.500';
  return 'red.500';
};

// Get performance level
const getPerformanceLevel = (marks) => {
  if (!marks && marks !== 0) return { level: 'No Data', color: 'gray', icon: FaChartLine };
  if (marks >= 90) return { level: 'Excellent', color: 'green', icon: FaTrophy };
  if (marks >= 80) return { level: 'Very Good', color: 'blue', icon: FaAward };
  if (marks >= 70) return { level: 'Good', color: 'orange', icon: FaStar };
  if (marks >= 60) return { level: 'Satisfactory', color: 'yellow', icon: FaCheckCircle };
  return { level: 'Needs Improvement', color: 'red', icon: FaExclamationTriangle };
};

// Check if internship has started - FIXED VERSION
const checkInternshipStarted = (startDate) => {
  if (!startDate) return false;
  try {
    const start = new Date(startDate);
    const today = new Date();
    
    // Set both dates to start of day for accurate comparison
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return startDateOnly <= todayDateOnly;
  } catch (error) {
    console.error('Error checking internship start date:', error);
    return false;
  }
};

// Helper function to get file paths from task submission
const getTaskSubmissionFiles = (submission) => {
  // Handle different possible file path structures
  if (!submission) return [];
  
  // Case 1: Direct file_path field
  if (submission.file_path) {
    return Array.isArray(submission.file_path) ? submission.file_path : [submission.file_path];
  }
  
  // Case 2: file_paths field (like deliverables)
  if (submission.file_paths) {
    return Array.isArray(submission.file_paths) ? submission.file_paths : [submission.file_paths];
  }
  
  // Case 3: submission_files field
  if (submission.submission_files) {
    return Array.isArray(submission.submission_files) ? submission.submission_files : [submission.submission_files];
  }
  
  // Case 4: attachments field
  if (submission.attachments) {
    return Array.isArray(submission.attachments) ? submission.attachments : [submission.attachments];
  }
  
  return [];
};

export default function MentorEvaluation() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [taskQueries, setTaskQueries] = useState([]);
  const [mentorInfo, setMentorInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);

  // Mentor allocation state
  const [mentorAllocated, setMentorAllocated] = useState(null);
  const [internshipStarted, setInternshipStarted] = useState(false);
  const [internshipInfo, setInternshipInfo] = useState(null);

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // Filter functions
  const filterTaskSubmissions = (submissions) => {
    let filtered = Array.isArray(submissions) ? submissions : [];

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.mentor_feedback?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    return filtered;
  };

  const filterDeliverables = (deliverables) => {
    let filtered = Array.isArray(deliverables) ? deliverables : [];

    if (searchTerm) {
      filtered = filtered.filter(deliverable =>
        deliverable.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliverable.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(deliverable => deliverable.status === statusFilter);
    }

    return filtered;
  };

  const filterQueries = (queries) => {
    let filtered = Array.isArray(queries) ? queries : [];

    if (searchTerm) {
      filtered = filtered.filter(query =>
        query.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.answer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(query => query.status === statusFilter);
    }

    return filtered;
  };

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

  // Calculate overall statistics
  const calculateStats = () => {
    const submissionsArray = Array.isArray(taskSubmissions) ? taskSubmissions : [];
    const deliverablesArray = Array.isArray(deliverables) ? deliverables : [];
    const queriesArray = Array.isArray(taskQueries) ? taskQueries : [];
    
    const totalTasks = submissionsArray.length;
    const reviewedTasks = submissionsArray.filter(ts => 
      ts.status === 'reviewed' || ts.status === 'completed'
    ).length;
    
    const totalDeliverables = deliverablesArray.length;
    const reviewedDeliverables = deliverablesArray.filter(d => 
      d.status === 'reviewed' || d.status === 'approved'
    ).length;
    
    const taskMarks = submissionsArray
      .filter(ts => ts.marks !== null && ts.marks !== undefined)
      .map(ts => ts.marks);
    
    const deliverableMarks = deliverablesArray
      .filter(d => d.marks !== null && d.marks !== undefined)
      .map(d => d.marks);
    
    const allMarks = [...taskMarks, ...deliverableMarks];
    const averageMarks = allMarks.length > 0 ? 
      allMarks.reduce((sum, mark) => sum + mark, 0) / allMarks.length : 0;
    
    const answeredQueries = queriesArray.filter(q => q.status === 'answered').length;
    const totalQueries = queriesArray.length;

    return {
      totalTasks,
      reviewedTasks,
      totalDeliverables,
      reviewedDeliverables,
      averageMarks: Math.round(averageMarks * 10) / 10,
      answeredQueries,
      totalQueries,
      performance: getPerformanceLevel(averageMarks)
    };
  };

  // Fetch data - FIXED useEffect with proper dependencies
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    
    try {
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      
      if (!userId) {
        router.push('/login');
        return;
      }

      // Set basic user data first
      const userData = {
        user_id: userId,
        user_role: userRole,
        name: "",
        email: ""
      };
      
      setUser(userData);

      // Fetch student application data from applications table
      const applicationResponse = await fetch(`/api/student/get-application?userId=${userId}`);
      
      if (applicationResponse.ok) {
        const applicationData = await applicationResponse.json();
        console.log('Application data fetched:', applicationData);
        
        setStudentInfo({
          student_id: applicationData.student_id || userId,
          student_number: userId,
          full_name: applicationData.full_name,
          email: applicationData.email,
          college: applicationData.college,
          branch: applicationData.branch,
          year_of_study: applicationData.year_of_study,
          internship_start_date: applicationData.start_date,
          internship_end_date: applicationData.end_date
        });

        // Check internship status with FIXED function
        const internshipStarted = checkInternshipStarted(applicationData.start_date);
        console.log('Internship start check:', {
          startDate: applicationData.start_date,
          internshipStarted,
          today: new Date().toISOString().split('T')[0]
        });
        
        setInternshipStarted(internshipStarted);
        setInternshipInfo({
          start_date: applicationData.start_date,
          end_date: applicationData.end_date
        });
        
        // Update user data with application info
        setUser(prevUser => ({
          ...prevUser,
          name: applicationData.full_name || prevUser.name,
          email: applicationData.email || prevUser.email
        }));

        // Check mentor allocation from application
        const isMentorAllocated = applicationData.mentor && 
          applicationData.mentor !== 'Not assigned' &&
          applicationData.mentor !== 'N/A' &&
          applicationData.mentor !== 'undefined' &&
          !applicationData.mentor.toLowerCase().includes('not assigned');
        
        setMentorAllocated(isMentorAllocated);
        
        if (isMentorAllocated) {
          // Fetch detailed mentor information from mentor_profiles table
          try {
            const mentorResponse = await fetch(`/api/student/get-mentor-by-student?studentId=${userId}`);
            
            if (mentorResponse.ok) {
              const mentorData = await mentorResponse.json();
              console.log('Mentor details fetched:', mentorData);
              
              setMentorInfo({
                name: mentorData.name,
                email: mentorData.email,
                phone: mentorData.contact_no,
                designation: mentorData.designation,
                area_of_expertise: mentorData.area_of_expertise,
                years_of_experience: mentorData.years_of_experience,
                bio: mentorData.bio,
                status: 'assigned'
              });
            } else {
              // Fallback: Use basic info from application if mentor profile not found
              console.warn('Mentor profile not found, using basic info');
              setMentorInfo({
                name: applicationData.mentor,
                email: 'Contact via platform',
                phone: 'N/A',
                designation: 'Industry Expert',
                area_of_expertise: 'Not specified',
                status: 'assigned'
              });
            }
          } catch (error) {
            console.error('Error fetching mentor details:', error);
            // Fallback
            setMentorInfo({
              name: applicationData.mentor,
              email: 'Contact via platform',
              phone: 'N/A',
              designation: 'Industry Expert',
              area_of_expertise: 'Not specified',
              status: 'assigned'
            });
          }
        }

        // Fetch all other data in parallel only if mentor is allocated
        if (isMentorAllocated) {
          const [submissionsResponse, deliverablesResponse, queriesResponse] = await Promise.allSettled([
            fetch(`/api/student/evaluation-submissions?studentId=${userId}`),
            fetch(`/api/student/evaluation-deliverables?studentId=${userId}`),
            fetch(`/api/student/evaluation-queries?studentId=${userId}`)
          ]);

          // Process task submissions
          if (submissionsResponse.status === 'fulfilled' && submissionsResponse.value.ok) {
            const submissionsData = await submissionsResponse.value.json();
            const submissionsArray = Array.isArray(submissionsData) 
              ? submissionsData 
              : (Array.isArray(submissionsData.submissions) 
                ? submissionsData.submissions 
                : Object.values(submissionsData.submissions || {}));
            
            console.log('Raw task submissions data:', submissionsArray);
            setTaskSubmissions(submissionsArray);
          } else {
            console.warn('Failed to fetch task submissions');
            setTaskSubmissions([]);
          }

          // Process deliverables
          if (deliverablesResponse.status === 'fulfilled' && deliverablesResponse.value.ok) {
            const deliverablesData = await deliverablesResponse.value.json();
            const deliverablesArray = Array.isArray(deliverablesData) 
              ? deliverablesData 
              : (Array.isArray(deliverablesData.deliverables) 
                ? deliverablesData.deliverables 
                : []);
            setDeliverables(deliverablesArray);
          } else {
            console.warn('Failed to fetch deliverables');
            setDeliverables([]);
          }

          // Process task queries
          if (queriesResponse.status === 'fulfilled' && queriesResponse.value.ok) {
            const queriesData = await queriesResponse.value.json();
            const queriesArray = Array.isArray(queriesData) 
              ? queriesData 
              : (Array.isArray(queriesData.queries) 
                ? queriesData.queries 
                : []);
            setTaskQueries(queriesArray);
          } else {
            console.warn('Failed to fetch task queries');
            setTaskQueries([]);
          }
        }

      } else {
        console.warn('Failed to fetch application data');
        // Set default student info
        setStudentInfo({
          student_id: 'Not Available',
          student_number: userId,
          full_name: 'Not Available',
          email: 'Not Available',
          college: 'Not Available',
          branch: 'Not Available',
          year_of_study: 'Not Available',
          internship_start_date: null,
          internship_end_date: null
        });
        setMentorAllocated(false);
      }

    } catch (error) {
      console.error('Error fetching evaluation data:', error);
      showToast({
        title: "Loading Error 🚨",
        description: "Failed to load evaluation data. Please try refreshing the page.",
        status: "error",
        emoji: "😵",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open details modal
  const openDetailsModal = (item, type) => {
    setSelectedItem({ ...item, type });
    onDetailsOpen();
  };

  // Download file function
  const downloadFile = (filePath) => {
    if (!filePath) return;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || 'file';
    link.click();
  };

  // Show mentor not allocated message
  if (!mentorAllocated && !loading) {
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
                  You cannot view evaluations until a mentor has been assigned to you.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait for our team to allocate a mentor to your account. Once a mentor is assigned, 
                  you&apos;ll be able to view your evaluations and feedback through this portal.
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  You can view evaluations only after a mentor is allocated to you.
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

  // Show internship not started message
  if (!internshipStarted && mentorAllocated && !loading) {
    console.log('Internship not started - showing message', {
      internshipStarted,
      mentorAllocated,
      loading,
      startDate: internshipInfo?.start_date,
      today: new Date().toISOString().split('T')[0]
    });

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
            {internshipInfo ? `You can mark attendance starting from ${formatDate(internshipInfo.start_date)}` : "Your internship has not started yet."}
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

  // Show loading state
  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #D69E2E 0%, #B7791F 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaStar} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="yellow.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading evaluation portal...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  // Show main content if mentor is allocated and internship has started
  if (mentorAllocated === true && internshipStarted) {
    const stats = calculateStats();
    const filteredSubmissions = filterTaskSubmissions(taskSubmissions);
    const filteredDeliverables = filterDeliverables(deliverables);
    const filteredQueries = filterQueries(taskQueries);

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
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
              >
                Back to Dashboard
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
                  borderColor={borderColor}
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "6px",
                    bgGradient: "linear(to-r, blue.500, purple.500, pink.500)",
                    backgroundSize: "300% 300%",
                    animation: `${gradient} 3s ease infinite`,
                  }}
                >
                  <CardBody p={8}>
                    <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={6}>
                      <Box flex={1}>
                        <Heading
                          color="gray.800"
                          fontFamily="'Segoe UI', sans-serif"
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="700"
                          mb={3}
                        >
                        <Box as="span" mr={2}>
                          📊
                        </Box>
                        <Box
                          as="span"
                          bgGradient="linear(to-r, blue.600, purple.600)"
                          bgClip="text"
                        >
                           Mentor Evaluation Portal
                        </Box>
                        </Heading>
                        <Text color="gray.600" fontSize="lg" fontFamily="'Segoe UI', sans-serif" mb={4}>
                          Track your academic progress, mentor feedback, and performance evaluations
                        </Text>
                        
                        {/* Performance Badge */}
                        <HStack spacing={4} flexWrap="wrap">
                          <Badge
                            colorScheme={stats.performance.color}
                            fontSize="md"
                            px={4}
                            py={2}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            boxShadow="md"
                          >
                            <Icon as={stats.performance.icon} />
                            {stats.performance.level} Performance
                          </Badge>
                          <Badge 
                            colorScheme="blue" 
                            fontSize="md" 
                            px={3} 
                            py={1} 
                            borderRadius="full"
                            boxShadow="md"
                          >
                            📈 Avg Score: {stats.averageMarks}
                          </Badge>
                        </HStack>
                      </Box>
                      <Box
                        animation={`${float} 4s ease-in-out infinite`}
                        fontSize="6xl"
                        textAlign="center"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                      >
                        🎓
                      </Box>
                    </Flex>
                  </CardBody>
                </Card>
              </MotionBox>

              {/* Statistics Overview */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                  {[
                    { 
                      label: "Task Evaluations", 
                      value: `${stats.reviewedTasks}/${stats.totalTasks}`,
                      help: `${stats.totalTasks > 0 ? Math.round((stats.reviewedTasks / stats.totalTasks) * 100) : 0}% Reviewed`,
                      color: "blue",
                      icon: FaTasks
                    },
                    { 
                      label: "Deliverable Evaluations", 
                      value: `${stats.reviewedDeliverables}/${stats.totalDeliverables}`,
                      help: `${stats.totalDeliverables > 0 ? Math.round((stats.reviewedDeliverables / stats.totalDeliverables) * 100) : 0}% Reviewed`,
                      color: "green",
                      icon: FaFileAlt
                    },
                    { 
                      label: "Average Score", 
                      value: `${stats.averageMarks}`,
                      help: "Overall Performance",
                      color: getMarksColor(stats.averageMarks).split('.')[0],
                      icon: FaChartLine
                    },
                    { 
                      label: "Queries Answered", 
                      value: `${stats.answeredQueries}/${stats.totalQueries}`,
                      help: `${stats.totalQueries > 0 ? Math.round((stats.answeredQueries / stats.totalQueries) * 100) : 0}% Resolved`,
                      color: "orange",
                      icon: FaComments
                    }
                  ].map((stat, index) => (
                    <MotionCard
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={`${stat.color}.100`}
                      borderRadius="xl"
                      boxShadow="lg"
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        boxShadow: "xl",
                        borderColor: `${stat.color}.200`
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        height="4px"
                        bgGradient={`linear(to-r, ${stat.color}.400, ${stat.color}.600)`}
                      />
                      <CardBody pt={6}>
                        <HStack justify="space-between" mb={2}>
                          <Text color="gray.600" fontFamily="'Segoe UI', sans-serif" fontSize="sm">
                            {stat.label}
                          </Text>
                          <Icon as={stat.icon} color={`${stat.color}.500`} />
                        </HStack>
                        <Text 
                          color={`${stat.color}.600`} 
                          fontFamily="'Segoe UI', sans-serif"
                          fontSize="2xl"
                          fontWeight="bold"
                        >
                          {stat.value}
                        </Text>
                        <Text fontFamily="'Segoe UI', sans-serif" mt={2} fontSize="sm" color="gray.500">
                          {stat.help}
                        </Text>
                      </CardBody>
                    </MotionCard>
                  ))}
                </Grid>
              </MotionBox>

              {/* Student & Mentor Info */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  boxShadow="xl"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Header */}
                  <Box
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    color="white"
                    px={6}
                    py={4}
                  >
                    <HStack spacing={3}>
                      <Icon as={FaUserGraduate} boxSize={5} />
                      <Heading size="md" fontFamily="'Segoe UI', sans-serif">
                        Academic Profile & Mentorship
                      </Heading>
                    </HStack>
                  </Box>

                  <CardBody p={6}>
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                      {/* Student Information */}
                      <Box>
                        <HStack spacing={3} mb={4}>
                          <Box
                            p={2}
                            borderRadius="lg"
                            bg="blue.50"
                            color="blue.600"
                          >
                            <Icon as={FaUserGraduate} boxSize={5} />
                          </Box>
                          <Heading size="md" color="blue.700" fontFamily="'Segoe UI', sans-serif">
                            Student Profile
                          </Heading>
                        </HStack>
                        
                        <VStack align="stretch" spacing={4}>
                          <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Full Name</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" color="blue.700" fontWeight="medium">
                                {studentInfo?.full_name || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Student ID</Text>
                              <Badge colorScheme="blue" fontFamily="'Segoe UI', sans-serif" fontSize="sm">
                                {studentInfo?.student_id || 'N/A'}
                              </Badge>
                            </HStack>
                          </Box>

                          <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Email Address</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm" color="blue.700">
                                {studentInfo?.email || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">College</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm" color="blue.700">
                                {studentInfo?.college || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Academic Status</Text>
                              <Badge colorScheme="green" fontFamily="'Segoe UI', sans-serif">
                                Active Student
                              </Badge>
                            </HStack>
                          </Box>
                        </VStack>
                      </Box>

                      {/* Mentor Information */}
                      <Box>
                        <HStack spacing={3} mb={4}>
                          <Box
                            p={2}
                            borderRadius="lg"
                            bg="purple.50"
                            color="purple.600"
                          >
                            <Icon as={FaChalkboardTeacher} boxSize={5} />
                          </Box>
                          <Heading size="md" color="purple.700" fontFamily="'Segoe UI', sans-serif">
                            Mentor Profile
                          </Heading>
                        </HStack>

                        <VStack align="stretch" spacing={4}>
                          <Box bg="purple.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Mentor Name</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" color="purple.700" fontWeight="medium">
                                {mentorInfo?.name || 'Not Assigned'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="purple.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Contact Email</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm" color="purple.700">
                                {mentorInfo?.email || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="purple.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Contact Number</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm" color="purple.700">
                                {mentorInfo?.phone || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="purple.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Professional Role</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" color="purple.700">
                                {mentorInfo?.designation || 'Industry Expert'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box bg="purple.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold" color="gray.700">Area of Expertise</Text>
                              <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm" color="purple.700" textAlign="right">
                                {mentorInfo?.area_of_expertise || 'Not Specified'}
                              </Text>
                            </HStack>
                          </Box>
                        </VStack>
                      </Box>
                    </Grid>

                    {/* Connection Status */}
                    <Box mt={6} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={FaHandshake} color="green.500" />
                          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                            Mentorship Connection Status
                          </Text>
                        </HStack>
                        <Badge 
                          colorScheme={
                            mentorInfo?.status === 'assigned' ? 'green' : 
                            mentorInfo?.status === 'no_mentor' ? 'orange' : 'red'
                          }
                          fontSize="sm"
                        >
                          {mentorInfo?.status === 'assigned' ? 'Active Connection' : 
                           mentorInfo?.status === 'no_mentor' ? 'Pending Assignment' : 'Not Connected'}
                        </Badge>
                      </HStack>
                    </Box>
                  </CardBody>
                </Card>
              </MotionBox>

              {/* Main Tabs Section */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" border="1px solid" borderColor={borderColor}>
                  <Tabs variant="enclosed-colored" colorScheme="blue" isFitted>
                    <TabList bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                      {[
                        { icon: FaTasks, label: "Task Evaluations", count: taskSubmissions.length },
                        { icon: FaFileAlt, label: "Deliverable Evaluations", count: deliverables.length },
                        { icon: FaComments, label: "Query Responses", count: taskQueries.length }
                      ].map((tab, index) => (
                        <Tab 
                          key={tab.label}
                          fontFamily="'Segoe UI', sans-serif" 
                          fontWeight="semibold"
                          py={4}
                          _selected={{ 
                            bg: "white", 
                            borderColor: "gray.200", 
                            borderBottom: "none",
                            color: "blue.600",
                            boxShadow: "sm"
                          }}
                          _hover={{ bg: "white" }}
                        >
                          <HStack spacing={3}>
                            <Icon as={tab.icon} />
                            <Text>{tab.label}</Text>
                            <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                              {tab.count}
                            </Badge>
                          </HStack>
                        </Tab>
                      ))}
                    </TabList>

                    <TabPanels bg="white">
                      {/* Task Evaluations Tab */}
                      <TabPanel p={6}>
                        <VStack spacing={6} align="stretch">
                          {/* Filters */}
                          <Card variant="outline" borderRadius="lg" borderColor={borderColor}>
                            <CardBody>
                              <HStack spacing={4} flexWrap="wrap">
                                <Input
                                  placeholder="🔍 Search task evaluations..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  maxW="300px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                />
                                <Select
                                  value={statusFilter}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                  maxW="200px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                >
                                  <option value="all">All Status</option>
                                  <option value="submitted">Submitted</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="completed">Completed</option>
                                </Select>
                                <Button
                                  onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                  }}
                                  variant="outline"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                  _hover={{ bg: "gray.50" }}
                                >
                                  Clear Filters
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>

                          {/* Task Submissions List */}
                          {filteredSubmissions.length === 0 ? (
                            <Center py={12}>
                              <VStack spacing={4}>
                                <Icon as={FaTasks} boxSize={16} color="gray.400" />
                                <Text fontSize="xl" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  {taskSubmissions.length === 0 ? "No task evaluations yet" : "No evaluations match your filters"}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {taskSubmissions.length === 0 ? "Your mentor hasn't evaluated any tasks yet" : "Try adjusting your search or filters"}
                                </Text>
                              </VStack>
                            </Center>
                          ) : (
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                              {filteredSubmissions.map((submission) => {
                                const submissionFiles = getTaskSubmissionFiles(submission);
                                
                                return (
                                  <MotionCard
                                    key={submission.submission_id}
                                    variants={itemVariants}
                                    bg={cardBg}
                                    borderRadius="xl"
                                    boxShadow="lg"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    _hover={{
                                      transform: "translateY(-4px)",
                                      boxShadow: "xl",
                                    }}
                                  >
                                    <CardBody>
                                      <VStack align="stretch" spacing={4}>
                                        {/* Header */}
                                        <Flex justify="space-between" align="start">
                                          <Badge
                                            colorScheme={getStatusColor(submission.status)}
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                          >
                                            {submission.status?.toUpperCase()}
                                          </Badge>
                                          {submission.marks !== null && submission.marks !== undefined && (
                                            <Box
                                              bg={getMarksColor(submission.marks)}
                                              color="white"
                                              px={3}
                                              py={1}
                                              borderRadius="md"
                                              fontSize="sm"
                                              fontWeight="bold"
                                              boxShadow="sm"
                                              display="flex"
                                              alignItems="center"
                                              gap={1}
                                            >
                                              <Text fontSize="md" opacity={0.9}>Marks:</Text>
                                              <Text>{submission.marks}</Text>
                                            </Box>
                                          )}
                                        </Flex>

                                        {/* Task Title */}
                                        <Heading size="sm" fontFamily="'Segoe UI', sans-serif" noOfLines={2} color="gray.800" pb={1}>
                                          {submission.task_title || 'Task Evaluation'}
                                        </Heading>

                                        {/* Submission Details */}
                                        <VStack align="stretch" spacing={2}>
                                          <HStack justify="space-between" fontSize="sm">
                                            <Text color="gray.600" fontWeight="medium">Submitted:</Text>
                                            <Text fontFamily="'Segoe UI', sans-serif" color="gray.700">
                                              {formatDate(submission.submission_date)}
                                            </Text>
                                          </HStack>
                                          <HStack justify="space-between" fontSize="sm">
                                            <Text color="gray.600" fontWeight="medium">Evaluated:</Text>
                                            <Text fontFamily="'Segoe UI', sans-serif" color="gray.700">
                                              {submission.feedback_date ? formatDate(submission.feedback_date) : '⏳ Pending'}
                                            </Text>
                                          </HStack>
                                        </VStack>

                                        {/* Files Preview */}
                                        {submissionFiles.length > 0 && (
                                          <Box>
                                            <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                                              📎 Submitted Files ({submissionFiles.length}):
                                            </Text>
                                            <Wrap spacing={2}>
                                              {submissionFiles.slice(0, 3).map((filePath, index) => (
                                                <WrapItem key={index}>
                                                  <Tag size="sm" colorScheme="blue" borderRadius="full" variant="subtle">
                                                    <Icon as={getFileIcon(filePath)} mr={1} />
                                                    {filePath.split('/').pop()}
                                                  </Tag>
                                                </WrapItem>
                                              ))}
                                              {submissionFiles.length > 3 && (
                                                <WrapItem>
                                                  <Tag size="sm" colorScheme="gray" borderRadius="full" variant="subtle">
                                                    +{submissionFiles.length - 3} more
                                                  </Tag>
                                                </WrapItem>
                                              )}
                                            </Wrap>
                                          </Box>
                                        )}

                                        {/* Feedback Preview */}
                                        {submission.mentor_feedback && (
                                          <Box>
                                            <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                                              💬 Mentor Evaluation:
                                            </Text>
                                            <Text
                                              fontSize="sm"
                                              noOfLines={3}
                                              fontStyle="italic"
                                              color="gray.700"
                                              bg="blue.50"
                                              p={2}
                                              borderRadius="md"
                                            >
                                              {submission.mentor_feedback}
                                            </Text>
                                          </Box>
                                        )}

                                        {/* Action Buttons */}
                                        <VStack spacing={2}>
                                          <Button
                                            size="sm"
                                            w="full"
                                            colorScheme="blue"
                                            variant="outline"
                                            onClick={() => openDetailsModal(submission, 'task')}
                                            leftIcon={<FaEye />}
                                            fontFamily="'Segoe UI', sans-serif"
                                            _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
                                          >
                                            View Evaluation
                                          </Button>
                                        </VStack>
                                      </VStack>
                                    </CardBody>
                                  </MotionCard>
                                );
                              })}
                            </Grid>
                          )}
                        </VStack>
                      </TabPanel>

                      {/* Deliverable Evaluations Tab */}
                      <TabPanel p={6}>
                        <VStack spacing={6} align="stretch">
                          {/* Filters */}
                          <Card variant="outline" borderRadius="lg" borderColor={borderColor}>
                            <CardBody>
                              <HStack spacing={4} flexWrap="wrap">
                                <Input
                                  placeholder="🔍 Search deliverable evaluations..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  maxW="300px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                />
                                <Select
                                  value={statusFilter}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                  maxW="200px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                >
                                  <option value="all">All Status</option>
                                  <option value="submitted">Submitted</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </Select>
                                <Button
                                  onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                  }}
                                  variant="outline"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                  _hover={{ bg: "gray.50" }}
                                >
                                  Clear Filters
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>

                          {/* Deliverables List */}
                          {filteredDeliverables.length === 0 ? (
                            <Center py={12}>
                              <VStack spacing={4}>
                                <Icon as={FaFileAlt} boxSize={16} color="gray.400" />
                                <Text fontSize="xl" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  {deliverables.length === 0 ? "No deliverable evaluations yet" : "No evaluations match your filters"}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {deliverables.length === 0 ? "Your mentor hasn't evaluated any deliverables yet" : "Try adjusting your search or filters"}
                                </Text>
                              </VStack>
                            </Center>
                          ) : (
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                              {filteredDeliverables.map((deliverable) => (
                                <MotionCard
                                  key={deliverable.id}
                                  variants={itemVariants}
                                  bg={cardBg}
                                  borderRadius="xl"
                                  boxShadow="lg"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  _hover={{
                                    transform: "translateY(-4px)",
                                    boxShadow: "xl",
                                  }}
                                >
                                  <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                      {/* Header */}
                                      <Flex justify="space-between" align="start">
                                        <Badge
                                          colorScheme={getStatusColor(deliverable.status)}
                                          fontSize="xs"
                                          px={2}
                                          py={1}
                                          borderRadius="full"
                                        >
                                          {deliverable.status?.toUpperCase()}
                                        </Badge>
                                        {deliverable.marks !== null && deliverable.marks !== undefined && (
                                          <Box
                                            bg={getMarksColor(deliverable.marks)}
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="md"
                                            fontSize="sm"
                                            fontWeight="bold"
                                            boxShadow="sm"
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                          >
                                            <Text fontSize="md" opacity={0.9}>Marks:</Text>
                                            <Text>{deliverable.marks}</Text>
                                          </Box>
                                        )}
                                      </Flex>

                                      {/* Deliverable Info */}
                                      <Box>
                                        <Text fontSize="sm" color="gray.600" mb={1} fontWeight="medium">
                                          📅 Submission Date:
                                        </Text>
                                        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" color="gray.800">
                                          {formatDate(deliverable.submission_date)}
                                        </Text>
                                      </Box>

                                      {/* Remarks Preview */}
                                      {deliverable.remarks && (
                                        <Box>
                                          <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                                            📝 Your Remarks:
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            noOfLines={3}
                                            color="gray.700"
                                            bg="gray.50"
                                            p={2}
                                            borderRadius="md"
                                          >
                                            {deliverable.remarks}
                                          </Text>
                                        </Box>
                                      )}

                                      {/* Files Preview */}
                                      {deliverable.file_paths && deliverable.file_paths.length > 0 && (
                                        <Box>
                                          <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                                            📎 Files ({deliverable.file_paths.length}):
                                          </Text>
                                          <Wrap spacing={2}>
                                            {deliverable.file_paths.slice(0, 3).map((filePath, index) => (
                                              <WrapItem key={index}>
                                                <Tag size="sm" colorScheme="blue" borderRadius="full" variant="subtle">
                                                  <Icon as={getFileIcon(filePath)} mr={1} />
                                                  {filePath.split('/').pop()}
                                                </Tag>
                                              </WrapItem>
                                            ))}
                                            {deliverable.file_paths.length > 3 && (
                                              <WrapItem>
                                                <Tag size="sm" colorScheme="gray" borderRadius="full" variant="subtle">
                                                  +{deliverable.file_paths.length - 3} more
                                                </Tag>
                                              </WrapItem>
                                            )}
                                          </Wrap>
                                        </Box>
                                      )}

                                      {/* Feedback Preview */}
                                      {deliverable.feedback && (
                                        <Box>
                                          <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                                            💬 Mentor Evaluation:
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            noOfLines={3}
                                            fontStyle="italic"
                                            color="gray.700"
                                            bg="green.50"
                                            p={2}
                                            borderRadius="md"
                                          >
                                            {deliverable.feedback}
                                          </Text>
                                        </Box>
                                      )}

                                      {/* Action Buttons */}
                                      <VStack spacing={2}>
                                        <Button
                                          size="sm"
                                          w="full"
                                          colorScheme="green"
                                          variant="outline"
                                          onClick={() => openDetailsModal(deliverable, 'deliverable')}
                                          leftIcon={<FaEye />}
                                          fontFamily="'Segoe UI', sans-serif"
                                          _hover={{ bg: "green.50", transform: "translateY(-1px)" }}
                                        >
                                          View Evaluation
                                        </Button>
                                      </VStack>
                                    </VStack>
                                  </CardBody>
                                </MotionCard>
                              ))}
                            </Grid>
                          )}
                        </VStack>
                      </TabPanel>

                      {/* Query Responses Tab */}
                      <TabPanel p={6}>
                        <VStack spacing={6} align="stretch">
                          {/* Filters */}
                          <Card variant="outline" borderRadius="lg" borderColor={borderColor}>
                            <CardBody>
                              <HStack spacing={4} flexWrap="wrap">
                                <Input
                                  placeholder="🔍 Search query responses..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  maxW="300px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                />
                                <Select
                                  value={statusFilter}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                  maxW="200px"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                >
                                  <option value="all">All Status</option>
                                  <option value="open">Open</option>
                                  <option value="answered">Answered</option>
                                  <option value="closed">Closed</option>
                                </Select>
                                <Button
                                  onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                  }}
                                  variant="outline"
                                  borderRadius="lg"
                                  borderColor={borderColor}
                                  _hover={{ bg: "gray.50" }}
                                >
                                  Clear Filters
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>

                          {/* Queries List */}
                          {filteredQueries.length === 0 ? (
                            <Center py={12}>
                              <VStack spacing={4}>
                                <Icon as={FaComments} boxSize={16} color="gray.400" />
                                <Text fontSize="xl" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  {taskQueries.length === 0 ? "No query responses yet" : "No responses match your filters"}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {taskQueries.length === 0 ? "Your mentor hasn't responded to any queries yet" : "Try adjusting your search or filters"}
                                </Text>
                              </VStack>
                            </Center>
                          ) : (
                            <VStack spacing={4} align="stretch">
                              {filteredQueries.map((query) => (
                                <MotionCard
                                  key={query.query_id}
                                  variants={itemVariants}
                                  bg={cardBg}
                                  borderRadius="xl"
                                  boxShadow="lg"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "xl",
                                  }}
                                >
                                  <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                      {/* Header */}
                                      <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
                                        <HStack spacing={2}>
                                          <Badge
                                            colorScheme={getStatusColor(query.status)}
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                          >
                                            {query.status?.toUpperCase()}
                                          </Badge>
                                          <Badge
                                            colorScheme={getPriorityColor(query.priority)}
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                          >
                                            {query.priority?.toUpperCase()} PRIORITY
                                          </Badge>
                                        </HStack>
                                        <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                          {formatDate(query.query_date)}
                                        </Text>
                                      </Flex>

                                      {/* Subject */}
                                      <Heading size="sm" fontFamily="'Segoe UI', sans-serif" color="blue.700">
                                        {query.subject}
                                      </Heading>

                                      {/* Message */}
                                      <Box>
                                        <Text fontSize="sm" color="gray.600" mb={1} fontWeight="medium">
                                          ❓ Your Question:
                                        </Text>
                                        <Text
                                          fontSize="sm"
                                          color="gray.700"
                                          bg="blue.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          {query.message}
                                        </Text>
                                      </Box>

                                      {/* Answer */}
                                      {query.answer && (
                                        <Box>
                                          <Text fontSize="sm" color="gray.600" mb={1} fontWeight="medium">
                                            💡 Mentor&apos;s Response:
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            color="gray.700"
                                            bg="green.50"
                                            p={3}
                                            borderRadius="md"
                                            fontStyle="italic"
                                          >
                                            {query.answer}
                                          </Text>
                                          {query.answer_date && (
                                            <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                                              Answered on: {formatDate(query.answer_date)}
                                            </Text>
                                          )}
                                        </Box>
                                      )}

                                      {/* Action Buttons */}
                                      <Flex justify="flex-end">
                                        <Button
                                          size="sm"
                                          colorScheme="purple"
                                          variant="outline"
                                          onClick={() => openDetailsModal(query, 'query')}
                                          leftIcon={<FaEye />}
                                          fontFamily="'Segoe UI', sans-serif"
                                          _hover={{ bg: "purple.50", transform: "translateY(-1px)" }}
                                        >
                                          View Response
                                        </Button>
                                      </Flex>
                                    </VStack>
                                  </CardBody>
                                </MotionCard>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Card>
              </MotionBox>
            </VStack>
          </Box>
        </Box>

        {/* Details Modal */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
          <ModalOverlay />
          <ModalContent borderRadius="2xl" maxH="90vh" overflowY="auto">
            <ModalHeader borderBottom="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
              {selectedItem?.type === 'task' && '📋 Task Evaluation Details'}
              {selectedItem?.type === 'deliverable' && '📄 Deliverable Evaluation Details'}
              {selectedItem?.type === 'query' && '💬 Query Response Details'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              {!selectedItem ? (
                <Center py={8}>
                  <Spinner size="lg" />
                </Center>
              ) : (
                <VStack spacing={6} align="stretch">
                  {/* Task Submission Details */}
                  {selectedItem.type === 'task' && (
                    <>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Status</Text>
                          <Badge colorScheme={getStatusColor(selectedItem.status)} fontSize="md">
                            {selectedItem.status?.toUpperCase()}
                          </Badge>
                        </Box>
                        {selectedItem.marks !== null && selectedItem.marks !== undefined && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Marks</Text>
                            <Box
                              bg={getMarksColor(selectedItem.marks)}
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="full"
                              display="inline-block"
                              fontWeight="bold"
                            >
                              {selectedItem.marks}
                            </Box>
                          </Box>
                        )}
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Task Title</Text>
                          <Text>{selectedItem.task_title || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Submitted Date</Text>
                          <Text>{formatDate(selectedItem.submission_date)}</Text>
                        </Box>
                        {selectedItem.feedback_date && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Evaluation Date</Text>
                            <Text>{formatDate(selectedItem.feedback_date)}</Text>
                          </Box>
                        )}
                      </Grid>

                      {selectedItem.remarks && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Your Remarks</Text>
                          <Text whiteSpace="pre-wrap" bg="blue.50" p={3} borderRadius="md">
                            {selectedItem.remarks}
                          </Text>
                        </Box>
                      )}

                      {/* Files Section for Task Submissions */}
                      {(() => {
                        const taskFiles = getTaskSubmissionFiles(selectedItem);
                        return taskFiles.length > 0 ? (
                          <Box>
                            <Text fontWeight="bold" color="gray.600" mb={2}>Submitted Files</Text>
                            <VStack align="stretch" spacing={2}>
                              {taskFiles.map((filePath, index) => (
                                <HStack
                                  key={index}
                                  bg="gray.50"
                                  p={3}
                                  borderRadius="md"
                                  justify="space-between"
                                >
                                  <HStack>
                                    <Icon as={getFileIcon(filePath)} color={getFileColor(filePath)} />
                                    <Text fontSize="sm">{filePath.split('/').pop()}</Text>
                                  </HStack>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => downloadFile(filePath)}
                                    leftIcon={<FaDownload />}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        ) : null;
                      })()}

                      {selectedItem.mentor_feedback && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Mentor Evaluation</Text>
                          <Text whiteSpace="pre-wrap" bg="green.50" p={3} borderRadius="md" fontStyle="italic">
                            {selectedItem.mentor_feedback}
                          </Text>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Deliverable Details */}
                  {selectedItem.type === 'deliverable' && (
                    <>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Status</Text>
                          <Badge colorScheme={getStatusColor(selectedItem.status)} fontSize="md">
                            {selectedItem.status?.toUpperCase()}
                          </Badge>
                        </Box>
                        {selectedItem.marks !== null && selectedItem.marks !== undefined && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Marks</Text>
                            <Box
                              bg={getMarksColor(selectedItem.marks)}
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="full"
                              display="inline-block"
                              fontWeight="bold"
                            >
                              {selectedItem.marks}
                            </Box>
                          </Box>
                        )}
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Submission Date</Text>
                          <Text>{formatDate(selectedItem.submission_date)}</Text>
                        </Box>
                        {selectedItem.reviewed_at && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Evaluation Date</Text>
                            <Text>{formatDate(selectedItem.reviewed_at)}</Text>
                          </Box>
                        )}
                      </Grid>

                      {selectedItem.remarks && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Your Remarks</Text>
                          <Text whiteSpace="pre-wrap" bg="blue.50" p={3} borderRadius="md">
                            {selectedItem.remarks}
                          </Text>
                        </Box>
                      )}

                      {selectedItem.feedback && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Mentor Evaluation</Text>
                          <Text whiteSpace="pre-wrap" bg="green.50" p={3} borderRadius="md" fontStyle="italic">
                            {selectedItem.feedback}
                          </Text>
                        </Box>
                      )}

                      {selectedItem.file_paths && selectedItem.file_paths.length > 0 && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Submitted Files</Text>
                          <VStack align="stretch" spacing={2}>
                            {selectedItem.file_paths.map((filePath, index) => (
                              <HStack
                                key={index}
                                bg="gray.50"
                                p={3}
                                borderRadius="md"
                                justify="space-between"
                              >
                                <HStack>
                                  <Icon as={getFileIcon(filePath)} color={getFileColor(filePath)} />
                                  <Text fontSize="sm">{filePath.split('/').pop()}</Text>
                                </HStack>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => downloadFile(filePath)}
                                  leftIcon={<FaDownload />}
                                >
                                  Download
                                </Button>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Query Details */}
                  {selectedItem.type === 'query' && (
                    <>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Status</Text>
                          <Badge colorScheme={getStatusColor(selectedItem.status)} fontSize="md">
                            {selectedItem.status?.toUpperCase()}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Priority</Text>
                          <Badge colorScheme={getPriorityColor(selectedItem.priority)} fontSize="md">
                            {selectedItem.priority?.toUpperCase()}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.600">Query Date</Text>
                          <Text>{formatDate(selectedItem.query_date)}</Text>
                        </Box>
                        {selectedItem.answer_date && (
                          <Box>
                            <Text fontWeight="bold" color="gray.600">Response Date</Text>
                            <Text>{formatDate(selectedItem.answer_date)}</Text>
                          </Box>
                        )}
                      </Grid>

                      <Box>
                        <Text fontWeight="bold" color="gray.600" mb={2}>Subject</Text>
                        <Text fontSize="lg" color="blue.700" bg="blue.50" p={3} borderRadius="md">
                          {selectedItem.subject}
                        </Text>
                      </Box>

                      <Box>
                        <Text fontWeight="bold" color="gray.600" mb={2}>Your Question</Text>
                        <Text whiteSpace="pre-wrap" bg="blue.50" p={3} borderRadius="md">
                          {selectedItem.message}
                        </Text>
                      </Box>

                      {selectedItem.answer && (
                        <Box>
                          <Text fontWeight="bold" color="gray.600" mb={2}>Mentor&apos;s Response</Text>
                          <Text whiteSpace="pre-wrap" bg="green.50" p={3} borderRadius="md" fontStyle="italic">
                            {selectedItem.answer}
                          </Text>
                        </Box>
                      )}
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.200">
              <Button variant="outline" mr={3} onClick={onDetailsClose} fontFamily="'Segoe UI', sans-serif">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // Fallback for any unexpected state
  console.warn('Unexpected state - showing fallback', {
    isLoading,
    mentorAllocated,
    internshipStarted
  });

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6}>
        <Icon as={FaExclamationTriangle} boxSize={12} color="red.500" />
        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
          Unexpected error occurred
        </Text>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Please check your console for more details
        </Text>
        <Button 
          colorScheme="blue" 
          onClick={() => router.push("/student/dashboard")}
        >
          Back to Dashboard
        </Button>
      </VStack>
    </Box>
  );
}