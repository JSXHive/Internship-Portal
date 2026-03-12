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
  Flex,
  Icon,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Avatar,
  IconButton,
  Wrap,
  Tooltip,
  Center,
  SimpleGrid,
  keyframes,
  Progress,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFileAlt,
  FaStar,
  FaSync,
  FaEdit,
  FaFilePdf,
  FaFileImage,
  FaFileCode,
  FaFileArchive,
  FaArrowLeft,
  FaUsers,
  FaBookOpen,
  FaRocket,
  FaChartLine,
  FaLightbulb,
  FaTrophy,
  FaUserGraduate,
  FaAward,
  FaGraduationCap,
  FaClipboardCheck,
  FaCheckSquare,
} from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export default function MentorReviewDeliverables() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();

  // State variables
  const [user, setUser] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [filteredDeliverables, setFilteredDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dbError, setDbError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    submissionId: null,
    feedback: "",
    marks: "",
    status: "approved"
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    averageMarks: 0,
    reviewed: 0,
    completionRate: 0
  });

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("blue.50", "blue.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");

  // Set minimum load time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000); // 2 seconds minimum load time

    return () => clearTimeout(timer);
  }, []);

  // Load user data on component mount
  useEffect(() => {
    // Enhanced toast function with animations
    const showToast = (title, status, description, duration = 3000) => {
      toast({
        title,
        description,
        status,
        duration,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    };

    // Load deliverables from API
    const loadDeliverables = async (mentorId) => {
      try {
        setDbError(null);
        setIsRefreshing(true);
        const response = await fetch(`/api/mentor-deliverables?mentorId=${mentorId}`);

        if (response.ok) {
          const data = await response.json();

          // Format the data with proper student profile photo URLs
          const formattedData = await Promise.all(data.map(async (item) => {
            // Try to fetch student profile photo if not available
            let studentProfilePhoto = item.profile_picture;
            if (!studentProfilePhoto && item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?studentId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                }
              } catch (error) {
                console.log('Could not fetch student profile photo:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: item.student_id || 'N/A',
              student_profile_photo: studentProfilePhoto,
              file_paths: Array.isArray(item.file_paths) ? item.file_paths : [],
              status: item.status || 'submitted',
              marks: item.marks || null,
              feedback: item.feedback || '',
              formatted_date: formatDate(item.submission_date)
            };
          }));

          setDeliverables(formattedData);
          setFilteredDeliverables(formattedData);
          calculateStats(formattedData);

          // REMOVED: The toast that was showing "Data Loaded" message

        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load deliverables");
        }
      } catch (error) {
        console.error('Error loading deliverables:', error);
        setDbError("connection");
        setDeliverables([]);
        setFilteredDeliverables([]);
        setStats({ total: 0, pending: 0, approved: 0, averageMarks: 0, reviewed: 0, completionRate: 0 });
        
        showToast("🌐 Connection Issue", "error", "Unable to fetch submissions. Please check your connection.");
      } finally {
        setIsRefreshing(false);
      }
    };

    // Calculate statistics
    const calculateStats = (data) => {
      const total = data.length;
      const pending = data.filter(d => d.status === 'submitted').length;
      const approved = data.filter(d => d.status === 'approved').length;
      const reviewed = data.filter(d => d.status === 'reviewed').length;
      const gradedDeliverables = data.filter(d => d.marks);
      const averageMarks = gradedDeliverables.length > 0
        ? (gradedDeliverables.reduce((acc, d) => acc + (d.marks || 0), 0) / gradedDeliverables.length).toFixed(1)
        : 0;
      const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

      setStats({ total, pending, approved, averageMarks, reviewed, completionRate });
    };

    // Format date - Only date without time
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    };

    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user') ||
          localStorage.getItem('userData') ||
          localStorage.getItem('mentorUser') ||
          sessionStorage.getItem('user') ||
          sessionStorage.getItem('userData');

        if (!userData) {
          showToast("🔐 Authentication Required", "warning", "Please log in to access this page");
          router.push('/login');
          return;
        }

        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          if (typeof userData === 'string' && userData.includes('user_id')) {
            const userIdMatch = userData.match(/"user_id":"([^"]+)"/);
            if (userIdMatch) {
              parsedUser = { user_id: userIdMatch[1] };
            } else {
              throw new Error('Invalid user data format');
            }
          } else {
            throw new Error('Invalid user data format');
          }
        }

        const userId = parsedUser.user_id || parsedUser.id || parsedUser.UserID || parsedUser.userId;

        if (!userId) {
          showToast("❌ Invalid Session", "error", "Please log in again");
          router.push('/login');
          return;
        }

        const normalizedUser = {
          user_id: userId,
          name: parsedUser.name || parsedUser.username || parsedUser.email || 'Mentor',
          email: parsedUser.email || '',
          role: parsedUser.role || 'mentor',
          profile_photo: parsedUser.profile_photo || null
        };

        setUser(normalizedUser);
        await loadDeliverables(userId);

      } catch (error) {
        showToast("🚨 Error Loading Data", "error", error.message || "Please log in again");
        router.push('/login');
      } finally {
        // Only stop loading if minimum time has passed
        if (minimumLoadTimePassed) {
          setIsLoading(false);
        } else {
          // Wait for minimum load time
          setTimeout(() => setIsLoading(false), 2000 - (Date.now() - startTime));
        }
      }
    };

    const startTime = Date.now();
    loadUserData();
  }, [router, toast, minimumLoadTimePassed]);

  // Filter deliverables based on search and status
  useEffect(() => {
    let filtered = deliverables;

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    setFilteredDeliverables(filtered);
  }, [searchTerm, filterStatus, deliverables]);

  // Start reviewing a deliverable
  const startReview = (deliverable) => {
    setReviewForm({
      submissionId: deliverable.submission_id,
      feedback: deliverable.feedback || "",
      marks: deliverable.marks || "",
      status: deliverable.status === "submitted" ? "approved" : deliverable.status
    });
    onReviewOpen();
  };

  // Submit review for a deliverable
  const submitReview = async (action) => {
    if (!reviewForm.submissionId) return;

    if (action === "request_changes" && !reviewForm.feedback.trim()) {
      // Enhanced toast function for this scope
      toast({
        title: "📝 Feedback Required",
        description: "Please provide constructive feedback when requesting changes",
        status: "warning",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
      return;
    }

    try {
      const reviewData = {
        submission_id: reviewForm.submissionId,
        feedback: reviewForm.feedback.trim(),
        marks: reviewForm.marks ? parseInt(reviewForm.marks) : null,
        status: action === "approve" ? "approved" : "submitted",
        reviewed_by: user.user_id
      };

      const response = await fetch('/api/review-deliverable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      toast({
        title: action === "approve" ? "🎉 Deliverable Approved!" : "🔄 Changes Requested",
        description: action === "approve"
          ? "The student's work has been approved successfully! 🚀"
          : "The student has been asked to make improvements. 📋",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });

      // Reload deliverables by calling the API again
      if (user) {
        setDbError(null);
        setIsRefreshing(true);
        const response = await fetch(`/api/mentor-deliverables?mentorId=${user.user_id}`);
        
        if (response.ok) {
          const data = await response.json();
          const formattedData = await Promise.all(data.map(async (item) => {
            let studentProfilePhoto = item.profile_picture;
            if (!studentProfilePhoto && item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?studentId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                }
              } catch (error) {
                console.log('Could not fetch student profile photo:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: item.student_id || 'N/A',
              student_profile_photo: studentProfilePhoto,
              file_paths: Array.isArray(item.file_paths) ? item.file_paths : [],
              status: item.status || 'submitted',
              marks: item.marks || null,
              feedback: item.feedback || '',
              formatted_date: formatDate(item.submission_date)
            };
          }));

          setDeliverables(formattedData);
          setFilteredDeliverables(formattedData);
          
          // Recalculate stats
          const total = formattedData.length;
          const pending = formattedData.filter(d => d.status === 'submitted').length;
          const approved = formattedData.filter(d => d.status === 'approved').length;
          const reviewed = formattedData.filter(d => d.status === 'reviewed').length;
          const gradedDeliverables = formattedData.filter(d => d.marks);
          const averageMarks = gradedDeliverables.length > 0
            ? (gradedDeliverables.reduce((acc, d) => acc + (d.marks || 0), 0) / gradedDeliverables.length).toFixed(1)
            : 0;
          const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

          setStats({ total, pending, approved, averageMarks, reviewed, completionRate });
        }
      }

      setReviewForm({ submissionId: null, feedback: "", marks: "", status: "approved" });
      onReviewClose();
    } catch (error) {
      toast({
        title: "❌ Review Failed",
        description: error.message || "Please try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cancel review
  const cancelReview = () => {
    setReviewForm({ submissionId: null, feedback: "", marks: "", status: "approved" });
    onReviewClose();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'orange';
      case 'reviewed': return 'blue';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return FaFileAlt;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return FaFilePdf;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return FaFileImage;
      case 'zip': case 'rar': case 'tar': return FaFileArchive;
      case 'js': case 'html': case 'css': case 'py': return FaFileCode;
      default: return FaFileAlt;
    }
  };

  // Get file color
  const getFileColor = (fileName) => {
    if (!fileName) return 'gray';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'red';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'green';
      case 'zip': case 'rar': case 'tar': return 'orange';
      case 'js': case 'html': case 'css': case 'py': return 'blue';
      default: return 'gray';
    }
  };

  // Format date - Only date without time
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Download file
  const downloadFile = async (filePath, fileName) => {
    try {
      if (!filePath) {
        toast({
          title: "❌ Download Error",
          description: "No file path available",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
          variant: "left-accent",
          containerStyle: {
            animation: `${fadeIn} 0.5s ease-out`,
          },
        });
        return;
      }

      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "📥 Download Started",
        description: `${fileName} is being downloaded...`,
        status: "info",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    } catch (error) {
      toast({
        title: "❌ Download Failed",
        description: "Failed to download file",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    }
  };

  // Retry connection
  const retryConnection = () => {
    if (user) {
      setDbError(null);
      // Trigger a reload by simulating the load process
      setIsRefreshing(true);
      fetch(`/api/mentor-deliverables?mentorId=${user.user_id}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to load deliverables');
        })
        .then(data => {
          const formattedData = data.map(item => ({
            ...item,
            student_name: item.student_name || 'Unknown Student',
            student_id: item.student_id || 'N/A',
            file_paths: Array.isArray(item.file_paths) ? item.file_paths : [],
            status: item.status || 'submitted',
            marks: item.marks || null,
            feedback: item.feedback || '',
            formatted_date: formatDate(item.submission_date)
          }));

          setDeliverables(formattedData);
          setFilteredDeliverables(formattedData);
          
          const total = formattedData.length;
          const pending = formattedData.filter(d => d.status === 'submitted').length;
          const approved = formattedData.filter(d => d.status === 'approved').length;
          const reviewed = formattedData.filter(d => d.status === 'reviewed').length;
          const gradedDeliverables = formattedData.filter(d => d.marks);
          const averageMarks = gradedDeliverables.length > 0
            ? (gradedDeliverables.reduce((acc, d) => acc + (d.marks || 0), 0) / gradedDeliverables.length).toFixed(1)
            : 0;
          const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

          setStats({ total, pending, approved, averageMarks, reviewed, completionRate });
        })
        .catch(error => {
          console.error('Error loading deliverables:', error);
          setDbError("connection");
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  };

   //Loading state  
    if (isLoading) {
      return (
        <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6}>
            <Box
              p={6}
              borderRadius="xl"
              bgGradient="linear(to-r, orange.500, orange.600)"
              color="white"
              boxShadow="xl"
              animation={`${pulse} 2s infinite`}
            >
              <Icon as={FaClipboardCheck} boxSize={10} />
            </Box>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="orange.500" />
            <Text fontWeight="medium" fontSize="lg">
               Loading Review Dashboard...
            </Text>
            <Text fontSize="sm" color="gray.500">Preparing your student submissions and review system</Text>
          </VStack>
        </Box>
      );
    }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" p={4}>
      <Box maxW="7xl" mx="auto">
        {/* Back Button */}
        <Button 
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
          fontWeight="bold"
          borderRadius="xl"
          mb={6}
          onClick={() => router.push('/mentor/dashboard')}
          _hover={{
            bg: "blue.50",
            transform: "translateX(-4px)",
            transition: "all 0.3s"
          }}
          animation={`${slideIn} 0.6s ease-out`}
        >
          Back to Dashboard
        </Button>

        {/* Header Section */}
        <Card
          mb={8}
          borderRadius="3xl"
          boxShadow="xl"
          bg={cardBg}
          overflow="hidden"
          position="relative"
          animation={`${fadeIn} 0.8s ease-out`}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="120px"
            bgGradient="linear(to-r, blue.500, purple.500)"
            opacity="0.08"
            borderRadius="3xl"
          />
          <CardBody p={8} pb={10}>
            <VStack spacing={4} textAlign="center" position="relative" zIndex={1}>
              <Flex align="center" justify="center" mb={2}>
                <Icon as={FaClipboardCheck} boxSize={8} color="blue.500" /> 
                <Heading as="h2" size="lg" ml={2} color="blue.700">
                  Review Deliverables
                </Heading>
              </Flex>
              <Text color="gray.600" mb={8}>
                Evaluate student submissions and provide constructive feedback 
              </Text>
              {/* Enhanced Stats Cards with curved edges */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={4} w="full">
                {[
                  { 
                    icon: FaRocket, 
                    label: "Review Progress", 
                    value: `${stats.completionRate}%`, 
                    color: "purple", 
                    desc: `${stats.approved}/${stats.total} completed`,
                    progress: stats.completionRate
                  },
                  { 
                    icon: FaTrophy, 
                    label: "Quality Score", 
                    value: stats.averageMarks, 
                    color: "yellow", 
                    desc: "Average marks given",
                    progress: stats.averageMarks
                  },
                  { 
                    icon: FaClock, 
                    label: "Pending Review", 
                    value: stats.pending, 
                    color: "orange", 
                    desc: "Need your attention",
                    progress: stats.total > 0 ? (stats.pending/stats.total)*100 : 0
                  },
                  { 
                    icon: FaChartLine, 
                    label: "Efficiency", 
                    value: `${Math.round((stats.reviewed + stats.approved) / Math.max(stats.total, 1) * 100)}%`, 
                    color: "green", 
                    desc: "Review completion rate",
                    progress: Math.round((stats.reviewed + stats.approved) / Math.max(stats.total, 1) * 100)
                  },
                ].map((stat, index) => (
                  <Card 
                    key={stat.label} 
                    bg={cardBg} 
                    borderRadius="2xl" 
                    boxShadow="lg" 
                    border="1px solid" 
                    borderColor={`${stat.color}.100`}
                    animation={`${fadeIn} 0.6s ease-out ${index * 0.1}s both`}
                    _hover={{ transform: "translateY(-4px)", transition: "all 0.3s" }}
                  >
                    <CardBody p={5}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Box>
                            <Text color="gray.600" fontSize="sm" mb={1} fontWeight="medium">{stat.label}</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.600`}>{stat.value}</Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>{stat.desc}</Text>
                          </Box>
                          <Center w="50px" h="50px" borderRadius="xl" bg={`${stat.color}.100`} color={`${stat.color}.600`}>
                            <Icon as={stat.icon} boxSize={5} />
                          </Center>
                        </HStack>
                        <Progress 
                          value={stat.progress} 
                          colorScheme={stat.color} 
                          size="sm" 
                          borderRadius="full"
                          bg={`${stat.color}.50`}
                          mt={2}
                        />
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Cards with curved edges */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
          {[
            { icon: FaFileAlt, label: "Total", value: stats.total, color: "blue", desc: "Submissions" },
            { icon: FaClock, label: "Pending", value: stats.pending, color: "orange", desc: "Need review" },
            { icon: FaCheckCircle, label: "Approved", value: stats.approved, color: "green", desc: "Completed" },
            { icon: FaStar, label: "Avg Marks", value: stats.averageMarks, color: "purple", desc: "Quality" },
            { icon: FaUsers, label: "Students", value: new Set(deliverables.map(d => d.student_id)).size, color: "teal", desc: "Participated" },
          ].map((stat, index) => (
            <Card 
              key={stat.label} 
              bg={cardBg} 
              borderRadius="2xl" 
              boxShadow="lg" 
              border="1px solid" 
              borderColor={`${stat.color}.100`}
              animation={`${fadeIn} 0.6s ease-out ${index * 0.1}s both`}
              _hover={{ transform: "translateY(-4px)", transition: "all 0.3s" }}
            >
              <CardBody p={5}>
                <HStack justify="space-between">
                  <Box>
                    <Text color="gray.600" fontSize="sm" mb={1} fontWeight="medium">{stat.label}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.600`}>{stat.value}</Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>{stat.desc}</Text>
                  </Box>
                  <Center w="50px" h="50px" borderRadius="xl" bg={`${stat.color}.100`} color={`${stat.color}.600`}>
                    <Icon as={stat.icon} boxSize={5} />
                  </Center>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Error Alert with curved edges */}
        {dbError && (
          <Alert status="error" borderRadius="2xl" mb={6} animation={`${fadeIn} 0.5s ease-out`}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>
                {dbError === 'database' 
                  ? 'Unable to connect to the database server.'
                  : 'Failed to connect to the server. Please check your connection.'
                }
              </AlertDescription>
            </Box>
            <Button 
              colorScheme="red" 
              onClick={retryConnection} 
              leftIcon={<FaSync />}
              size="sm"
              borderRadius="lg"
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Search and Filter with curved edges */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" mb={6} animation={`${fadeIn} 0.7s ease-out`}>
          <CardBody p={5}>
            <HStack spacing={4} flexWrap="wrap">
              <Box flex="1" minW="300px">
                <HStack>
                  <Icon as={FaSearch} color="gray.400" boxSize={5} />
                  <Input
                    placeholder="Search students, IDs, or remarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    isDisabled={!!dbError}
                    size="md"
                    borderRadius="lg"
                  />
                </HStack>
              </Box>
              
              <HStack>
                <Text whiteSpace="nowrap" fontWeight="medium">Filter by:</Text>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    fontSize: '14px',
                    minWidth: '140px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Pending Review</option>
                  <option value="approved">Approved</option>
                </select>
              </HStack>
              
              <Button
                colorScheme="blue"
                onClick={retryConnection}
                leftIcon={<FaSync />}
                isDisabled={!!dbError}
                isLoading={isRefreshing}
                size="md"
                borderRadius="lg"
              >
                Refresh
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Deliverables Table with curved edges */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" animation={`${fadeIn} 0.8s ease-out`}>
          <Box
            p={6}
            borderBottom="1px solid"
            borderColor="gray.100"
            bgGradient="linear(to-r, blue.50, purple.50)"
            borderTopRadius="2xl"
          >
            <Flex justify="space-between" align="center">
              <HStack>
                <Icon as={FaFileAlt} color="blue.600" boxSize={7} />
                <Heading size="lg" color="blue.800">
                  Student Submissions
                </Heading>
              </HStack>
              <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
                {filteredDeliverables.length} {filteredDeliverables.length === 1 ? 'item' : 'items'}
              </Badge>
            </Flex>
          </Box>

          <Box>
            {filteredDeliverables.length === 0 ? (
              <Center p={12}>
                <VStack spacing={4}>
                  <Icon as={FaFileAlt} boxSize={20} color="gray.300" />
                  <Text color="gray.500" fontSize="xl" fontWeight="bold">
                    {deliverables.length === 0 ? "No Submissions Yet" : "No Matching Results"}
                  </Text>
                  <Text color="gray.400" textAlign="center" maxW="md">
                    {deliverables.length === 0 ? 
                      "Students haven't submitted any deliverables yet. " : 
                      "Try adjusting your search or filter criteria. "
                    }
                  </Text>
                </VStack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="lg" fontSize="md">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" py={6} px={4} borderTopLeftRadius="12px">Student</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Submission Date</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Remarks</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Files</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Status</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Marks</Th>
                      <Th fontWeight="bold" color="blue.800" fontSize="md" px={4} textAlign="center" borderTopRightRadius="12px">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredDeliverables.map((deliverable, index) => (
                      <Tr 
                        key={deliverable.submission_id} 
                        _hover={{ bg: hoverBg }} 
                        transition="all 0.2s"
                        animation={`${fadeIn} 0.5s ease-out ${index * 0.05}s both`}
                      >
                        <Td py={4} px={4}>
                          <HStack spacing={4}>
                            <Avatar 
                              size="lg" 
                              name={deliverable.student_name} 
                              src={deliverable.student_profile_photo}
                              border="2px solid"
                              borderColor="blue.200"
                              bg="white"
                            />
                            <Box>
                              <Text fontWeight="600" fontSize="md">{deliverable.student_name}</Text>
                              <Text fontSize="sm" color="gray.600">{deliverable.student_id}</Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td fontSize="md" fontWeight="500" px={4}>{deliverable.formatted_date}</Td>
                        <Td maxW="250px" px={4}>
                          <Tooltip label={deliverable.remarks || "No remarks"} hasArrow>
                            <Text isTruncated fontSize="md">
                              {deliverable.remarks || "No remarks"}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td px={4}>
                          <Wrap spacing={2}>
                            {deliverable.file_paths?.slice(0, 3).map((path, idx) => {
                              const fileName = path.split('/').pop() || `file_${idx + 1}`;
                              return (
                                <Tooltip key={idx} label={`Download ${fileName}`} hasArrow>
                                  <IconButton
                                    aria-label={`Download ${fileName}`}
                                    icon={<Icon as={getFileIcon(fileName)} />}
                                    size="md"
                                    variant="ghost"
                                    onClick={() => downloadFile(path, fileName)}
                                    colorScheme={getFileColor(fileName)}
                                    borderRadius="lg"
                                  />
                                </Tooltip>
                              );
                            })}
                            {deliverable.file_paths?.length > 3 && (
                              <Badge colorScheme="blue" variant="subtle" fontSize="sm" px={2} borderRadius="md">
                                +{deliverable.file_paths.length - 3}
                              </Badge>
                            )}
                          </Wrap>
                        </Td>
                        <Td px={4}>
                          <Badge 
                            colorScheme={getStatusColor(deliverable.status)} 
                            fontSize="sm" 
                            px={3} 
                            py={2} 
                            borderRadius="lg"
                            fontWeight="bold"
                          >
                            {getStatusText(deliverable.status)}
                          </Badge>
                        </Td>
                        <Td px={4}>
                          {deliverable.marks ? (
                            <Text fontWeight="600" fontSize="md">{deliverable.marks}/100</Text>
                          ) : (
                            <Text color="gray.500" fontSize="sm">Not graded</Text>
                          )}
                        </Td>
                        <Td px={4}>
                          <HStack spacing={3} justify="center">
                            <Tooltip label="View details" hasArrow>
                              <IconButton
                                icon={<FaEye />}
                                colorScheme="blue"
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setSelectedDeliverable(deliverable);
                                  onOpen();
                                }}
                                borderRadius="lg"
                              />
                            </Tooltip>
                            <Tooltip label="Review" hasArrow>
                              <IconButton
                                icon={<FaEdit />}
                                colorScheme="green"
                                size="lg"
                                onClick={() => startReview(deliverable)}
                                borderRadius="lg"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* View Modal with curved edges */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaEye} />
              <Text fontWeight="bold">Submission Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {selectedDeliverable && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} mb={3}>
                  <Avatar size="lg" name={selectedDeliverable.student_name} src={selectedDeliverable.student_profile_photo} />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{selectedDeliverable.student_name}</Text>
                    <Text fontSize="sm" color="gray.600">{selectedDeliverable.student_id}</Text>
                    <Badge colorScheme={getStatusColor(selectedDeliverable.status)} mt={1} borderRadius="md">
                      {getStatusText(selectedDeliverable.status)}
                    </Badge>
                  </Box>
                </HStack>

                <Box>
                  <Text fontWeight="600" mb={2}>Student Remarks</Text>
                  <Text p={3} bg="gray.100" borderRadius="lg" fontSize="sm">
                    {selectedDeliverable.remarks || "No remarks provided"}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Submitted Files</Text>
                  <VStack spacing={2}>
                    {selectedDeliverable.file_paths?.map((path, idx) => {
                      const fileName = path.split('/').pop() || `file_${idx + 1}`;
                      return (
                        <HStack key={idx} justify="space-between" w="full" p={2} bg="gray.100" borderRadius="lg">
                          <HStack>
                            <Icon as={getFileIcon(fileName)} color={getFileColor(fileName)} />
                            <Text fontSize="sm">{fileName}</Text>
                          </HStack>
                          <Button size="sm" onClick={() => downloadFile(path, fileName)} leftIcon={<FaDownload />} borderRadius="md">
                            Download
                          </Button>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>

                {selectedDeliverable.feedback && (
                  <Box>
                    <Text fontWeight="600" mb={2}>Your Feedback</Text>
                    <Text p={3} bg="green.50" borderRadius="lg" fontSize="sm">
                      {selectedDeliverable.feedback}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} borderRadius="lg">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Review Modal with curved edges */}
      <Modal isOpen={isReviewOpen} onClose={cancelReview} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaEdit} />
              <Text fontWeight="bold">Review Submission</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="600">Marks (0-100)</FormLabel>
                <NumberInput min={0} max={100} value={reviewForm.marks} onChange={(v) => setReviewForm({...reviewForm, marks: v})}>
                  <NumberInputField borderRadius="lg" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Status</FormLabel>
                <select 
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({...reviewForm, status: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    fontSize: '14px'
                  }}
                >
                  <option value="approved">Approve</option>
                  <option value="submitted">Request Changes</option>
                </select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Feedback</FormLabel>
                <Textarea
                  placeholder="Provide constructive feedback... "
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})}
                  minH="100px"
                  borderRadius="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={cancelReview} borderRadius="lg">Cancel</Button>
            <HStack>
              <Button colorScheme="orange" onClick={() => submitReview("request_changes")} leftIcon={<FaTimesCircle />} borderRadius="lg">
                Request Changes
              </Button>
              <Button colorScheme="green" onClick={() => submitReview("approve")} leftIcon={<FaCheckCircle />} borderRadius="lg">
                Approve
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}