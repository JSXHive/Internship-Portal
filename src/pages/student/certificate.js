import {
  Box,
  Heading,
  VStack,
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
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  keyframes,
  Container
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaArrowLeft,
  FaFileDownload,
  FaEye,
  FaCertificate,
  FaCalendarDay,
  FaIdCard,
  FaUser,
  FaAward,
  FaPrint,
  FaRocket,
  FaTrophy,
  FaShieldCheck,
  FaQrcode,
  FaCrown,
  FaUpload,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(128, 90, 213, 0.5); }
  50% { box-shadow: 0 0 20px rgba(128, 90, 213, 0.8); }
  100% { box-shadow: 0 0 5px rgba(128, 90, 213, 0.5); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function CertificatePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  // Light theme color values - Lighter colors
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.900");
  const gradientBg = useColorModeValue(
    "linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)",
    "linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)"
  );
  const accentGradient = "linear-gradient(135deg, #D53F8C 0%, #ED64A6 100%)";
  const successGradient = "linear-gradient(135deg, #68D391 0%, #38A169 100%)";
  const royalGradient = "linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)";

  useEffect(() => {
    const fetchUserAndCertificate = async () => {
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
            title: "Error",
            description: "User data is incomplete. Please login again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push('/login');
          return;
        }

        setUser(parsedUser);

        // Fetch certificate data from the correct API endpoint
        const response = await fetch(`/api/student/certificate?userId=${userId}`);
        
        if (response.ok) {
          const certificateData = await response.json();
          
          // Simulate minimum 2 second loading
          setTimeout(() => {
            setCertificate(certificateData);
            setIsLoading(false);
          }, 2000);
        } else if (response.status === 404) {
          // No certificate found - this is normal
          setTimeout(() => {
            setCertificate(null);
            setIsLoading(false);
          }, 2000);
        } else {
          throw new Error('Failed to fetch certificate data');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setTimeout(() => {
          toast({
            title: "Error",
            description: "Failed to load certificate data. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchUserAndCertificate();
  }, [router, toast]);

  const handleDownload = async () => {
    if (!certificate) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/student/certificates/download?certificateId=${certificate.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const filename = `certificate_${certificate.student_name}_${certificate.program_name}.pdf`
        .replace(/\s+/g, '_')
        .toLowerCase();
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "🎉 Download Started!",
        description: "Your certificate is being downloaded",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download certificate. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = () => {
    if (!certificate) return;
    
    // Open certificate in new tab for viewing
    window.open(`/api/student/certificates/view?certificateId=${certificate.id}`, '_blank');
  };

  const handlePrint = () => {
    if (!certificate) return;
    
    // Open print view
    window.open(`/api/student/certificates/print?certificateId=${certificate.id}`, '_blank');
  };

  // Loading state with the provided loading function
  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="xl"
            bgGradient="linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaCertificate} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading your certificate...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} position="relative" overflow="hidden" fontFamily="'Segoe UI', sans-serif">
      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="10%"
        right="5%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="purple.100"
        opacity="0.3"
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="10%"
        left="5%"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="teal.100"
        opacity="0.3"
        animation={`${float} 8s ease-in-out infinite`}
      />

      <Container maxW="7xl" py={8} px={4} position="relative" zIndex={1}>
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={() => router.push("/student/dashboard")}
              leftIcon={<FaArrowLeft />}
              borderRadius="xl"
              size="lg"
              borderWidth="2px"
              fontFamily="'Segoe UI', sans-serif"
              fontWeight="600"
              _hover={{ 
                transform: "translateX(-5px)",
                bg: "purple.50",
                boxShadow: "lg"
              }}
              transition="all 0.3s"
            >
              Back to Dashboard
            </Button>
            
            <VStack spacing={2}>
            <Heading
               fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="800"
          textAlign="center"
          fontFamily="'Segoe UI', sans-serif"
          >
          <span role="img" aria-label="trophy">🏆</span>{' '}
          <Box
            as="span"
            bgGradient={gradientBg}
            bgClip="text"
          >
      My Certificate
    </Box>
  </Heading>

  <Text
    color="purple.600"
    fontSize="lg"
    textAlign="center"
    fontFamily="'Segoe UI', sans-serif"
    fontWeight="500"
  >
    Download Your Achievement Certificate
  </Text>
</VStack>
   
            <Box w="140px" /> {/* Spacer for alignment */}
          </Flex>
        </MotionBox>

        {!certificate ? (
          // No Certificate View - Enhanced Light Theme
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Center py={16}>
              <Card
                maxW="md"
                bg={cardBg}
                borderRadius="3xl"
                boxShadow="2xl"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "6px",
                  bgGradient: gradientBg,
                }}
              >
                <CardBody p={8} textAlign="center">
                  <Box
                    animation={`${float} 4s ease-in-out infinite`}
                    mb={6}
                  >
                    <Icon as={FaCertificate} boxSize={16} color="purple.500" />
                  </Box>
                  <Heading size="lg" mb={4} color="gray.700" fontFamily="'Segoe UI', sans-serif">
                    Certificate Not Available
                  </Heading>
                  <Text mb={6} color="gray.600" lineHeight="1.6" fontFamily="'Segoe UI', sans-serif">
                    Your internship certificate is being processed. Once your internship is completed 
                    and verified by your mentor, your certificate will be available for download here.
                  </Text>
                  <VStack spacing={4}>
                    <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full" fontFamily="'Segoe UI', sans-serif">
                      Status: Processing
                    </Badge>
                    <Button
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => router.push("/student/dashboard")}
                      borderRadius="xl"
                      size="lg"
                      fontFamily="'Segoe UI', sans-serif"
                      borderWidth="2px"
                    >
                      Return to Dashboard
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Center>
          </MotionBox>
        ) : (
          // Certificate View - Enhanced Light Theme
          <VStack spacing={8} align="stretch">
            {/* Hero Certificate Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              bg={cardBg}
              borderRadius="3xl"
              boxShadow="2xl"
              overflow="hidden"
              border="1px solid"
              borderColor="purple.100"
              _hover={{ boxShadow: "2xl" }}
            >
              <Box
                bgGradient={royalGradient}
                color="white"
                p={6}
                textAlign="center"
              >
                <Flex align="center" justify="center" mb={2}>
                  <Icon as={FaTrophy} boxSize={8} mr={3} />
                  <Heading size="xl" fontFamily="'Segoe UI', sans-serif">Certificate of Completion</Heading>
                </Flex>
                <Text fontSize="lg" opacity={0.9} fontFamily="'Segoe UI', sans-serif">
                  Congratulations on successfully completing your internship!
                </Text>
              </Box>

              <CardBody p={8}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                  {/* Certificate Details */}
                  <VStack spacing={6} align="stretch">
                    <HStack>
                      <Icon as={FaCertificate} color="purple.500" boxSize={8} />
                      <Heading size="lg" color="gray.800" fontFamily="'Segoe UI', sans-serif">
                        Certificate Details
                      </Heading>
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      {/* Student Info Row */}
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="purple.50"
                        borderLeft="4px solid"
                        borderColor="purple.500"
                      >
                        <HStack>
                          <Icon as={FaUser} color="purple.500" />
                          <Text fontWeight="bold" color="purple.700" fontFamily="'Segoe UI', sans-serif">Student Name</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="semibold" mt={2} fontFamily="'Segoe UI', sans-serif">
                          {certificate.student_name || user?.name}
                        </Text>
                      </Box>

                      {/* Program Info Row */}
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="teal.50"
                        borderLeft="4px solid"
                        borderColor="teal.500"
                      >
                        <HStack>
                          <Icon as={FaAward} color="teal.500" />
                          <Text fontWeight="bold" color="teal.700" fontFamily="'Segoe UI', sans-serif">Program Completed</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="semibold" mt={2} fontFamily="'Segoe UI', sans-serif">
                          {certificate.program_name}
                        </Text>
                      </Box>

                      {/* Details Grid */}
                      <SimpleGrid columns={2} spacing={4}>
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg="blue.50"
                          textAlign="center"
                          border="1px solid"
                          borderColor="blue.100"
                        >
                          <Text fontSize="sm" color="blue.600" fontFamily="'Segoe UI', sans-serif">Issue Date</Text>
                          <Text fontWeight="bold" color="blue.800" fontFamily="'Segoe UI', sans-serif">
                            {new Date(certificate.issue_date).toLocaleDateString()}
                          </Text>
                        </Box>
                        
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg="green.50"
                          textAlign="center"
                          border="1px solid"
                          borderColor="green.100"
                        >
                          <Text fontSize="sm" color="green.600" fontFamily="'Segoe UI', sans-serif">Duration</Text>
                          <Text fontWeight="bold" color="green.800" fontFamily="'Segoe UI', sans-serif">
                            {certificate.duration || 'N/A'}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      {/* Verification Badge */}
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="green.50"
                        border="2px dashed"
                        borderColor="green.200"
                        textAlign="center"
                      >
                        <HStack justify="center" mb={2}>
                          <Icon as={FaQrcode} color="green.500" />
                          <Text fontWeight="bold" color="green.700" fontFamily="'Segoe UI', sans-serif">Verification ID</Text>
                        </HStack>
                        <Text fontFamily="monospace" fontSize="sm" color="gray.700">
                          {certificate.verification_id}
                        </Text>
                      </Box>
                    </VStack>
                  </VStack>

                  {/* Certificate Actions */}
                  <VStack spacing={6} align="stretch">
                    {/* Certificate Preview */}
                    <MotionBox
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Box
                        border="3px dashed"
                        borderColor="purple.200"
                        borderRadius="2xl"
                        p={8}
                        textAlign="center"
                        bg="purple.50"
                        minH="250px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                        animation={`${glow} 3s infinite`}
                        cursor="pointer"
                        onClick={handleView}
                      >
                        <Box
                          animation={`${float} 4s ease-in-out infinite`}
                          mb={4}
                        >
                          <Icon as={FaCertificate} color="purple.500" boxSize={20} />
                        </Box>
                        <Text fontWeight="extrabold" fontSize="2xl" color="purple.700" mb={2} fontFamily="'Segoe UI', sans-serif">
                          Official Certificate
                        </Text>
                        <Text fontSize="md" color="purple.600" mb={4} fontFamily="'Segoe UI', sans-serif">
                          {certificate.program_name}
                        </Text>
                        <Badge
                          colorScheme="green"
                          fontSize="md"
                          px={4}
                          py={2}
                          borderRadius="full"
                          animation={`${pulse} 2s infinite`}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          ✅ Verified & Authentic
                        </Badge>
                      </Box>
                    </MotionBox>

                    {/* Action Buttons */}
                    <VStack spacing={4}>
                      <Button
                        size="lg"
                        colorScheme="purple"
                        leftIcon={<FaEye />}
                        onClick={handleView}
                        width="full"
                        py={7}
                        fontSize="lg"
                        borderRadius="xl"
                        bgGradient={gradientBg}
                        color="white"
                        fontFamily="'Segoe UI', sans-serif"
                        fontWeight="600"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "xl",
                        }}
                        transition="all 0.3s"
                      >
                        👀 View Certificate
                      </Button>

                      <Button
                        size="lg"
                        colorScheme="green"
                        leftIcon={<FaFileDownload />}
                        onClick={handleDownload}
                        isLoading={isDownloading}
                        loadingText="Downloading..."
                        width="full"
                        py={7}
                        fontSize="lg"
                        borderRadius="xl"
                        bgGradient={successGradient}
                        color="white"
                        fontFamily="'Segoe UI', sans-serif"
                        fontWeight="600"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "xl",
                        }}
                        transition="all 0.3s"
                      >
                        📥 Download PDF Certificate
                      </Button>

                      <Button
                        size="lg"
                        colorScheme="blue"
                        leftIcon={<FaPrint />}
                        onClick={handlePrint}
                        width="full"
                        py={7}
                        fontSize="lg"
                        borderRadius="xl"
                        variant="outline"
                        borderWidth="2px"
                        fontFamily="'Segoe UI', sans-serif"
                        fontWeight="600"
                        _hover={{
                          transform: "translateY(-2px)",
                          bg: "blue.50",
                        }}
                        transition="all 0.3s"
                      >
                        🖨️ Print Certificate
                      </Button>
                    </VStack>

                    {/* Success Message */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="green.50"
                      borderLeft="4px solid"
                      borderColor="green.400"
                    >
                      <Text fontSize="sm" color="green.800" textAlign="center" fontFamily="'Segoe UI', sans-serif">
                        🎉 Congratulations! Your certificate is ready. Download and share your achievement.
                      </Text>
                    </Box>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </MotionCard>

            {/* Verification Section */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Icon as={FaCertificate} color="purple.500" />
                    <Heading size="md" color="gray.700" fontFamily="'Segoe UI', sans-serif">
                      Certificate Verification
                    </Heading>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="medium" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">
                        Certificate ID
                      </Text>
                      <Badge colorScheme="purple" fontFamily="monospace" fontSize="md" p={2} borderRadius="lg">
                        {certificate.certificate_id}
                      </Badge>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">
                        Verification ID
                      </Text>
                      <Badge colorScheme="green" fontFamily="monospace" fontSize="md" p={2} borderRadius="lg">
                        {certificate.verification_id}
                      </Badge>
                    </Box>
                  </SimpleGrid>

                  <Text fontSize="sm" color="gray.500" textAlign="center" fontFamily="'Segoe UI', sans-serif">
                    Issued on {new Date(certificate.issued_at || certificate.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} • Officially verified by Info Tech Corporation of Goa
                  </Text>
                </VStack>
              </CardBody>
            </MotionCard>
          </VStack>
        )}
      </Container>
    </Box>
  );
}