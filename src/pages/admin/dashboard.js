import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FaClipboardCheck,
  FaUserCheck,
  FaUsers,
  FaCertificate,
  FaSignOutAlt,
  FaChartLine,
  FaCalendarAlt,
  FaSync,
  FaCheckCircle,
  FaClock,
  FaChalkboardTeacher,
  FaArrowRight,
  FaRocket,
  FaAward,
  FaTrophy,
  FaRegSmileWink,
  FaExclamationTriangle,
} from "react-icons/fa";

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

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    certificatesIssued: 0,
  });
  const [mentorsCount, setMentorsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
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

  // Stats data
  const statsData = [
    {
      label: "Total Applications",
      value: stats.totalApplications,
      helpText: "All internship applications",
      icon: FaUsers,
      color: "blue",
      trend: "All applications received",
      gradient: "linear(to-br, blue.400, blue.600)",
      emoji: "📝",
    },
    {
      label: "Pending Requests",
      value: stats.pendingApplications,
      helpText: "Applications awaiting review",
      icon: FaClipboardCheck,
      color: "orange",
      trend: "Needs attention",
      gradient: "linear(to-br, orange.400, orange.600)",
      emoji: "⏳",
    },
    {
      label: "Accepted Interns",
      value: stats.acceptedApplications,
      helpText: "Approved applications",
      icon: FaUserCheck,
      color: "green",
      trend: "Active participants",
      gradient: "linear(to-br, green.400, green.600)",
      emoji: "✅",
    },
    {
      label: "Certificates Issued & Verified",
      value: stats.certificatesIssued,
      helpText: "Completed certificates",
      icon: FaCertificate,
      color: "purple",
      trend: "Success stories",
      gradient: "linear(to-br, purple.400, purple.600)",
      emoji: "🏆",
    }
  ];

  const fetchRealTimeStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all applications data
      const applicationsRes = await fetch("/api/getApplications");
      if (!applicationsRes.ok) {
        throw new Error("Failed to fetch applications");
      }
      const applications = await applicationsRes.json();
      
      // Calculate stats from applications data
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => app.status === "pending").length;
      const acceptedApplications = applications.filter(app => app.status === "accepted").length;
      
      // Fetch certificates and count those with status 'issued' or 'verified'
      let certificatesIssued = 0;
      try {
        // Try to fetch all certificates first
        const certificatesRes = await fetch("/api/admin/certificates");
        if (certificatesRes.ok) {
          const certificatesData = await certificatesRes.json();
          // Count certificates with status 'issued' OR 'verified'
          certificatesIssued = certificatesData.certificates?.filter(
            cert => cert.status === 'issued' || cert.status === 'verified'
          ).length || 0;
        } else {
          // Fallback to the new admin certificates count API
          const fallbackRes = await fetch("/api/admin/certificates-count");
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            certificatesIssued = fallbackData.count || 0;
          } else {
            // Final fallback to old API
            const finalFallbackRes = await fetch("/api/certificates/count");
            if (finalFallbackRes.ok) {
              const finalFallbackData = await finalFallbackRes.json();
              certificatesIssued = finalFallbackData.count || 0;
            }
          }
        }
      } catch (certError) {
        console.log("Could not fetch certificates count from primary API, trying fallback...");
        // Final fallback
        try {
          const finalFallbackRes = await fetch("/api/certificates/count");
          if (finalFallbackRes.ok) {
            const finalFallbackData = await finalFallbackRes.json();
            certificatesIssued = finalFallbackData.count || 0;
          }
        } catch (finalError) {
          console.log("All certificate count APIs failed");
          // Set to 0 if all APIs fail
          certificatesIssued = 0;
        }
      }
      
      // Fetch mentors count
      let mentorsCount = 0;
      try {
        const mentorsRes = await fetch("/api/mentors");
        if (mentorsRes.ok) {
          const mentorsData = await mentorsRes.json();
          mentorsCount = mentorsData.length || 0;
        }
      } catch (mentorError) {
        console.log("Could not fetch mentors count");
      }
      
      // Update state with calculated values
      setStats({
        totalApplications,
        pendingApplications,
        acceptedApplications,
        certificatesIssued,
      });
      
      setMentorsCount(mentorsCount);
      
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.message);
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "admin") {
          router.push("/");
        } else {
          setAdminName(parsedUser.name || "Admin");
          fetchRealTimeStats();
        }
      } catch {
        setAdminName("Admin");
      }
    } else {
      router.push("/");
    }
  }, [router, fetchRealTimeStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRealTimeStats();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest statistics...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const toolCards = [
    {
      icon: <FaClipboardCheck size={24} />,
      title: "Internship Requests",
      desc: "Review and approve the next generation of talent",
      onClick: () => router.push("/admin/requests"),
      color: "blue",
      count: stats.pendingApplications,
      gradient: "linear(to-r, blue.500, blue.600)",
      actionText: "Review Applications",
    },
    {
      icon: <FaUserCheck size={24} />,
      title: "Student Attendance",
      desc: "Track engagement and participation metrics",
      onClick: () => router.push("/admin/attendance"),
      color: "green",
      count: 0,
      gradient: "linear(to-r, green.500, green.600)",
      actionText: "View Reports",
    },
    {
      icon: <FaChalkboardTeacher size={24} />,
      title: "Manage Mentors",
      desc: "Connect guides with aspiring professionals",
      onClick: () => router.push("/admin/mentors"),
      color: "orange",
      count: mentorsCount,
      gradient: "linear(to-r, orange.500, orange.600)",
      actionText: "Manage Team",
    },
    {
      icon: <FaCertificate size={24} />,
      title: "Issue Certificates",
      desc: "Celebrate achievements and milestones",
      onClick: () => router.push("/admin/certificates"),
      color: "purple",
      count: stats.certificatesIssued,
      gradient: "linear(to-r, purple.500, purple.600)",
      actionText: "Create Certificates",
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
              <Icon as={FaChartLine} color="blue.600" boxSize={6} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="2xl" fontWeight="bold" fontFamily="'Segoe UI', sans-serif" textShadow="0 1px 2px rgba(0,0,0,0.2)">
                Admin Dashboard
              </Text>
              <Text fontSize="md" opacity={0.9} fontFamily="'Segoe UI', sans-serif">
                Info Tech Corporation of Goa • Real-time Monitoring
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
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <Avatar 
                size="md" 
                name={adminName} 
                bg="white"
                color="blue.600"
                fontWeight="bold"
                boxShadow="0 0 0 3px rgba(255,255,255,0.5)"
                sx={{
                  '& > div': {
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }
                }}
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
                  ADMIN
                </Text>
                <Text 
                  fontSize="lg" 
                  fontWeight="bold" 
                  color="white" 
                  fontFamily="'Segoe UI', sans-serif"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  letterSpacing="0.5px"
                >
                  {adminName}
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
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page.
              </AlertDescription>
            </Box>
            <Button colorScheme="red" variant="solid" ml={3} onClick={handleRefresh}>
              Retry
            </Button>
          </Alert>
        )}

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
                    Welcome back, {adminName}!
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="xl" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                  Here&apos;s your program overview at a glance
                </Text>
                <HStack spacing={3}>
                  {/* Date Badge (Purple) */}
                  <Badge 
                    colorScheme="purple" 
                    fontSize="md" 
                    p={2} 
                    fontFamily="'Segoe UI', sans-serif"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <HStack>
                      <FaCalendarAlt />
                      <Text>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    </HStack>
                  </Badge>
                  
                  {/* Time Badge (Green) */}
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

        {/* Statistics Grid */}
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
                  {stat.value > 0 && (
                    <Badge 
                      colorScheme={stat.color} 
                      variant="subtle"
                      fontSize="sm"
                      fontFamily="'Segoe UI', sans-serif"
                      borderRadius="full"
                      px={2}
                      mt={3}
                    >
                      {stat.trend}
                    </Badge>
                  )}
                </Center>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

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
                ADMIN TOOLS
              </Badge>
            </Flex>
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={5}>
              {toolCards.map((tool, index) => (
                <GridItem key={index}>
                  <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.200"
                    height="100%"
                    _hover={{
                      shadow: "2xl",
                      borderColor: `${tool.color}.400`,
                      cursor: "pointer",
                      transform: "translateY(-3px)"
                    }}
                    transition="all 0.3s ease"
                    onClick={tool.onClick}
                    position="relative"
                    fontFamily="'Segoe UI', sans-serif"
                    boxShadow="md"
                    overflow="hidden"
                    textAlign="center"
                  >
                    {/* Show count badge only for Internship Requests and Student Attendance */}
                    {tool.count > 0 && (tool.title === "Internship Requests" || tool.title === "Student Attendance") && (
                      <Box position="absolute" top={3} right={3}>
                        <Badge 
                          colorScheme={tool.count > 0 ? "red" : "gray"} 
                          variant="solid" 
                          borderRadius="full" 
                          fontFamily="'Segoe UI', sans-serif"
                          boxShadow="md"
                          fontSize="sm"
                        >
                          {tool.count} {tool.title === "Internship Requests" ? "Pending" : "Active"}
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
                        animation={`${float} 3s ease-in-out infinite`}
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
                      </VStack>
                    </Center>
                    
                    <Center>
                      <Button
                        colorScheme={tool.color}
                        size="md"
                        rightIcon={<FaArrowRight />}
                        variant="outline"
                        fontFamily="'Segoe UI', sans-serif"
                        _hover={{
                          bgGradient: tool.gradient,
                          color: "white",
                          transform: "translateX(5px)"
                        }}
                        transition="all 0.2s"
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
                Making a Difference Every Day
              </Heading>
              <Text fontFamily="'Segoe UI', sans-serif" opacity={0.9} fontSize="lg">
                Your work is helping shape the next generation of tech professionals. Keep inspiring!
              </Text>
            </Center>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}