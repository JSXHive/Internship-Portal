import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  useColorModeValue,
  keyframes,
  useToast,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Avatar,
  Center,
  Grid,
  GridItem,
  Spinner,
  Tooltip,
  Progress,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import {
  FaUser,
  FaCalendarCheck,
  FaSignOutAlt,
  FaFileAlt,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTasks,
  FaGraduationCap,
  FaBriefcase,
  FaChartLine,
  FaRocket,
  FaArrowRight,
  FaSync,
  FaAward,
  FaClipboardCheck,
  FaCertificate,
  FaCalendarDay,
  FaUpload,
  FaIdCard,
  FaCopy,
  FaUserTie,
  FaTimesCircle,
  FaStar,
  FaList,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Animation components
const MotionBox = motion(Box);

// Keyframes for animations
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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Helper functions
const getStoredUserId = () => {
  try {
    const keys = ["user_id", "userId", "user"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;

      if (raw.trim().startsWith("{")) {
        const obj = JSON.parse(raw);
        return obj.user_id || obj.userId || obj.id || null;
      }

      try {
        const maybe = JSON.parse(raw);
        if (typeof maybe === "string") return maybe;
      } catch (_) {}

      return raw.replace(/^"+|"+$/g, "");
    }
  } catch (_) {}
  return null;
};

const normalizeStatus = (status) => {
  if (!status) return "";
  const s = String(status).trim().toLowerCase();
  switch (s) {
    case "submitted":
      return "Submitted";
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "started":
      return "Started";
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    default:
      return "Not Submitted";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Submitted":
      return "blue";
    case "Pending":
      return "orange";
    case "Accepted":
      return "green";
    case "Rejected":
      return "red";
    case "Started":
      return "blue";
    case "Ongoing":
      return "purple";
    case "Completed":
      return "green";
    default:
      return "gray";
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case "Accepted": return FaCheckCircle;
    case "Submitted": return FaClipboardCheck;
    case "Pending": return FaClock;
    case "Rejected": return FaTimesCircle;
    case "Started": return FaRocket;
    case "Ongoing": return FaTasks;
    case "Completed": return FaCheckCircle;
    default: return FaBriefcase;
  }
};

// Add this function to fetch user data
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/getUserData?user_id=${encodeURIComponent(userId)}`);
    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    console.error('Failed to fetch user data:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Skeleton components for loading states
const DashboardSkeleton = () => (
  <Box p={6}>
    <Skeleton height="120px" mb={6} borderRadius="lg" />
    <Skeleton height="100px" mb={6} borderRadius="lg" />
    <Skeleton height="400px" mb={6} borderRadius="lg" />
    <Skeleton height="150px" borderRadius="lg" />
  </Box>
);

const HeaderSkeleton = () => (
  <Flex justify="space-between" align="center" p={6}>
    <HStack spacing={3}>
      <SkeletonCircle size="10" />
      <VStack spacing={1} align="start">
        <Skeleton height="20px" width="200px" />
        <Skeleton height="16px" width="250px" />
      </VStack>
    </HStack>
    <HStack spacing={4}>
      <Skeleton height="40px" width="120px" />
      <SkeletonCircle size="12" />
      <Skeleton height="40px" width="100px" />
    </HStack>
  </Flex>
);

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("Not Submitted");
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const toast = useToast();
  
  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const subtleBg = useColorModeValue("gray.50", "gray.700");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Function to fetch user data and set student ID
  const fetchAndSetUserData = useCallback(async (uid) => {
    try {
      const userData = await fetchUserData(uid);
      
      if (userData) {
        setStudentId(userData.student_id || "");
        if (userData.application_status) {
          setApplicationStatus(normalizeStatus(userData.application_status));
        }
        return userData.student_id || "";
      } else {
        setStudentId("");
        return "";
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setStudentId("");
      return "";
    }
  }, []);

  // Function to fetch applications - wrapped in useCallback to prevent recreation
  const fetchApplication = useCallback(async (uid) => {
    try {
      const url = `/api/getApplications?user_id=${encodeURIComponent(uid)}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch application");
      const data = await res.json();

      let rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.applications)
        ? data.applications
        : [];

      rows = rows.filter(
        (r) => String(r.user_id).trim() === String(uid).trim()
      );

      rows.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      const latestApplication = rows[0] || null;
      setApplication(latestApplication);
      
      if (latestApplication) {
        const normalizedStatus = normalizeStatus(latestApplication.status);
        setApplicationStatus(normalizedStatus);
      } else {
        setApplicationStatus("Not Submitted");
      }
    } catch (err) {
      console.error("Fetch application error:", err);
      setApplication(null);
      setApplicationStatus("Not Submitted");
      setStudentId("");
    }
  }, []);

  // Tool cards based on application status - Updated with To-Do List card
  const getToolCards = useCallback(() => {
    const baseCards = [
      {
        icon: <FaUser size={24} />,
        title: "View & Edit Profile",
        desc: "View and edit your personal, educational, and professional details.",
        onClick: () => router.push("/student/profile"),
        color: "purple",
        gradient: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
        animation: `${pulse} 5s ease-in-out infinite reverse`,
      }
    ];

    if (applicationStatus === "Accepted" || applicationStatus === "Started" || applicationStatus === "Ongoing" || applicationStatus === "Completed") {
      return [
        ...baseCards,
        {
          icon: <FaCalendarDay size={24} />,
          title: "Mark Attendance",
          desc: "Record your daily attendance for the internship program.",
          onClick: () => router.push("/student/attendance"),
          color: "orange",
          gradient: "linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)",
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        {
          icon: <FaUpload size={24} />,
          title: "Submit Deliverables",
          desc: "Upload and submit your assigned internship tasks and projects.",
          onClick: () => router.push("/student/deliverables"),
          color: "teal",
          gradient: "linear-gradient(135deg, #319795 0%, #2C7A7B 100%)",
          animation: `${float} 6s ease-in-out infinite`,
        },
        {
          icon: <FaUserTie size={24} />,
          title: "Mentor Assigned",
          desc: "View your assigned mentor details and contact information.",
          onClick: () => router.push("/student/mentors"),
          color: "blue",
          gradient: "linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)",
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        {
          icon: <FaTasks size={24} />,
          title: "Mentor Tasks",
          desc: "View tasks and assignments given by your mentor with due dates and submission status.",
          onClick: () => router.push("/student/tasks"),
          color: "cyan",
          gradient: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        {
          icon: <FaStar size={24} />,
          title: "Mentor Evaluations",
          desc: "View evaluations and feedback provided by your mentor throughout the internship.",
          onClick: () => router.push("/student/evaluations"),
          color: "yellow",
          gradient: "linear-gradient(135deg, #D69E2E 0%, #B7791F 100%)",
          animation: `${float} 6s ease-in-out infinite`,
        },
        // Fixed To-Do List Card - using FaList instead of FaListCheck
        {
          icon: <FaList size={24} />,
          title: "To-Do List",
          desc: "Manage your personal tasks and notes to stay organized during your internship.",
          onClick: () => router.push("/student/todo"),
          color: "pink",
          gradient: "linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)",
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        {
          icon: <FaChartLine size={24} />,
          title: "Internship Progress",
          desc: "Track your progress and completion status of internship tasks.",
          onClick: () => router.push("/student/progress"),
          color: "green",
          gradient: "linear-gradient(135deg, #38A169 0%, #2F855A 100%)",
          animation: `${float} 6s ease-in-out infinite`,
        },
        {
          icon: <FaCertificate size={24} />,
          title: "Download Certificate",
          desc: "Download and view your internship completion certificate.",
          onClick: () => router.push("/student/certificate"),
          color: "purple",
          gradient: "linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)",
          animation: `${pulse} 5s ease-in-out infinite reverse`,
      }
      ];
    } else {
      return [
        ...baseCards,
        {
          icon: <FaFileAlt size={24} />,
          title: "Apply for Internship",
          desc: "Fill out and submit your internship application form.",
          onClick: () => router.push("/student/apply"),
          color: "blue",
          gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        {
          icon: <FaSearch size={24} />,
          title: "Track Application Status",
          desc: "Check if your application is submitted, accepted, or completed.",
          onClick: () => router.push("/student/status"),
          color: "green",
          gradient: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
          animation: `${float} 6s ease-in-out infinite`,
        }
      ];
    }
  }, [applicationStatus, router]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const uid = getStoredUserId();
        if (!uid) {
          setLoading(false);
          return;
        }

        // Fetch user data and application data in parallel
        const [userData] = await Promise.allSettled([
          fetchUserData(uid),
          fetchApplication(uid)
        ]);

        if (userData.status === 'fulfilled' && userData.value) {
          setStudentId(userData.value.student_id || "");
          if (userData.value.application_status) {
            setApplicationStatus(normalizeStatus(userData.value.application_status));
          }
        }
        
      } catch (err) {
        console.error("Fetch application error:", err);
        setApplication(null);
        setApplicationStatus("Not Submitted");
        setStudentId("");
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "student") {
          router.push("/");
        } else {
          setStudentName(parsedUser.name || "Student");
          fetchApplicationData();
        }
      } catch {
        setStudentName("Student");
        setStudentId("");
        setLoading(false);
      }
    } else {
      router.push("/");
    }

    // Disable browser navigation buttons and right-click
    const disableNavigation = (e) => {
      if (e.keyCode === 8 || e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
      }
      
      if (e.type === "contextmenu") {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', disableNavigation);
    window.addEventListener('contextmenu', disableNavigation);
    
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
      window.history.go(1);
    };

    return () => {
      window.removeEventListener('keydown', disableNavigation);
      window.removeEventListener('contextmenu', disableNavigation);
    };
  }, [router, fetchApplication]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const uid = getStoredUserId();
      if (!uid) {
        setRefreshing(false);
        return;
      }

      // Fetch user data to get student_id
      await fetchAndSetUserData(uid);

      const url = `/api/getApplications?user_id=${encodeURIComponent(uid)}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch application");
      const data = await res.json();

      let rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.applications)
        ? data.applications
        : [];

      rows = rows.filter(
        (r) => String(r.user_id).trim() === String(uid).trim()
      );

      rows.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      const latestApplication = rows[0] || null;
      setApplication(latestApplication);
      
      if (latestApplication) {
        const normalizedStatus = normalizeStatus(latestApplication.status);
        setApplicationStatus(normalizedStatus);
      } else {
        setApplicationStatus("Not Submitted");
      }
      
      toast({
        title: "Data Refreshed",
        description: "Dashboard updated with latest information",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Fetch application error:", err);
      setApplication(null);
      setApplicationStatus("Not Submitted");
      setStudentId("");
      toast({
        title: "Error",
        description: "Failed to refresh data",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyStudentId = () => {
    if (studentId) {
      navigator.clipboard.writeText(studentId);
      toast({
        title: "Copied!",
        description: "Student ID copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("old_user_id");
    router.push("/");
  };

  const toolCards = useMemo(() => getToolCards(), [getToolCards]);
  const isAccepted = ["Accepted", "Started", "Ongoing", "Completed"].includes(applicationStatus);

  // Loading student dashboard function
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

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" position="relative" overflow="hidden">
      {/* Header */}
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
              boxShadow="0 0 10px rgba(255,255,255,0.3)"
            >
              <Icon as={FaGraduationCap} color="blue.600" boxSize={6} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="2xl" fontWeight="bold" fontFamily="'Segoe UI', sans-serif" textShadow="0 1px 2px rgba(0,0,0,0.2)">
                Student Dashboard
              </Text>
              <Text fontSize="md" opacity={0.9} fontFamily="'Segoe UI', sans-serif">
                Info Tech Corporation of Goa • Internship Program
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
                transition: "all 0.3s ease",
              }}
                transition="all 0.3s ease"
            >
  <Avatar
    size="md"
    name={studentName}
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
      STUDENT
    </Text>
    <Text
      fontSize="lg"
      fontWeight="bold"
      color="white"
      fontFamily="'Segoe UI', sans-serif"
      textShadow="0 2px 4px rgba(0,0,0,0.3)"
      letterSpacing="0.5px"
    >
      {studentName}
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
        {/* Welcome Section */}
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
                    Welcome back, {studentName}!
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="xl" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                  {isAccepted 
                    ? "Here's your internship journey at a glance" 
                    : "Your internship application is being processed"}
                </Text>
                
                {/* Date and Time Display - Show for ALL students */}
                <HStack spacing={4} mt={3} flexWrap="wrap">
                  <Badge 
                    colorScheme="purple" 
                    fontSize="md" 
                    p={2} 
                    fontFamily="'Segoe UI', sans-serif"
                    borderRadius="md"
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
                  >
                    <HStack>
                      <FaClock />
                      <Text>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</Text>
                    </HStack>
                  </Badge>
                  
                  {/* Student ID Display - Only show if studentId exists */}
                  {studentId && (
                    <HStack
                      bg="white"
                      p={2}
                      borderRadius="md"
                      boxShadow="sm"
                      border="1px solid"
                      borderColor="purple.200"
                    >
                      <Icon as={FaIdCard} color="purple.500" size="sm" />
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif" fontSize="md">
                        Student ID: {studentId}
                      </Text>
                      <Tooltip label="Copy Student ID">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleCopyStudentId}
                          colorScheme="purple"
                        >
                          <FaCopy size={12} />
                        </Button>
                      </Tooltip>
                    </HStack>
                  )}
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

        {/* Status Card */}
        <MotionBox
          mb={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card 
            bg={cardBg} 
            shadow="xl" 
            borderRadius="xl"
            borderLeft="4px solid"
            borderLeftColor={`${getStatusColor(applicationStatus)}.400`}
            fontFamily="'Segoe UI', sans-serif"
          >
            <CardBody p={5}>
              <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.500" fontWeight="semibold" textTransform="uppercase" fontFamily="'Segoe UI', sans-serif">
                    {isAccepted ? "INTERNSHIP STATUS" : "APPLICATION STATUS"}
                  </Text>
                  <HStack>
                    <Badge colorScheme={getStatusColor(applicationStatus)} fontSize="lg" p={3} borderRadius="md" fontFamily="'Segoe UI', sans-serif">
                      {applicationStatus}
                    </Badge>
                    <Icon as={getStatusIcon(applicationStatus)} color={`${getStatusColor(applicationStatus)}.500`} boxSize={6} />
                  </HStack>
                  {applicationStatus === "Pending" && (
                    <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                      Your application is under review. Please check back later for updates.
                    </Text>
                  )}
                  {applicationStatus === "Rejected" && (
                    <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                      We&apos;re sorry, your application has not been accepted at this time.
                    </Text>
                  )}
                  {applicationStatus === "Not Submitted" && (
                    <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                      You haven&apos;t submitted an application yet. Start your journey today!
                    </Text>
                  )}
                  {/* Show student ID in status card for all students */}
                  {studentId && (
                    <Text fontSize="sm" color="gray.600" mt={1} fontFamily="'Segoe UI', sans-serif">
                      <strong>Student ID:</strong> {studentId}
                    </Text>
                  )}
                </VStack>
                
                <Button 
                  colorScheme="blue" 
                  mt={{ base: 4, md: 0 }}
                  onClick={() => router.push("/student/status")}
                  rightIcon={<FaChartLine />}
                  variant="solid"
                  size="sm"
                  fontFamily="'Segoe UI', sans-serif"
                >
                  View Details
                </Button>
              </Flex>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Application Progress - Only show if pending */}
        {applicationStatus === "Pending" && (
          <Card mb={6} bg={cardBg} fontFamily="'Segoe UI', sans-serif">
            <CardBody p={6}>
              <Heading size="md" mb={4} fontFamily="'Segoe UI', sans-serif">Application Progress</Heading>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Review Process</Text>
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">60%</Text>
                  </HStack>
                  <Progress value={60} size="lg" colorScheme="blue" borderRadius="md" />
                </Box>
                <SimpleGrid columns={2} spacing={4}>
                  <Box p={3} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" color="blue.600" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Application Received</Text>
                    <HStack mt={1}>
                      <Icon as={FaCheckCircle} color="green.500" size="sm" />
                      <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Completed</Text>
                    </HStack>
                  </Box>
                  <Box p={3} bg="orange.50" borderRadius="md">
                    <Text fontSize="sm" color="orange.600" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Under Review</Text>
                    <HStack mt={1}>
                      <Icon as={FaClock} color="orange.500" size="sm" />
                      <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">In Progress</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Dashboard Tools Section */}
        <Card 
          bg={cardBg} 
          boxShadow="xl" 
          mb={6}
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
          <CardBody p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h2" size="md" color={accentColor} fontFamily="'Segoe UI', sans-serif" fontSize="lg">
                Quick Actions
              </Heading>
              <Badge colorScheme="blue" fontFamily="'Segoe UI', sans-serif" borderRadius="full" px={3} py={1} fontSize="sm">
                {isAccepted ? "STUDENT TOOLS" : "APPLICATION TOOLS"}
              </Badge>
            </Flex>
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
              {toolCards.map((tool, index) => (
                <GridItem key={index}>
                  <MotionBox
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.200"
                    height="100%"
                    _hover={{
                      borderColor: `${tool.color}.400`,
                      cursor: "pointer",
                      transform: "translateY(-3px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.3s ease"
                    onClick={tool.onClick}
                    boxShadow="sm"
                    textAlign="center"
                    fontFamily="'Segoe UI', sans-serif"
                    minH="280px"
                    display="flex"
                    flexDirection="column"
                  >
                    <Center flexDirection="column" mb={4} flex="1">
                      <Box 
                        p={4} 
                        borderRadius="xl" 
                        bgGradient={tool.gradient}
                        color="white"
                        boxShadow="sm"
                        mb={4}
                        animation={tool.animation}
                      >
                        {tool.icon}
                      </Box>
                      <VStack spacing={3}>
                        <Heading as="h3" size="md" fontSize="lg" fontFamily="'Segoe UI', sans-serif">
                          {tool.title}
                        </Heading>
                        <Text fontSize="md" color={textColor} fontFamily="'Segoe UI', sans-serif" lineHeight="1.4">
                          {tool.desc}
                        </Text>
                      </VStack>
                    </Center>
                    
                    <Center mt="auto">
                      <Button
                        colorScheme={tool.color}
                        size="md"
                        rightIcon={<FaArrowRight />}
                        variant="outline"
                        _hover={{
                          bgGradient: tool.gradient,
                          color: "white",
                          transform: "translateX(3px)",
                        }}
                        fontFamily="'Segoe UI', sans-serif"
                        minW="150px"
                      >
                        Get Started
                      </Button>
                    </Center>
                  </MotionBox>
                </GridItem>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* Motivation Section */}
        <Card 
          bgGradient="linear(to-r, blue.500, purple.500)" 
          color="white"
          fontFamily="'Segoe UI', sans-serif"
        >
          <CardBody py={8} px={6}>
            <Center flexDirection="column" textAlign="center">
              <Icon as={FaAward} boxSize={8} mb={4} />
              <Heading as="h3" size="md" mb={3} fontFamily="'Segoe UI', sans-serif" fontSize="xl">
                Your Career Journey Starts Here
              </Heading>
              <Text fontFamily="'Segoe UI', sans-serif" opacity={0.9} fontSize="lg" mb={2}>
                {isAccepted 
                  ? "\"The future depends on what you do today. Make the most of your internship experience.\""
                  : "\"The future depends on what you do today. Start your internship journey and gain valuable experience.\""}
              </Text>
              <Text fontSize="sm" mt={2} opacity={0.8} fontFamily="'Segoe UI', sans-serif">
                - Career Development Team
              </Text>
            </Center>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}