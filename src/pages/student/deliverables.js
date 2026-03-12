import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
  Text,
  Card,
  CardBody,
  Flex,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  keyframes,
  Center
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaArrowLeft,
  FaFileAlt,
  FaCalendarDay,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPaperPlane,
  FaCloudUploadAlt,
  FaHistory,
  FaUpload,
  FaExclamationTriangle,
  FaUserTie,
  FaRocket,
  FaCalendarTimes
} from "react-icons/fa";
import { motion } from "framer-motion";

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

// Motion component for animations
const MotionBox = motion(Box);

export default function SubmitDeliverables() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [date, setDate] = useState("");
  const [remark, setRemark] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [internshipStartDate, setInternshipStartDate] = useState(null);
  const [internshipEndDate, setInternshipEndDate] = useState(null);
  const [mentorAllocated, setMentorAllocated] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [internshipEnded, setInternshipEnded] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const toast = useToast();

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const primaryColor = useColorModeValue("blue.500", "blue.300");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    // Set minimum load time timer
    const minimumLoadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    const fetchUserData = async () => {
      const startTime = Date.now();

      try {
        const userData = localStorage.getItem('user');

        if (!userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        const userId = parsedUser.user_id || parsedUser.id || parsedUser.userId;

        if (!userId) {
          console.error('No user ID found in user data');
          toast({
            title: "Hmm, something's off 🧐",
            description: "Your user data seems incomplete. Please log in again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push('/login');
          return;
        }

        // Set today's date immediately
        const today = new Date().toISOString().split('T')[0];
        setDate(today);

        // Fetch complete user details including student_id and internship info
        try {
          const response = await fetch(`/api/user-details?userId=${userId}`);
          if (response.ok) {
            const userDetails = await response.json();
            setUser(userDetails);
            setStudentId(userDetails.student_id || "");

            // Fetch application details to check mentor allocation and internship dates
            const applicationResponse = await fetch(`/api/application-details?userId=${userId}`);
            if (applicationResponse.ok) {
              const applicationData = await applicationResponse.json();

              // Check if mentor is allocated
              const hasMentor = applicationData.mentor && applicationData.mentor.trim() !== '';
              setMentorAllocated(hasMentor);

              // If mentor is allocated, fetch mentor name from mentor_profiles table
              if (hasMentor) {
                try {
                  const mentorResponse = await fetch(`/api/mentor-name?mentorId=${applicationData.mentor}`);
                  if (mentorResponse.ok) {
                    const mentorData = await mentorResponse.json();
                    setMentorName(mentorData.name || "Mentor");
                  } else {
                    // If fetching mentor name fails, use the mentor ID as fallback
                    setMentorName(applicationData.mentor);
                  }
                } catch (error) {
                  console.error('Error fetching mentor name:', error);
                  setMentorName(applicationData.mentor);
                }
              } else {
                setMentorName("");
              }

              // Check if internship has started and ended
              const currentDate = new Date();
              const startDate = new Date(applicationData.start_date);
              const endDate = new Date(applicationData.end_date);
              const internshipStarted = currentDate >= startDate;
              const internshipEnded = currentDate > endDate;

              setInternshipStartDate(applicationData.start_date);
              setInternshipEndDate(applicationData.end_date);
              setInternshipEnded(internshipEnded);
              setCanSubmit(hasMentor && internshipStarted && !internshipEnded);
            } else {
              throw new Error('Failed to fetch application details');
            }
          } else {
            throw new Error('Failed to fetch user details');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to stored user data
          setUser({ ...parsedUser, user_id: userId });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Oops! 🤔",
          description: "Had trouble loading your data. Mind trying again?",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        // Wait for minimum load time before hiding spinner
        if (minimumLoadTimePassed) {
          setIsLoading(false);
        } else {
          // If minimum time hasn't passed yet, wait for it
          setTimeout(() => {
            setIsLoading(false);
          }, 2000 - (Date.now() - startTime));
        }
      }
    };

    fetchUserData();

    return () => clearTimeout(minimumLoadTimer);
  }, [router, toast, minimumLoadTimePassed]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Hold up! 🛑",
        description: "Looks like you're not quite ready to submit deliverables yet.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!remark.trim()) {
      toast({
        title: "Missing details! 📝",
        description: "Don't forget to add some remarks about your work.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files attached! 📁",
        description: "You'll need to upload at least one file to submit.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!studentId) {
      toast({
        title: "Whoops! 👀",
        description: "We need your student ID to proceed. Please contact support.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('student_id', studentId);
      formData.append('date', date);
      formData.append('remark', remark);

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/deliverables', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit deliverables');
      }

      toast({
        title: "Awesome! 🎉",
        description: "Your deliverables are on their way to your mentor!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setRemark("");
      setFiles([]);

      setTimeout(() => {
        router.push("/student/deliverables");
      }, 2000);
    } catch (error) {
      console.error('Error submitting deliverables:', error);
      toast({
        title: "Bummer! 😅",
        description: error.message || "Something went wrong. Give it another shot!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #319795 0%, #2C7A7B 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaUpload} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading submission form...
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
                  You cannot submit deliverables until a mentor has been assigned to you.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait for our team to allocate a mentor to your account. Once a mentor is assigned, 
                  you&apos;ll be able to submit your deliverables through this portal.
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  You can submit deliverables only after a mentor is allocated to you.
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

  // Show message if internship has ended
  if (internshipEnded) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <Card maxW="md" p={8} textAlign="center" boxShadow="xl" borderRadius="2xl">
          <Box color="red.500" mb={6}>
            <Icon as={FaCalendarTimes} boxSize={16} />
          </Box>
          <Heading size="lg" mb={4} color="gray.700">
            Internship Period Ended
          </Heading>
          <Text mb={4} color="gray.600">
            The internship end date has been reached and you can no longer submit deliverables.
          </Text>
          <Text mb={6} color="gray.600" fontSize="sm">
            {`The internship period ended on ${new Date(internshipEndDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
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

  // Show message if internship hasn't started
  if (!canSubmit) {
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
            {`You can submit deliverables starting from ${new Date(internshipStartDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
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

      {/* Additional floating elements */}
      <Box
        position="absolute"
        top="40%"
        left="10%"
        w="100px"
        h="100px"
        borderRadius="full"
        bg="blue.100"
        opacity="0.2"
        zIndex="0"
        animation={`${float} 5s ease-in-out infinite`}
      />

      <Box position="relative" zIndex="1" p={6}>
        <Box
          maxW="5xl"
          mx="auto"
        >
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

            {/* View History Button */}
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={() => router.push("/student/deliverables/history")}
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

          {/* Main card */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
            fontFamily="'Segoe UI', sans-serif"
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
              {/* Header section */}
              <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mb={8}>
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
                    Submit Deliverables
                  </Heading>
                  <Text color="gray.600" fontSize="lg" fontFamily="'Segoe UI', sans-serif">
                    Share your work and progress with your mentor
                  </Text>
                </Box>
                <Box
                  animation={`${float} 4s ease-in-out infinite`}
                  mt={{ base: 4, md: 0 }}
                  fontSize="5xl"
                >
                  🚀
                </Box>
              </Flex>

              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                {/* Left column - User info and form */}
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* User Information Card */}
                    <Card
                      bg="white"
                      border="1px solid"
                      borderColor="blue.100"
                      borderRadius="xl"
                      boxShadow="md"
                      position="relative"
                      overflow="hidden"
                      transition="all 0.3s"
                      _hover={{
                        boxShadow: "xl",
                      }}
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
                          <VStack spacing={3} align="stretch">
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
                              <Text fontFamily="'Segoe UI', sans-serif" fontWeight="500">{studentId || 'Not assigned'}</Text>
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
                                {mentorName}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between" p={2} borderRadius="md" _hover={{ bg: "blue.50" }} transition="all 0.2s">
                              <HStack>
                                <Icon as={FaCalendarDay} color="blue.500" />
                                <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Today&apos;s Date</Text>
                              </HStack>
                              <Badge
                                colorScheme="blue"
                                fontFamily="'Segoe UI', sans-serif"
                                fontSize="sm"
                                py={1}
                                px={3}
                                borderRadius="full"
                              >
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>
                      </CardBody>
                    </Card>

                    {/* Remarks section */}
                    <Box>
                      <FormControl isRequired>
                        <FormLabel
                          fontWeight="bold"
                          fontSize="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          color="gray.700"
                          mb={3}
                          display="flex"
                          alignItems="center"
                        >
                          Project Remarks
                          <Badge ml={2} colorScheme="blue" fontSize="xs" borderRadius="full">
                            Required
                          </Badge>
                        </FormLabel>
                        <Textarea
                          placeholder="Describe your deliverables, progress, challenges, or any important notes for your mentor..."
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          minHeight="150px"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)",
                          }}
                          fontFamily="'Segoe UI', sans-serif"
                          resize="vertical"
                          p={4}
                          transition="all 0.3s"
                          _hover={{
                            borderColor: "blue.300"
                          }}
                        />
                      </FormControl>
                    </Box>
                  </VStack>
                </GridItem>

                {/* Right column - File upload and submit */}
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* File Upload section */}
                    <Box>
                      <FormControl isRequired>
                        <FormLabel
                          fontWeight="bold"
                          fontSize="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          color="gray.700"
                          mb={3}
                          display="flex"
                          alignItems="center"
                        >
                          Upload Deliverables
                          <Badge ml={2} colorScheme="blue" fontSize="xs" borderRadius="full">
                            Required
                          </Badge>
                        </FormLabel>
                        <Box
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="xl"
                          p={8}
                          textAlign="center"
                          transition="all 0.3s"
                          _hover={{
                            borderColor: "blue.400",
                            bg: "blue.50",
                          }}
                          position="relative"
                          overflow="hidden"
                          cursor="pointer"
                          animation={files.length === 0 ? `${pulse} 2s infinite` : "none"}
                        >
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            position="absolute"
                            top={0}
                            left={0}
                            width="100%"
                            height="100%"
                            opacity={0}
                            cursor="pointer"
                            zIndex={2}
                          />
                          <VStack spacing={4}>
                            <Box color="blue.500">
                              <Icon as={FaCloudUploadAlt} boxSize={10} />
                            </Box>
                            <Box>
                              <Text fontWeight="semibold" fontFamily="'Segoe UI', sans-serif" fontSize="lg">
                                Drag & Drop Files Here
                              </Text>
                              <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif" mt={1}>
                                or click to browse your files
                              </Text>
                            </Box>
                            <Badge colorScheme="blue" fontFamily="'Segoe UI', sans-serif" fontSize="xs" borderRadius="full">
                              PDF, DOC, DOCX, ZIP, JPG, PNG (Max 10MB each)
                            </Badge>
                          </VStack>
                        </Box>

                        {files.length > 0 && (
                          <Box mt={4}>
                            <Text fontWeight="medium" mb={2} fontFamily="'Segoe UI', sans-serif">
                              Selected Files:
                            </Text>
                            <VStack align="stretch" spacing={3}>
                              {files.map((file, index) => (
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
                                  <HStack overflow="hidden">
                                    <Icon as={FaFileAlt} color="blue.500" />
                                    <Text
                                      fontSize="sm"
                                      fontFamily="'Segoe UI', sans-serif"
                                      isTruncated
                                      maxW="200px"
                                    >
                                      {file.name}
                                    </Text>
                                  </HStack>
                                  <Badge
                                    colorScheme="blue"
                                    fontFamily="'Segoe UI', sans-serif"
                                    flexShrink={0}
                                    fontSize="xs"
                                    borderRadius="full"
                                  >
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </Badge>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </FormControl>
                    </Box>

                    {/* Submit button */}
                    <Button
                      size="lg"
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                      rightIcon={<FaPaperPlane />}
                      fontFamily="'Segoe UI', sans-serif"
                      fontWeight="bold"
                      fontSize="md"
                      py={7}
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, blue.600, purple.600)",
                        boxShadow: "xl",
                      }}
                      borderRadius="xl"
                      mt={4}
                      transition="all 0.3s"
                      animation={files.length > 0 && remark ? `${pulse} 2s infinite` : "none"}
                    >
                      Submit Deliverables
                    </Button>

                    {/* Help text */}
                    <Text textAlign="center" color="gray.500" fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                      Your submission will be reviewed by your mentor within 24-48 hours
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}