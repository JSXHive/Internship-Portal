import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Grid,
  Flex,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Center,
  keyframes,
  useBreakpointValue,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaCertificate,
  FaComments,
  FaStar,
  FaRocket,
  FaCalendarCheck,
  FaAward,
  FaChartBar,
  FaArrowLeft,
  FaExclamationTriangle,
  FaUserTie,
  FaUpload,
  FaFileAlt,
  FaEnvelope,
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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

export default function InternshipProgress() {
  const router = useRouter();
  const [studentInfo, setStudentInfo] = useState({});
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mentorAllocated, setMentorAllocated] = useState(true);
  const [internshipStarted, setInternshipStarted] = useState(true);
  const [internshipInfo, setInternshipInfo] = useState(null);
  const [mentorFeedback, setMentorFeedback] = useState([]);
  const [error, setError] = useState('');
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // Responsive values
  const headerSize = useBreakpointValue({ base: "2xl", md: "4xl" });
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format internship duration on one line
  const formatInternshipDuration = (startDate, endDate) => {
    if (!startDate) return 'Not set';
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} - ${end}`;
  };

  // Calculate progress statistics - CORRECTED LOGIC
  const calculateProgress = () => {
    const totalTasks = tasks.length;
    
    // Count completed tasks (only those marked as 'completed' or 'reviewed' in database)
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' || task.status === 'reviewed'
    ).length;
    
    // Count submitted tasks that are pending review
    const submittedTasks = tasks.filter(task => 
      task.status === 'submitted'
    ).length;
    
    // Count pending tasks
    const pendingTasks = tasks.filter(task => 
      task.status === 'pending' || task.status === 'in-progress'
    ).length;

    // Progress percentage based on completed tasks only
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      submittedTasks,
      progressPercentage
    };
  };

  // Calculate deliverables progress
  const calculateDeliverablesProgress = () => {
    const totalDeliverables = deliverables.length;
    const approvedDeliverables = deliverables.filter(d => 
      d.status === 'approved' || d.status === 'reviewed'
    ).length;
    const submittedDeliverables = deliverables.filter(d => 
      d.status === 'submitted'
    ).length;
    const pendingDeliverables = totalDeliverables - approvedDeliverables - submittedDeliverables;

    const progressPercentage = totalDeliverables > 0 ? Math.round((approvedDeliverables / totalDeliverables) * 100) : 0;

    return {
      totalDeliverables,
      approvedDeliverables,
      submittedDeliverables,
      pendingDeliverables,
      progressPercentage
    };
  };

  // Determine certificate eligibility - UPDATED LOGIC
  const getCertificateEligibility = () => {
    const progress = calculateProgress();
    const deliverablesProgress = calculateDeliverablesProgress();
    const attendanceRate = attendance.percentage || 0;
    
    // Certificate eligibility is determined by mentor, not automatic
    // Show progress towards typical requirements
    const isEligible = false; // Always false since mentor provides certificate
    
    return {
      isEligible,
      requirements: {
        minTasks: 80,
        minAttendance: 75,
        currentTasks: progress.progressPercentage,
        currentAttendance: attendanceRate,
        currentDeliverables: deliverablesProgress.progressPercentage
      },
      mentorMessage: "Certificate will be provided by your mentor upon successful completion"
    };
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'reviewed':
      case 'approved':
        return { color: 'green', icon: FaCheckCircle, text: 'Completed' };
      case 'submitted':
        return { color: 'blue', icon: FaCheckCircle, text: 'Submitted' };
      case 'in-progress':
        return { color: 'orange', icon: FaClock, text: 'In Progress' };
      default:
        return { color: 'gray', icon: FaClock, text: 'Pending' };
    }
  };

  // Get achievement level based on progress
  const getAchievementLevel = () => {
    const progress = calculateProgress();
    if (progress.progressPercentage >= 90) return { level: "Expert", color: "purple", icon: FaAward };
    if (progress.progressPercentage >= 75) return { level: "Advanced", color: "green", icon: FaChartBar };
    if (progress.progressPercentage >= 50) return { level: "Intermediate", color: "blue", icon: FaChartLine };
    return { level: "Beginner", color: "orange", icon: FaRocket };
  };

  // Get feedback title (task title or deliverable title)
  const getFeedbackTitle = (feedback) => {
    if (feedback.task_title) {
      if (feedback.feedback_type === 'deliverable') {
        return feedback.task_title; // This will be "Deliverable - [submission_id]"
      }
      return feedback.task_title;
    }
    if (feedback.submission_id) return `Deliverable #${feedback.submission_id}`;
    return 'Task/Project';
  };

  // CORRECTED data fetching with 2-second minimum loading
  useEffect(() => {
    const minimumLoadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    const fetchData = async () => {
      const startTime = Date.now();

      try {
        setIsLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) {
          router.push('/login');
          return;
        }

        // Fetch all data in parallel
        const [studentInfoResponse, tasksResponse, deliverablesResponse, attendanceResponse, feedbackResponse] = await Promise.allSettled([
          fetch(`/api/student-progress/student-info?userId=${userId}`),
          fetch(`/api/student-progress/tasks?studentId=${userId}`),
          fetch(`/api/student-progress/deliverables?studentId=${userId}`),
          fetch(`/api/student-progress/attendance?studentId=${userId}`),
          fetch(`/api/student-progress/mentor-feedback?studentId=${userId}`)
        ]);

        // Process student info
        if (studentInfoResponse.status === 'fulfilled' && studentInfoResponse.value.ok) {
          const studentData = await studentInfoResponse.value.json();
          setStudentInfo(studentData);
          
          // Check if mentor is allocated
          setMentorAllocated(!!studentData.mentor_name || !!studentData.mentor);
          
          // Check if internship has started
          if (studentData.start_date) {
            const startDate = new Date(studentData.start_date);
            const today = new Date();
            setInternshipStarted(today >= startDate);
            setInternshipInfo(studentData);
          }
        } else {
          // Fallback to user details
          const userDetailsResponse = await fetch(`/api/userdetails?userId=${userId}`);
          if (userDetailsResponse.ok) {
            const userData = await userDetailsResponse.json();
            setStudentInfo({
              name: userData.name,
              student_id: userData.student_number || userData.student_id,
              email: userData.email
            });
          }
        }

        // Process tasks
        if (tasksResponse.status === 'fulfilled' && tasksResponse.value.ok) {
          const tasksData = await tasksResponse.value.json();
          setTasks(Array.isArray(tasksData) ? tasksData : []);
        }

        // Process deliverables
        if (deliverablesResponse.status === 'fulfilled' && deliverablesResponse.value.ok) {
          const deliverablesData = await deliverablesResponse.value.json();
          setDeliverables(Array.isArray(deliverablesData) ? deliverablesData : []);
        }

        // Process attendance
        if (attendanceResponse.status === 'fulfilled' && attendanceResponse.value.ok) {
          const attendanceData = await attendanceResponse.value.json();
          setAttendance(attendanceData);
        }

        // Process mentor feedback
        if (feedbackResponse.status === 'fulfilled' && feedbackResponse.value.ok) {
          const feedbackData = await feedbackResponse.value.json();
          setMentorFeedback(Array.isArray(feedbackData) ? feedbackData : []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load some data. Please refresh the page.');
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
  }, [router, minimumLoadTimePassed]);

  // Loading state
  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #38A169 0%, #2F855A 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaChartLine} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading your progress...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  // Show message if no mentor is assigned
  if (!mentorAllocated) {
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
                  You cannot view progress until a mentor has been assigned to you.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait for our team to allocate a mentor to your account. Once a mentor is assigned, 
                  you&apos;ll be able to track your internship progress through this portal.
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  You can view progress only after a mentor is allocated to you.
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
  if (!internshipStarted && mentorAllocated && !isLoading) {
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

  const progress = calculateProgress();
  const deliverablesProgress = calculateDeliverablesProgress();
  const certificateEligibility = getCertificateEligibility();
  const achievement = getAchievementLevel();

  // CORRECTED Back to Dashboard function
  const handleBackToDashboard = () => {
    router.push('/student/dashboard');
  };

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={8} px={4}>
      <Box maxW="7xl" mx="auto">
        {/* Header with Back Button - UPDATED */}
        <HStack mb={6}>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleBackToDashboard}
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
        </HStack>

        {/* Error Alert */}
        {error && (
          <Alert status="warning" mb={6} borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          mb={8}
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
              bgGradient: "linear(to-r, blue.400, teal.400, pink.400)",
              backgroundSize: "200% 200%",
              animation: `${gradient} 3s ease infinite`,
            }}
          >
            <CardBody p={8}>
              <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
                <Box flex={1}>
                  <Heading
                    color="gray.800"
                    fontSize={headerSize}
                    fontWeight="700"
                    mb={3}
                    bgGradient="linear(to-r, blue.600, teal.600)"
                    bgClip="text"
                    fontFamily="'Segoe UI', sans-serif"
                    lineHeight="1.3"
                  >
                    Internship Progress
                  </Heading>
                  <Text color={textColor} fontSize="lg" mb={4} fontFamily="'Segoe UI', sans-serif">
                    Track your internship journey and accomplishments
                  </Text>
                  
                  {/* Achievement Badge */}
                  <HStack spacing={4} mb={4} flexWrap="wrap">
                    <Badge 
                      colorScheme={achievement.color} 
                      fontSize="sm" 
                      px={4} 
                      py={2} 
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={achievement.icon} />
                      <Text>{achievement.level} Level</Text>
                    </Badge>
                    <Badge colorScheme="blue" fontSize="sm" px={4} py={2} borderRadius="full">
                      <HStack>
                        <Icon as={FaTasks} />
                        <Text>Total Tasks: {progress.totalTasks}</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="green" fontSize="sm" px={4} py={2} borderRadius="full">
                      <HStack>
                        <Icon as={FaCheckCircle} />
                        <Text>Completed: {progress.completedTasks}</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="teal" fontSize="sm" px={4} py={2} borderRadius="full">
                      <HStack>
                        <Icon as={FaFileAlt} />
                        <Text>Deliverables: {deliverablesProgress.totalDeliverables}</Text>
                      </HStack>
                    </Badge>
                  </HStack>
                </Box>
                
                <MotionBox
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  mt={{ base: 6, md: 0 }}
                  fontSize="6xl"
                  textAlign="center"
                >
                  🚀
                </MotionBox>
              </Flex>
            </CardBody>
          </Card>
        </MotionBox>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Left Column - Main Content */}
          <VStack spacing={8} align="stretch">
            {/* Student Information - UPDATED with Email and Internship Duration brought down */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Student Information
                  </Box>
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s">
                    <HStack>
                      <Icon as={FaUser} color="blue.500" />
                      <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Name</Text>
                    </HStack>
                    <Text fontWeight="500" fontFamily="'Segoe UI', sans-serif">{studentInfo.name || 'Not available'}</Text>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s">
                    <HStack>
                      <Icon as={FaIdCard} color="blue.500" />
                      <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Student ID</Text>
                    </HStack>
                    <Text fontWeight="500" fontFamily="'Segoe UI', sans-serif">{studentInfo.student_id || studentInfo.student_number || 'Not assigned'}</Text>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s">
                    <HStack>
                      <Icon as={FaEnvelope} color="blue.500" />
                      <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Email ID</Text>
                    </HStack>
                    <Text fontWeight="500" fontFamily="'Segoe UI', sans-serif" fontSize="sm">{studentInfo.email || 'Not available'}</Text>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s">
                    <HStack>
                      <Icon as={FaUser} color="blue.500" />
                      <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Mentor</Text>
                    </HStack>
                    <Text fontWeight="500" fontFamily="'Segoe UI', sans-serif">{studentInfo.mentor_name || studentInfo.mentor || 'Not assigned'}</Text>
                  </HStack>

                  {/* UPDATED: Internship Duration brought down and made smaller */}
                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s" gridColumn={{ base: "1", md: "1 / -1" }}>
                    <HStack>
                      <Icon as={FaCalendarAlt} color="blue.500" />
                      <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Internship Duration</Text>
                    </HStack>
                    <Text fontWeight="500" fontFamily="'Segoe UI', sans-serif" fontSize="sm" textAlign="right">
                      {formatInternshipDuration(studentInfo.start_date, studentInfo.end_date)}
                    </Text>
                  </HStack>
                </SimpleGrid>
              </CardBody>
            </MotionCard>

            {/* Progress Overview */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={6} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Progress Overview
                  </Box>
                </Heading>
                
                <SimpleGrid columns={gridColumns} spacing={6} mb={6}>
                  <Stat textAlign="center" p={4} borderRadius="lg" bg="green.50" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
                    <StatLabel fontFamily="'Segoe UI', sans-serif" color="gray.600">Total Tasks</StatLabel>
                    <StatNumber color="green.600" fontFamily="'Segoe UI', sans-serif">{progress.totalTasks}</StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">Assigned</StatHelpText>
                  </Stat>

                  <Stat textAlign="center" p={4} borderRadius="lg" bg="blue.50" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
                    <StatLabel fontFamily="'Segoe UI', sans-serif" color="gray.600">Completed</StatLabel>
                    <StatNumber color="blue.600" fontFamily="'Segoe UI', sans-serif">{progress.completedTasks}</StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif" color="green.500">
                      {progress.totalTasks > 0 ? Math.round((progress.completedTasks / progress.totalTasks) * 100) : 0}%
                    </StatHelpText>
                  </Stat>

                  <Stat textAlign="center" p={4} borderRadius="lg" bg="teal.50" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
                    <StatLabel fontFamily="'Segoe UI', sans-serif" color="gray.600">Deliverables</StatLabel>
                    <StatNumber color="teal.600" fontFamily="'Segoe UI', sans-serif">{deliverablesProgress.approvedDeliverables}/{deliverablesProgress.totalDeliverables}</StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">Approved</StatHelpText>
                  </Stat>

                  <Stat textAlign="center" p={4} borderRadius="lg" bg="orange.50" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
                    <StatLabel fontFamily="'Segoe UI', sans-serif" color="gray.600">Attendance</StatLabel>
                    <StatNumber color="orange.600" fontFamily="'Segoe UI', sans-serif">{attendance.percentage || 0}%</StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">Overall</StatHelpText>
                  </Stat>
                </SimpleGrid>

                {/* Progress Bar */}
                <Box position="relative">
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="600" fontFamily="'Segoe UI', sans-serif">Overall Progress</Text>
                    <Text fontWeight="600" color="blue.600" fontFamily="'Segoe UI', sans-serif">
                      {progress.progressPercentage}%
                    </Text>
                  </Flex>
                  <Progress 
                    value={progress.progressPercentage} 
                    size="lg" 
                    colorScheme="blue" 
                    borderRadius="full"
                    bg="blue.100"
                    hasStripe
                    isAnimated
                  />
                  <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif" textAlign="center" mt={2}>
                    {progress.completedTasks} out of {progress.totalTasks} tasks completed
                    {progress.submittedTasks > 0 && ` • ${progress.submittedTasks} under review`}
                  </Text>
                </Box>
              </CardBody>
            </MotionCard>

            {/* Task Breakdown */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={6} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Task Breakdown
                  </Box>
                </Heading>
                
                {tasks.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Icon as={FaTasks} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontFamily="'Segoe UI', sans-serif">No tasks assigned yet</Text>
                      <Text fontSize="sm" color="gray.400" fontFamily="'Segoe UI', sans-serif">
                        Your mentor will assign tasks soon
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th fontFamily="'Segoe UI', sans-serif">Task Name</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Status</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Due Date</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Mentor Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tasks.map((task) => {
                          const statusConfig = getStatusConfig(task.status);
                          return (
                            <Tr key={task.task_id} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                              <Td fontWeight="500" fontFamily="'Segoe UI', sans-serif">{task.title}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={statusConfig.color} 
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontSize="sm"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                >
                                  <HStack spacing={1}>
                                    <Icon as={statusConfig.icon} />
                                    <Text>{statusConfig.text}</Text>
                                  </HStack>
                                </Badge>
                              </Td>
                              <Td fontFamily="'Segoe UI', sans-serif">{formatDate(task.due_date)}</Td>
                              <Td fontFamily="'Segoe UI', sans-serif" maxW="200px">
                                <Text noOfLines={2} fontSize="sm">
                                  {task.mentor_feedback || task.remarks || '-'}
                                </Text>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </MotionCard>

            {/* Deliverables Breakdown - NEW SECTION */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={6} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Deliverables Breakdown
                  </Box>
                </Heading>
                
                {deliverables.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                      <Text color="gray.500" fontFamily="'Segoe UI', sans-serif">No deliverables submitted yet</Text>
                      <Text fontSize="sm" color="gray.400" fontFamily="'Segoe UI', sans-serif">
                        Submit your project deliverables for review
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th fontFamily="'Segoe UI', sans-serif">Submission ID</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Status</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Submission Date</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Marks</Th>
                          <Th fontFamily="'Segoe UI', sans-serif">Feedback</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {deliverables.map((deliverable) => {
                          const statusConfig = getStatusConfig(deliverable.status);
                          return (
                            <Tr key={deliverable.id} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                              <Td fontWeight="500" fontFamily="'Segoe UI', sans-serif">
                                {deliverable.submission_id}
                              </Td>
                              <Td>
                                <Badge 
                                  colorScheme={statusConfig.color} 
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontSize="sm"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                >
                                  <HStack spacing={1}>
                                    <Icon as={statusConfig.icon} />
                                    <Text>{statusConfig.text}</Text>
                                  </HStack>
                                </Badge>
                              </Td>
                              <Td fontFamily="'Segoe UI', sans-serif">{formatDate(deliverable.submission_date)}</Td>
                              <Td fontFamily="'Segoe UI', sans-serif">
                                {deliverable.marks ? `${deliverable.marks}/100` : '-'}
                              </Td>
                              <Td fontFamily="'Segoe UI', sans-serif" maxW="200px">
                                <Text noOfLines={2} fontSize="sm">
                                  {deliverable.feedback || deliverable.remarks || '-'}
                                </Text>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </VStack>

          {/* Right Column - Sidebar */}
          <VStack spacing={8} align="stretch">
            {/* Certificate Status - UPDATED */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Certificate Status
                  </Box>
                </Heading>
                
                <Alert
                  status="info"
                  borderRadius="lg"
                  mb={4}
                  variant="left-accent"
                >
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">
                      Certificate by Mentor
                    </Text>
                    <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                      {certificateEligibility.mentorMessage}
                    </Text>
                  </Box>
                </Alert>

                <VStack spacing={3} align="stretch">
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Task Progress</Text>
                      <Text fontSize="sm" fontWeight="600" fontFamily="'Segoe UI', sans-serif">
                        {certificateEligibility.requirements.currentTasks}%
                      </Text>
                    </Flex>
                    <Progress 
                      value={certificateEligibility.requirements.currentTasks} 
                      size="sm" 
                      colorScheme={
                        certificateEligibility.requirements.currentTasks >= 80 ? "green" :
                        certificateEligibility.requirements.currentTasks >= 50 ? "blue" : "orange"
                      }
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Deliverables Progress</Text>
                      <Text fontSize="sm" fontWeight="600" fontFamily="'Segoe UI', sans-serif">
                        {certificateEligibility.requirements.currentDeliverables}%
                      </Text>
                    </Flex>
                    <Progress 
                      value={certificateEligibility.requirements.currentDeliverables} 
                      size="sm" 
                      colorScheme={
                        certificateEligibility.requirements.currentDeliverables >= 80 ? "green" :
                        certificateEligibility.requirements.currentDeliverables >= 50 ? "blue" : "orange"
                      }
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Attendance Rate</Text>
                      <Text fontSize="sm" fontWeight="600" fontFamily="'Segoe UI', sans-serif">
                        {certificateEligibility.requirements.currentAttendance}%
                      </Text>
                    </Flex>
                    <Progress 
                      value={certificateEligibility.requirements.currentAttendance} 
                      size="sm" 
                      colorScheme={
                        certificateEligibility.requirements.currentAttendance >= 75 ? "green" :
                        certificateEligibility.requirements.currentAttendance >= 50 ? "blue" : "orange"
                      }
                      borderRadius="full"
                    />
                  </Box>
                </VStack>

                <Box mt={4} p={3} bg="yellow.50" borderRadius="lg" borderLeft="4px solid" borderColor="yellow.400">
                  <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif" color="yellow.800">
                    <strong>Note:</strong> Your mentor will evaluate your overall performance and provide the certificate upon successful completion of your internship.
                  </Text>
                </Box>
              </CardBody>
            </MotionCard>

            {/* Latest Mentor Feedback - UPDATED */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Mentor Feedback
                  </Box>
                </Heading>
                
                {mentorFeedback.length === 0 ? (
                  <Center py={4}>
                    <VStack spacing={2}>
                      <Icon as={FaComments} boxSize={8} color="gray.400" />
                      <Text color="gray.500" fontFamily="'Segoe UI', sans-serif" textAlign="center">
                        No feedback yet
                      </Text>
                      <Text fontSize="sm" color="gray.400" fontFamily="'Segoe UI', sans-serif" textAlign="center">
                        Your mentor will provide feedback on your submissions
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {mentorFeedback.slice(0, 3).map((feedback, index) => (
                      <MotionBox
                        key={index}
                        p={4}
                        borderRadius="lg"
                        bg="blue.50"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Text fontSize="sm" fontWeight="600" color="blue.700" mb={1} fontFamily="'Segoe UI', sans-serif">
                          {getFeedbackTitle(feedback)}
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">
                          {formatDate(feedback.feedback_date || feedback.reviewed_at)}
                        </Text>
                        <Text fontFamily="'Segoe UI', sans-serif" mb={2}>
                          {feedback.mentor_feedback || feedback.feedback || 'No feedback provided'}
                        </Text>
                        {(feedback.marks || feedback.marks === 0) && (
                          <HStack>
                            <Icon as={FaStar} color="yellow.500" />
                            <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                              Marks: {feedback.marks}/100
                            </Text>
                          </HStack>
                        )}
                      </MotionBox>
                    ))}
                    
                    {mentorFeedback.length > 3 && (
                      <Text 
                        fontSize="sm" 
                        color="blue.600" 
                        textAlign="center" 
                        fontFamily="'Segoe UI', sans-serif"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                      >
                        View all {mentorFeedback.length} feedback entries
                      </Text>
                    )}
                  </VStack>
                )}
              </CardBody>
            </MotionCard>

            {/* Quick Stats - UPDATED */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              whileHover={{ scale: 1.02 }}
              cursor="pointer"
            >
              <CardBody p={6}>
                <Heading size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', sans-serif">
                  <Box as="span" borderBottom="2px solid" borderColor="blue.300" pb={1}>
                    Quick Stats
                  </Box>
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" p={3} borderRadius="lg" bg="green.50" _hover={{ bg: "green.100" }} transition="background-color 0.2s">
                    <Text fontFamily="'Segoe UI', sans-serif">Tasks Completed</Text>
                    <Badge colorScheme="green" fontSize="md" borderRadius="full" px={3}>
                      {progress.completedTasks}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="blue.50" _hover={{ bg: "blue.100" }} transition="background-color 0.2s">
                    <Text fontFamily="'Segoe UI', sans-serif">Under Review</Text>
                    <Badge colorScheme="blue" fontSize="md" borderRadius="full" px={3}>
                      {progress.submittedTasks}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="teal.50" _hover={{ bg: "teal.100" }} transition="background-color 0.2s">
                    <Text fontFamily="'Segoe UI', sans-serif">Deliverables Approved</Text>
                    <Badge colorScheme="teal" fontSize="md" borderRadius="full" px={3}>
                      {deliverablesProgress.approvedDeliverables}/{deliverablesProgress.totalDeliverables}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" p={3} borderRadius="lg" bg="orange.50" _hover={{ bg: "orange.100" }} transition="background-color 0.2s">
                    <Text fontFamily="'Segoe UI', sans-serif">Overall Progress</Text>
                    <Badge colorScheme="orange" fontSize="md" borderRadius="full" px={3}>
                      {progress.progressPercentage}%
                    </Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Motivational Quote */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              borderRadius="xl"
            >
              <CardBody p={6} textAlign="center">
                <Icon as={FaRocket} boxSize={8} mb={3} />
                <Text fontFamily="'Segoe UI', sans-serif" fontWeight="bold" mb={2}>
                  Keep Going!
                </Text>
                <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif" opacity={0.9}>
                  &quot;The expert in anything was once a beginner. Every task you complete brings you closer to mastery.&quot;
                </Text>
              </CardBody>
            </MotionCard>
          </VStack>
        </Grid>
      </Box>
    </Box>
  );
}