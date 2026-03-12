// pages/student/status.js
import {
  Box,
  Heading,
  Text,
  VStack,
  Tag,
  Button,
  Flex,
  Spinner,
  Container,
  useColorModeValue,
  keyframes,
  Icon,
  HStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaCheckCircle,
  FaClipboardList,
  FaHourglassHalf,
  FaPlay,
  FaTrophy,
  FaTimesCircle,
  FaCalendarAlt,
  FaArrowLeft,
  FaFlagCheckered,
  FaSearch,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHStack = motion(HStack);

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
  100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
`;

// ----- Helpers -----
const stepIcons = {
  Submitted: FaClipboardList,
  Pending: FaHourglassHalf,
  Accepted: FaCheckCircle,
  Rejected: FaTimesCircle,
  Started: FaPlay,
  Ongoing: FaHourglassHalf,
  Completed: FaTrophy,
};

const normalizeStatus = (status, startDate, endDate) => {
  if (!status) return "";
  const s = String(status).trim().toLowerCase();
  
  // If status is Accepted, check dates to determine if it should be Started, Ongoing, or Completed
  if (s === "accepted") {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return "Accepted"; // Still accepted but not started yet
    } else if (now >= start && now <= end) {
      return "Ongoing"; // Internship is in progress
    } else if (now > end) {
      return "Completed"; // Internship has ended
    }
  }
  
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
      return "";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Submitted":
      return "#2196f3"; // Blue
    case "Pending":
      return "#ff9800"; // Orange
    case "Accepted":
      return "#4caf50"; // Green
    case "Rejected":
      return "#f44336"; // Red
    case "Started":
      return "#9c27b0"; // Purple
    case "Ongoing":
      return "#ff5722"; // Deep Orange
    case "Completed":
      return "#009688"; // Teal
    default:
      return "#90a4ae"; // Blue Grey
  }
};

// Format date to dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Retrieve the logged-in user's ID safely
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

// Status Card Component
const StatusCard = ({ title, value, icon, color }) => (
  <MotionBox
    p={4}
    bg="white"
    borderRadius="xl"
    boxShadow="xl"
    textAlign="center"
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ duration: 0.3 }}
    borderLeft="4px solid"
    borderLeftColor={color}
    position="relative"
    overflow="hidden"
    _before={{
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      bg: color,
    }}
  >
    <Icon as={icon} boxSize={7} color={color} mb={2} />
    <Text fontSize="sm" color="gray.600" mb={1} fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
      {title}
    </Text>
    <Text fontWeight="bold" color="gray.800" fontFamily="'Segoe UI', sans-serif" fontSize="lg">
      {value}
    </Text>
  </MotionBox>
);

// Simple but Creative Back Button
const SimpleBackButton = ({ onClick }) => (
  <Button
    onClick={onClick}
    fontFamily="'Segoe UI', sans-serif"
    bg="white"
    color="blue.600"
    borderRadius="xl"
    px={6}
    py={5}
    fontWeight="bold"
    fontSize="lg"
    position="relative"
    overflow="hidden"
    leftIcon={<Icon as={FaArrowLeft} />}
    boxShadow="0 8px 25px rgba(0, 0, 0, 0.15)"
    border="2px solid"
    borderColor="blue.100"
    _hover={{
      bg: "blue.50",
      transform: "translateY(-2px)",
      boxShadow: "0 12px 30px rgba(66, 153, 225, 0.25)",
    }}
    _active={{
      transform: "translateY(0px)",
    }}
    transition="all 0.3s ease"
    css={{
      animation: `${glow} 2s infinite ease-in-out`,
    }}
  >
    Back to Dashboard
  </Button>
);

// Perfectly Aligned Progress Line Component - CORRECTED
// Perfectly Aligned Progress Line Component - CORRECTED with step colors
const ProgressLine = ({ steps, currentStepIndex }) => {
  const totalSteps = steps.length;
  
  // Calculate the width for each segment
  const segmentWidth = 100 / (totalSteps - 1);
  
  return (
    <Box
      position="absolute"
      top="40px"
      left="40px"
      right="40px"
      height="4px"
      bg="gray.200"
      borderRadius="full"
      zIndex="1"
      overflow="hidden"
    >
      {/* Render colored segments for each completed step */}
      {steps.map((step, index) => {
        if (index === 0) return null; // Skip first step as it has no previous segment
        
        const isCompleted = index <= currentStepIndex;
        
        if (!isCompleted) return null;
        
        return (
          <Box
            key={step}
            position="absolute"
            top="0"
            left={`${(index - 1) * segmentWidth}%`}
            height="100%"
            width={`${segmentWidth}%`}
            bg={getStatusColor(steps[index - 1])} // Use color of the previous step
            zIndex="2"
            transition="all 0.5s ease"
          />
        );
      })}
    </Box>
  );
};

export default function ApplicationStatus() {
  const router = useRouter();
  const toast = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);
  
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const headingColor = useColorModeValue("white", "white");
  const noAppBg = useColorModeValue("blue.50", "gray.900");
  const subtleBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const uid = getStoredUserId();
        if (!uid) {
          setLoading(false);
          return;
        }

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

        setApplication(rows[0] || null);
      } catch (err) {
        console.error("Fetch application error:", err);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
    pollingRef.current = setInterval(fetchApplication, 10000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Disable browser buttons
  useEffect(() => {
    const disableBrowserButtons = () => {
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
        toast({
          title: "Navigation disabled",
          description: "Please use the application buttons to navigate",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      };
    };

    disableBrowserButtons();
    
    return () => {
      window.onpopstate = null;
    };
  }, [toast]);

  if (loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient="linear-gradient(135deg, #059669 0%, #0D9488 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaSearch} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Loading your application status...</Text>
          <Text fontSize="sm" color="gray.500">Please wait while we retrieve your information</Text>
        </VStack>
      </Box>
    );
  }

  if (!application) {
    return (
      <Flex 
        direction="column" 
        minH="100vh" 
        fontFamily="'Segoe UI', sans-serif"
        bg={noAppBg}
        justify="center"
        align="center"
        p={6}
      >
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          bg={cardBg}
          p={10}
          borderRadius="2xl"
          boxShadow="2xl"
          maxW="md"
          w="full"
        >
          <Box
            w="100px"
            h="100px"
            borderRadius="full"
            bg="blue.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={6}
          >
            <Icon as={FaClipboardList} boxSize={10} color="blue.500" />
          </Box>
          <Heading size="lg" mb={4} color="blue.600" fontFamily="'Segoe UI', sans-serif">
            No Application Found
          </Heading>
          <Text color={textColor} mb={6} textAlign="center" fontFamily="'Segoe UI', sans-serif">
            You haven&apos;t submitted any applications yet.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push("/student/apply")}
            size="lg"
            fontFamily="'Segoe UI', sans-serif"
            _hover={{ transform: "translateY(-3px)", boxShadow: "xl" }}
            transition="all 0.3s"
            rightIcon={<Icon as={FaClipboardList} />}
            bgGradient="linear(to-r, blue.500, purple.500)"
            color="white"
          >
            Apply Now
          </Button>
        </MotionBox>
      </Flex>
    );
  }

  const normalizedStatus = normalizeStatus(
    application.status, 
    application.start_date, 
    application.end_date
  ) || "Submitted";

  let stepsToRender;
  if (normalizedStatus === "Rejected") {
    stepsToRender = ["Submitted", "Pending", "Rejected"];
  } else {
    stepsToRender = ["Submitted", "Pending", "Accepted", "Started", "Ongoing", "Completed"];
  }

  const currentStepIndex = stepsToRender.indexOf(normalizedStatus);

  return (
    <Flex 
      direction="column" 
      minH="100vh" 
      fontFamily="'Segoe UI', sans-serif"
      bg={bgGradient}
      backgroundSize="200% 200%"
      animation={`${gradient} 15s ease infinite`}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        background="radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)"
        zIndex="0"
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        background="radial-gradient(circle at 80% 20%, rgba(255, 153, 102, 0.2) 0%, transparent 50%)"
        zIndex="0"
      />

      <Container maxW="container.lg" pt={8} position="relative" zIndex="1">
        <Box mb={8}>
          <SimpleBackButton onClick={() => router.push("/student/dashboard")} />
        </Box>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          textAlign="center"
          mb={10}
        >
          <Badge 
            colorScheme="whiteAlpha" 
            fontSize="lg" 
            p={3} 
            borderRadius="xl"
            mb={4}
            bg="whiteAlpha.300"
            color="white"
            backdropFilter="blur(10px)"
            fontFamily="'Segoe UI', sans-serif"
            fontWeight="bold"
          >
            Application Tracking
          </Badge>
          <Heading 
            mb={4} 
            color={headingColor}
            fontFamily="'Segoe UI', sans-serif"
            fontSize={{ base: "3xl", md: "4xl" }}
            textShadow="0 2px 4px rgba(0,0,0,0.2)"
          >
            Application Status Timeline
          </Heading>
          <Text color="whiteAlpha.900" fontFamily="'Segoe UI', sans-serif" fontSize="lg" maxW="2xl" mx="auto">
            Track your internship application progress in real-time
          </Text>
        </MotionBox>

        <MotionHStack
          spacing={6}
          mb={12}
          justify="center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          flexWrap="wrap"
        >
          <StatusCard
            title="Current Status"
            value={normalizedStatus}
            icon={stepIcons[normalizedStatus]}
            color={getStatusColor(normalizedStatus)}
          />
          <StatusCard
            title="Application Date"
            value={formatDate(application.created_at)}
            icon={FaCalendarAlt}
            color="blue.500"
          />
          <StatusCard
            title="Last Updated"
            value={formatDate(application.updated_at)}
            icon={FaHourglassHalf}
            color="green.500"
          />
        </MotionHStack>

        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          mb={12}
        >
          <VStack
            align="center"
            spacing={0}
            bg={cardBg}
            p={10}
            rounded="3xl"
            shadow="2xl"
            mx="auto"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              bgGradient: "linear(to-r, blue.500, purple.500)",
            }}
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              background="linear-gradient(90deg, rgba(66,153,225,0.03) 0%, rgba(128,90,213,0.1) 50%, rgba(66,153,225,0.03) 100%)"
              backgroundSize="1000px 100%"
              animation={`${shimmer} 8s infinite linear`}
              opacity="0.5"
              zIndex="0"
            />
            
            <Box position="relative" w="100%" mb={8}>
              {/* Background line container */}
              <Box 
                position="absolute" 
                top="40px" 
                left="40px" 
                right="40px" 
                height="4px" 
                bg="gray.200" 
                zIndex="1"
                borderRadius="full"
                overflow="hidden"
              />
              
              {/* Progress line with gradient - CORRECTED */}
              <ProgressLine 
                steps={stepsToRender} 
                currentStepIndex={currentStepIndex} 
              />
              
              <Flex justify="space-between" position="relative" zIndex="3">
                {stepsToRender.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isLast = index === stepsToRender.length - 1;
                  const IconComponent = stepIcons[step];
                  
                  return (
                    <MotionFlex
                      key={step}
                      direction="column"
                      align="center"
                      position="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.4 }}
                      zIndex="4"
                      flex="1"
                      maxW={`${100 / stepsToRender.length}%`}
                    >
                      <MotionBox
                        w="80px"
                        h="80px"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={
                          isCompleted
                            ? getStatusColor(step)
                            : "#e0e0e0"
                        }
                        color="white"
                        border="4px solid white"
                        zIndex="5"
                        boxShadow="xl"
                        animate={
                          isCurrent
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }
                            : {}
                        }
                        transition={
                          isCurrent
                            ? {
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop",
                              }
                            : {}
                        }
                        _hover={{
                          transform: "scale(1.1)",
                          transition: "transform 0.3s",
                        }}
                        css={{
                          animation: isCurrent ? `${pulse} 2s infinite` : "none",
                        }}
                      >
                        {isCompleted && step !== "Rejected" ? (
                          <Icon as={FaCheckCircle} boxSize={8} />
                        ) : isLast ? (
                          step === "Rejected" ? (
                            <Icon as={FaTimesCircle} boxSize={8} />
                          ) : (
                            <Icon as={FaFlagCheckered} boxSize={8} />
                          )
                        ) : (
                          <Icon as={IconComponent} boxSize={8} />
                        )}
                      </MotionBox>

                      <MotionText
                        mt={4}
                        fontWeight={isCurrent ? "bold" : "semibold"}
                        fontSize="lg"
                        color={
                          isCompleted
                            ? getStatusColor(step)
                            : "#37474f"
                        }
                        animate={
                          isCurrent
                            ? {
                                textShadow: [
                                  `0 0 0px ${getStatusColor(step)}`,
                                  `0 0 10px ${getStatusColor(step)}`,
                                  `0 0 0px ${getStatusColor(step)}`,
                                ],
                              }
                            : {}
                        }
                        transition={
                          isCurrent
                            ? {
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                              }
                            : {}
                        }
                        fontFamily="'Segoe UI', sans-serif"
                        textAlign="center"
                      >
                        {step}
                      </MotionText>

                      {(isCurrent || isCompleted) && (
                        <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif" mt={2} textAlign="center">
                          {isCurrent ? "Current step" : "Completed"}
                          {isLast && step === "Rejected" && " - Application Rejected"}
                          {isLast && step === "Completed" && " - Final stage"}
                        </Text>
                      )}
                    </MotionFlex>
                  );
                })}
              </Flex>
            </Box>

            <Box pt={8} w="full" textAlign="center">
              <Badge 
                colorScheme="blue" 
                fontSize="lg" 
                p={3} 
                borderRadius="xl"
                mb={6}
                fontFamily="'Segoe UI', sans-serif"
                variant="solid"
                bgGradient="linear(to-r, blue.500, purple.500)"
                color="white"
              >
                Application Details
              </Badge>
              
              <VStack spacing={4} mt={4} maxW="md" mx="auto">
                <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Submitted:</Text>
                  <Badge colorScheme="green" fontFamily="'Segoe UI', sans-serif" fontSize="md" p={2} borderRadius="lg">
                    Yes
                  </Badge>
                </HStack>
                
                <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Current Status:</Text>
                  <Tag 
                    size="lg" 
                    bg={getStatusColor(normalizedStatus)} 
                    color="white"
                    borderRadius="full"
                    fontFamily="'Segoe UI', sans-serif"
                    fontWeight="bold"
                    px={4}
                    py={1}
                    lineHeight="1.6"
                    minH="36px"
                    display="flex"
                    alignItems="center"
                  >
                    <Text>{normalizedStatus}</Text>
                  </Tag>
                </HStack>
                
                <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Application Date:</Text>
                  <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                    {formatDate(application.created_at)}
                  </Text>
                </HStack>
                
                {application.start_date && (
                  <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="lg">
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Internship Start Date:</Text>
                    <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                      {formatDate(application.start_date)}
                    </Text>
                  </HStack>
                )}
                
                {application.end_date && (
                  <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="lg">
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Internship End Date:</Text>
                    <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium">
                      {formatDate(application.end_date)}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </MotionBox>
      </Container>
    </Flex>
  );
}