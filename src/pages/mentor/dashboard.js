import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  useColorModeValue,
  keyframes,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Spinner,
  Card,
  CardBody,
  Badge,
  HStack,
  VStack,
  Avatar,
  useToast,
  Grid,
  GridItem,
  Center,
  Container,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
} from "@chakra-ui/react";
import { FaArrowRight, FaAward, FaCalendarAlt, FaCalendarCheck, FaCertificate, FaChalkboardTeacher, FaChartLine, FaCheckCircle, FaCheckSquare, FaClipboardCheck, FaClock, FaCommentDots, FaCopy, FaExclamationTriangle, FaIdCard, FaRegSmileWink, FaRocket, FaShieldAlt, FaSignOutAlt, FaSync, FaTasks, FaTrophy, FaUpload, FaUser, FaUserCheck, FaUsers } from 'react-icons/fa';
import { useRouter } from "next/router";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

export default function MentorDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [mentorName, setMentorName] = useState("Mentor Name");
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Colors
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.600", "blue.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Enhanced dashboard data fetching
  const fetchDashboardData = useCallback(async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data for mentor:', userId);

      const response = await fetch(`/api/mentor/dashboard-data?mentorId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', data);

      // Set all data directly from the API
      setStudents(data.students || []);
      setTasks(data.tasks || []);
      setDeliverables(data.deliverables || []);
      setCertificates(data.certificates || []);
      setAttendance(data.attendance || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setLoading(false);
      
      // Fallback: Try individual endpoints if consolidated endpoint fails
      try {
        console.log('Trying fallback individual endpoints...');
        const endpoints = [
          `/api/mentor/students?mentorId=${userId}`,
          `/api/mentor/tasks?mentorId=${userId}`,
          `/api/mentor/deliverables?mentorId=${userId}`,
          `/api/mentor/certificates?mentorId=${userId}`,
          `/api/mentor/attendance?mentorId=${userId}`
        ];

        const responses = await Promise.allSettled(
          endpoints.map(url => fetch(url).then(r => r.ok ? r.json() : []))
        );

        const [studentsData, tasksData, deliverablesData, certificatesData, attendanceData] = responses.map(
          (result, index) => result.status === 'fulfilled' ? result.value : []
        );

        // Extract arrays from responses
        setStudents(Array.isArray(studentsData) ? studentsData : studentsData?.students || studentsData?.data || []);
        setTasks(Array.isArray(tasksData) ? tasksData : tasksData?.tasks || tasksData?.data || []);
        setDeliverables(Array.isArray(deliverablesData) ? deliverablesData : deliverablesData?.deliverables || deliverablesData?.data || []);
        setCertificates(Array.isArray(certificatesData) ? certificatesData : certificatesData?.certificates || certificatesData?.data || []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : attendanceData?.attendance || attendanceData?.data || []);

      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast({ 
          title: "Error loading dashboard", 
          description: "Some data might be incomplete. Please try refreshing.", 
          status: "error",
          duration: 5000 
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    
    if (!storedUser || !userId) {
      setAuthError(true);
      setLoading(false);
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
        status: "error",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "mentor") {
        router.push("/");
        return;
      }
      setMentorName(parsedUser.name || "Mentor");
      fetchDashboardData(userId);
    } catch {
      setMentorName("Mentor");
      fetchDashboardData(userId);
    }
  }, [fetchDashboardData, toast, router]);

  const handleRefresh = () => {
    setRefreshing(true);
    const userId = localStorage.getItem("userId");
    fetchDashboardData(userId).then(() => {
      setRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Dashboard updated with latest information",
        status: "success",
        duration: 2000,
      });
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/");
  };

  // Get student IDs for filtering
  const studentUserIds = useMemo(() => {
    return students.map(student => student.user_id).filter(Boolean);
  }, [students]);

  const studentIds = useMemo(() => {
    return students.map(student => student.student_id).filter(Boolean);
  }, [students]);

  // Enhanced filtering function that handles multiple ID fields
  const filterByStudentIds = useCallback((items) => {
    if ((!studentUserIds.length && !studentIds.length) || !items.length) {
      return [];
    }
    
    return items.filter(item => {
      // Try all possible student ID fields
      const itemStudentId = item.student_id || item.studentId;
      const itemUserId = item.user_id || item.userId || item.assigned_to || item.submitted_by;
      
      return studentIds.includes(itemStudentId) || studentUserIds.includes(itemUserId);
    });
  }, [studentUserIds, studentIds]);

  // Filter data to show only mentor's students
  const mentorTasks = useMemo(() => filterByStudentIds(tasks), [filterByStudentIds, tasks]);
  const mentorDeliverables = useMemo(() => filterByStudentIds(deliverables), [filterByStudentIds, deliverables]);
  const mentorCertificates = useMemo(() => filterByStudentIds(certificates), [filterByStudentIds, certificates]);
  const mentorAttendance = useMemo(() => filterByStudentIds(attendance), [filterByStudentIds, attendance]);

  // Calculate tasks pending review
  const tasksPendingReview = useMemo(() => {
    return mentorTasks.filter(task => {
      const status = task.submission_status?.toLowerCase() || task.status?.toLowerCase();
      return status === 'submitted' || status === 'pending' || status === 'under_review';
    }).length;
  }, [mentorTasks]);

  // Calculate deliverables pending review
  const deliverablesPendingReview = useMemo(() => {
    return mentorDeliverables.filter(deliverable => {
      const status = deliverable.status?.toLowerCase();
      return status === 'submitted' || status === 'pending' || status === 'under_review';
    }).length;
  }, [mentorDeliverables]);

  // UPDATED: Calculate certificates pending verification - INCLUDES correction_requested
  const certificatesPendingVerification = useMemo(() => {
    return mentorCertificates.filter(certificate => {
      const status = certificate.status?.toLowerCase();
      // Include certificates that are issued, pending verification, OR correction requested
      return status === 'issued' || status === 'pending_verification' || status === 'correction_requested';
    }).length;
  }, [mentorCertificates]);

  // Calculate certificates with correction requested (for informational purposes)
  const certificatesCorrectionRequested = useMemo(() => {
    return mentorCertificates.filter(certificate => {
      const status = certificate.status?.toLowerCase();
      return status === 'correction_requested';
    }).length;
  }, [mentorCertificates]);

  // Calculate approved certificates
  const approvedCertificates = useMemo(() => {
    return mentorCertificates.filter(certificate => {
      const status = certificate.status?.toLowerCase();
      return status === 'verified';
    }).length;
  }, [mentorCertificates]);

  // Calculate attendance stats
  const attendanceStats = useMemo(() => {
    const present = mentorAttendance.filter(record => 
      record.status?.toLowerCase() === 'present' || record.present === true
    ).length;
    
    const absent = mentorAttendance.filter(record => 
      record.status?.toLowerCase() === 'absent' || record.present === false
    ).length;
    
    return { present, absent, total: mentorAttendance.length };
  }, [mentorAttendance]);

  // Calculate absent students count (last 7 days)
  const absentStudentsCount = useMemo(() => {
    if (!mentorAttendance.length) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const absentStudentIds = new Set();
    mentorAttendance.forEach(record => {
      const recordDate = new Date(record.date || record.createdAt || record.timestamp);
      if (recordDate >= oneWeekAgo) {
        const status = record.status?.toLowerCase();
        const isPresent = record.present;
        
        if (status === 'absent' || isPresent === false) {
          const studentId = record.student_id || record.studentId;
          if (studentId) absentStudentIds.add(studentId);
        }
      }
    });
    
    return absentStudentIds.size;
  }, [mentorAttendance]);

  // UPDATED: Get certificate status message - Better text formatting for the card
  const getCertificateStatusMessage = useMemo(() => {
    if (certificatesPendingVerification === 0) {
      return "All certificates ready";
    } else {
      if (certificatesCorrectionRequested > 0) {
        return `${certificatesPendingVerification} pending (${certificatesCorrectionRequested} need corrections)`;
      } else {
        return `${certificatesPendingVerification} awaiting verification`;
      }
    }
  }, [certificatesPendingVerification, certificatesCorrectionRequested]);

  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log('=== DASHBOARD COUNTS ===');
      console.log('Students:', students.length);
      console.log('Student User IDs:', studentUserIds);
      console.log('Student IDs:', studentIds);
      console.log('Tasks - Total:', tasks.length, 'Mentor:', mentorTasks.length, 'Pending Review:', tasksPendingReview);
      console.log('Deliverables - Total:', deliverables.length, 'Mentor:', mentorDeliverables.length, 'Pending Review:', deliverablesPendingReview);
      console.log('Certificates - Total:', certificates.length, 'Mentor:', mentorCertificates.length, 'Pending Verification:', certificatesPendingVerification, 'Correction Requested:', certificatesCorrectionRequested, 'Verified:', approvedCertificates);
      console.log('Attendance - Total:', attendance.length, 'Mentor:', mentorAttendance.length);
      console.log('Certificate Status Message:', getCertificateStatusMessage);
      console.log('========================');
    }
  }, [loading, students, studentUserIds, studentIds, tasks, mentorTasks, tasksPendingReview, deliverables, mentorDeliverables, deliverablesPendingReview, certificates, mentorCertificates, certificatesPendingVerification, certificatesCorrectionRequested, approvedCertificates, attendance, mentorAttendance, getCertificateStatusMessage]);

  // UPDATED Stats data with corrected certificate status message and fixed icon
  const statsData = [
    {
      label: "Students Allocated",
      value: students.length,
      helpText: "Currently assigned to you",
      icon: FaUsers,
      color: "blue",
      trend: students.length > 0 ? "All actively participating" : "No students assigned",
      gradient: "linear(to-br, blue.400, blue.600)",
      emoji: "👨‍🎓",
    },
    {
      label: "Tasks to Review",
      value: tasksPendingReview,
      helpText: "Student submissions awaiting review",
      icon: FaCheckSquare,
      color: "cyan",
      trend: `${tasksPendingReview} need evaluation`,
      gradient: "linear(to-br, cyan.400, cyan.600)",
      emoji: "📝",
    },
    {
      label: "Deliverables to Review",
      value: deliverablesPendingReview,
      helpText: "Submitted by your students",
      icon: FaClipboardCheck,
      color: "orange",
      trend: `${deliverablesPendingReview} awaiting review`,
      gradient: "linear(to-br, orange.400, orange.600)",
      emoji: "📊",
    },
    {
      label: "Pending Certificate Verification",
      value: certificatesPendingVerification,
      helpText: "Certificates awaiting your verification",
      icon: FaShieldAlt, // Changed from FaShieldCheck to FaShieldAlt
      color: "purple",
      trend: getCertificateStatusMessage, // UPDATED: Uses the dynamic status message
      gradient: "linear(to-br, purple.400, purple.600)",
      emoji: "🔍",
    }
  ];

  // Tool cards - Changed certificate count to show pending verification (includes correction_requested)
  const toolCards = [
    {
      icon: <FaUsers size={24} />,
      title: "Manage Students",
      desc: "View and guide your allocated students",
      onClick: () => router.push("/mentor/students"),
      color: "blue",
      count: null,
      gradient: "linear(to-r, blue.500, blue.600)",
      actionText: "View Students",
    },
    {
      icon: <FaTasks size={24} />,
      title: "Assign Tasks",
      desc: "Create and assign tasks to students",
      onClick: () => router.push("/mentor/tasks"),
      color: "green",
      count: 0,
      gradient: "linear(to-r, green.500, green.600)",
      actionText: "Create Tasks",
      disabled: students.length === 0,
    },
    {
      icon: <FaCheckSquare size={24} />,
      title: "Review Tasks",
      desc: "Review and evaluate completed student tasks",
      onClick: () => router.push("/mentor/review-tasks"),
      color: "cyan",
      count: tasksPendingReview,
      gradient: "linear(to-r, cyan.500, cyan.600)",
      actionText: "Review Tasks",
      disabled: students.length === 0,
    },
    {
      icon: <FaClipboardCheck size={24} />,
      title: "Review Deliverables",
      desc: "Evaluate student submissions and provide feedback",
      onClick: () => router.push("/mentor/review-deliverables"),
      color: "orange",
      count: deliverablesPendingReview,
      gradient: "linear(to-r, orange.500, orange.600)",
      actionText: "Review Work",
      disabled: students.length === 0,
    },
    {
      icon: <FaUserCheck size={24} />,
      title: "View Attendance",
      desc: "Monitor student attendance and participation",
      onClick: () => router.push("/mentor/attendance"),
      color: "teal",
      count: absentStudentsCount,
      gradient: "linear(to-r, teal.500, teal.600)",
      actionText: "Check Attendance",
      disabled: students.length === 0,
    },
    {
      icon: <FaCertificate size={24} />,
      title: "Verify Certificates",
      desc: "Review and verify student certificates",
      onClick: () => router.push("/mentor/certificates"),
      color: "purple",
      count: certificatesPendingVerification, // UPDATED: Includes correction_requested
      gradient: "linear(to-r, purple.500, purple.600)",
      actionText: "Verify Certificates",
      disabled: students.length === 0,
    },
  ];

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" fontFamily="'Segoe UI', sans-serif">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="3px" color="blue.500" />
          <Text color="gray.600" fontFamily="'Segoe UI', sans-serif" fontSize="lg">Loading dashboard data...</Text>
        </VStack>
      </Box>
    );
  }

  if (authError) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" fontFamily="'Segoe UI', sans-serif">
        <VStack spacing={4}>
          <Icon as={FaExclamationTriangle} boxSize={12} color="red.500" />
          <Heading size="lg" color="red.600">Authentication Required</Heading>
          <Text color="gray.600">Please log in to access the mentor dashboard</Text>
          <Button colorScheme="blue" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif">
      {/* Enhanced Header */}
      <Box 
        bgGradient="linear(to-r, blue.600, purple.600)" 
        color="white" 
        px={6} 
        py={4} 
        boxShadow="lg"
        position="relative"
        overflow="hidden"
      >
        <Flex justify="space-between" align="center" position="relative" zIndex={1}>
          <HStack spacing={3}>
            <Box 
              bg="white" 
              p={2} 
              borderRadius="md" 
              animation={`${pulse} 2s infinite`}
              boxShadow="0 0 15px rgba(255,255,255,0.5)"
            >
              <Icon as={FaChalkboardTeacher} color="blue.600" boxSize={6} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="2xl" fontWeight="bold" fontFamily="'Segoe UI', sans-serif" textShadow="0 1px 2px rgba(0,0,0,0.2)">
                Mentor Dashboard
              </Text>
              <Text fontSize="md" opacity={0.9} fontFamily="'Segoe UI', sans-serif">
                Info Tech Corporation of Goa • Student Guidance
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={4}>
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              leftIcon={<FaSync />}
              isLoading={refreshing}
              onClick={handleRefresh}
              fontFamily="'Segoe UI', sans-serif"
              fontSize="md"
            >
              Refresh Data
            </Button>

            <Button
              variant="outline"
              colorScheme="blue"
              leftIcon={<FaUser />}
              onClick={() => router.push("/mentor/profile")}
              fontFamily="'Segoe UI', sans-serif"
              fontSize="md"
              borderColor="white"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
            >
              View Profile
            </Button>
            
            <HStack
              spacing={3}
              bg="rgba(255,255,255,0.25)"
              px={4}
              py={2}
              borderRadius="xl"
              backdropFilter="blur(12px)"
              border="2px solid rgba(255,255,255,0.3)"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.4)"
              position="relative"
              overflow="hidden"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <Avatar 
                size="md" 
                name={mentorName} 
                bg="white"
                color="blue.600"
                fontWeight="bold"
                boxShadow="0 0 0 3px rgba(255,255,255,0.5)"
              />
              
              <VStack spacing={0} align="start">
                <Text 
                  fontSize="xs" 
                  fontWeight="medium" 
                  color="white" 
                  opacity={0.9}
                  fontFamily="'Segoe UI', sans-serif"
                  textShadow="0 1px 2px rgba(0,0,0,0.2)"
                >
                  MENTOR
                </Text>
                <Text 
                  fontSize="lg" 
                  fontWeight="bold" 
                  color="white" 
                  fontFamily="'Segoe UI', sans-serif"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  letterSpacing="0.5px"
                >
                  {mentorName}
                </Text>
              </VStack>
            </HStack>

            <Button 
              variant="solid" 
              colorScheme="red" 
              leftIcon={<FaSignOutAlt />}
              onClick={handleLogout}
              fontFamily="'Segoe UI', sans-serif"
              boxShadow="0 2px 5px rgba(0,0,0,0.2)"
              fontSize="md"
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box p={6}>
        {/* Enhanced Welcome Section */}
        <Card 
          mb={6} 
          bg={cardBg} 
          boxShadow="xl"
          fontFamily="'Segoe UI', sans-serif"
          animation={`${fadeIn} 0.5s ease`}
          bgGradient="linear(to-r, blue.50, purple.50)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            bgGradient: "linear(to-r, blue.400, purple.400)",
          }}
        >
          <CardBody p={6}>
            <Flex justify="space-between" align="center" flexDir={{ base: "column", md: "row" }}>
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Box 
                    p={2} 
                    borderRadius="md" 
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    color="white"
                    animation={`${pulse} 2s infinite`}
                  >
                    <Icon as={FaRocket} boxSize={5} />
                  </Box>
                  <Heading as="h1" size="lg" color={accentColor} fontFamily="'Segoe UI', sans-serif" fontSize="2xl">
                    Welcome back, {mentorName}!
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="xl" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                  Here&apos;s your mentoring overview at a glance
                </Text>
                <HStack spacing={4} mt={3} flexWrap="wrap">
                  <Badge 
                    colorScheme="purple" 
                    fontSize="md" 
                    p={2} 
                    fontFamily="'Segoe UI', sans-serif"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <HStack>
                      <FaCalendarCheck />
                      <Text>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    </HStack>
                  </Badge>
                  
                  <Badge 
                    colorScheme="green" 
                    fontSize="md" 
                    p={2} 
                    fontFamily="'Segoe UI', sans-serif"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <HStack>
                      <FaClock />
                      <Text>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</Text>
                    </HStack>
                  </Badge>
                </HStack>
              </VStack>
              <Box 
                animation={`${float} 3s ease-in-out infinite`} 
                mt={{ base: 4, md: 0 }}
                fontSize="4xl"
              >
                🎯
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* UPDATED Statistics Grid with corrected certificate status and fixed icon */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={6}>
          {statsData.map((stat, index) => (
            <Card 
              key={index} 
              bg={cardBg} 
              boxShadow="xl"
              animation={`${fadeIn} 0.5s ease ${index * 0.1}s`}
              fontFamily="'Segoe UI', sans-serif"
              _hover={{ 
                boxShadow: "2xl",
                transform: "translateY(-5px)",
                transition: "all 0.3s ease"
              }}
              borderTop="4px"
              borderTopColor={`${stat.color}.400`}
              position="relative"
              overflow="hidden"
              transition="all 0.3s ease"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                w="100%"
                h="4px"
                bgGradient={stat.gradient}
              />
              <CardBody>
                <Center flexDirection="column" textAlign="center">
                  <Box 
                    p={3} 
                    borderRadius="lg" 
                    bgGradient={stat.gradient}
                    color="white"
                    boxShadow="md"
                    mb={4}
                    animation={`${pulse} 2s infinite`}
                    fontSize="2xl"
                  >
                    {stat.emoji}
                  </Box>
                  <Stat>
                    <StatLabel color={textColor} mb={1} fontSize="md" fontWeight="bold" fontFamily="'Segoe UI', sans-serif">
                      {stat.label}
                    </StatLabel>
                    <StatNumber fontSize="3xl" color={accentColor} fontFamily="'Segoe UI', sans-serif" mb={2}>
                      {stat.value}
                    </StatNumber>
                    <StatHelpText mb={0} fontSize="md" fontFamily="'Segoe UI', sans-serif">
                      {stat.helpText}
                    </StatHelpText>
                  </Stat>
                  {/* UPDATED: Better text wrapping for the trend badge */}
                  <Box mt={3} maxW="full" px={2}>
                    <Badge 
                      colorScheme={stat.color} 
                      variant="subtle"
                      fontSize="sm"
                      fontFamily="'Segoe UI', sans-serif"
                      borderRadius="full"
                      px={3}
                      py={1}
                      textAlign="center"
                      whiteSpace="normal"
                      wordBreak="break-word"
                      lineHeight="1.2"
                    >
                      {stat.trend}
                    </Badge>
                  </Box>
                </Center>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* No Students Assigned Alert */}
        {students.length === 0 && (
          <Alert status="info" mb={6} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>No Students Assigned</AlertTitle>
              <AlertDescription>
                You don&apos;t have any students assigned to you yet. Please contact the administrator to get students allocated to your mentorship.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card 
          bg={cardBg} 
          boxShadow="xl" 
          fontFamily="'Segoe UI', sans-serif"
          animation={`${fadeIn} 0.5s ease 0.2s`} 
          style={{animationFillMode: 'backwards'}}
          overflow="hidden"
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            bgGradient: "linear(to-r, blue.400, purple.400)",
          }}
        >
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h2" size="md" color={accentColor} fontFamily="'Segoe UI', sans-serif" fontSize="xl">
                Quick Actions
              </Heading>
              <Badge colorScheme="blue" fontFamily="'Segoe UI', sans-serif" borderRadius="full" px={3} py={1} fontSize="sm">
                MENTOR TOOLS
              </Badge>
            </Flex>
            <Grid 
              templateColumns={{ 
                base: "repeat(1, 1fr)", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(3, 1fr)",
                xl: "repeat(3, 1fr)" 
              }} 
              gap={5}
            >
              {toolCards.map((tool, index) => (
                <GridItem key={index} colSpan={1}>
                  <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.200"
                    height="100%"
                    _hover={!tool.disabled ? {
                      shadow: "2xl",
                      borderColor: `${tool.color}.400`,
                      cursor: "pointer",
                      transform: "translateY(-3px)"
                    } : {}}
                    transition="all 0.3s ease"
                    onClick={!tool.disabled ? tool.onClick : undefined}
                    position="relative"
                    fontFamily="'Segoe UI', sans-serif"
                    boxShadow="md"
                    overflow="hidden"
                    textAlign="center"
                    opacity={tool.disabled ? 0.6 : 1}
                    cursor={tool.disabled ? "not-allowed" : "pointer"}
                  >
                    {/* Only show pending badge if count exists and is greater than 0 */}
                    {tool.count !== null && tool.count > 0 && (
                      <Box position="absolute" top={3} right={3}>
                        <Badge 
                          colorScheme="red" 
                          variant="solid" 
                          borderRadius="full" 
                          fontFamily="'Segoe UI', sans-serif"
                          boxShadow="md"
                          fontSize="sm"
                        >
                          {tool.count} Pending
                        </Badge>
                      </Box>
                    )}
                    
                    <Center flexDirection="column" mb={4}>
                      <Box 
                        p={3} 
                        borderRadius="xl" 
                        bgGradient={tool.gradient}
                        color="white"
                        boxShadow="md"
                        mb={4}
                        animation={!tool.disabled ? `${float} 3s ease-in-out infinite` : "none"}
                        opacity={tool.disabled ? 0.7 : 1}
                      >
                        {tool.icon}
                      </Box>
                      <VStack spacing={2}>
                        <Heading as="h3" size="sm" fontFamily="'Segoe UI', sans-serif" fontSize="lg">
                          {tool.title}
                        </Heading>
                        <Text fontSize="md" color={textColor} fontFamily="'Segoe UI', sans-serif">
                          {tool.desc}
                        </Text>
                        {tool.disabled && (
                          <Text fontSize="sm" color="orange.500" fontStyle="italic">
                            No students assigned yet
                          </Text>
                        )}
                      </VStack>
                    </Center>
                    
                    <Center>
                      <Button
                        colorScheme={tool.color}
                        size="md"
                        rightIcon={<FaArrowRight />}
                        variant="outline"
                        fontFamily="'Segoe UI', sans-serif"
                        _hover={!tool.disabled ? {
                          bgGradient: tool.gradient,
                          color: "white",
                          transform: "translateX(5px)"
                        } : {}}
                        transition="all 0.2s"
                        isDisabled={tool.disabled}
                        cursor={tool.disabled ? "not-allowed" : "pointer"}
                      >
                        {tool.actionText}
                      </Button>
                    </Center>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* Motivation Section */}
        <Card mt={6} bgGradient="linear(to-r, blue.500, purple.500)" color="white">
          <CardBody py={8}>
            <Center flexDirection="column" textAlign="center">
              <Icon as={FaAward} boxSize={8} mb={4} />
              <Heading as="h3" size="md" mb={2} fontFamily="'Segoe UI', sans-serif" fontSize="xl">
                {students.length > 0 ? "Shaping Future Tech Leaders" : "Ready to Mentor"}
              </Heading>
              <Text fontFamily="'Segoe UI', sans-serif" opacity={0.9} fontSize="lg">
                {students.length > 0 
                  ? "Your guidance is helping shape the next generation of tech professionals. Keep inspiring!"
                  : "You're all set to start mentoring! Students will be assigned to you soon."
                }
              </Text>
            </Center>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}