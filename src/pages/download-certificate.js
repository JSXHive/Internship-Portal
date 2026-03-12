import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  Icon,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Flex,
  useColorModeValue,
  keyframes,
  Image,
  HStack,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FiDownload, FiSearch, FiCheckCircle, FiXCircle, FiAward, FiUser, FiKey, FiAlertCircle, FiEye, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaCertificate, FaUserCheck } from "react-icons/fa";

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

// Framer motion wrappers
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionCard = motion(Card);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function DownloadCertificate() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(undefined);
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [dbError, setDbError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Disable browser navigation buttons
  useEffect(() => {
    const disableBackButton = () => {
      window.history.pushState(null, null, window.location.href);
    };
    
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', disableBackButton);
    
    return () => {
      window.removeEventListener('popstate', disableBackButton);
    };
  }, []);

  // Color scheme
  const headingColor = useColorModeValue("purple.800", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const accentColor = useColorModeValue("pink.500", "pink.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");

  const handleSearch = async () => {
    if (!studentId.trim() || !studentName.trim()) {
      // Removed toast notification
      return;
    }

    setIsLoading(true);
    setDbError(null);
    setCertificateStatus(null);
    
    try {
      const response = await fetch(`/api/download-certificate?id=${studentId}&name=${encodeURIComponent(studentName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to find certificate');
      }
      
      if (data.exists) {
        setCertificateData(data.certificate);
        setCertificateStatus('verified');
      } else {
        setCertificateData(null);
        setCertificateStatus(data.status || 'not_found');
      }
    } catch (error) {
      console.error('Error finding certificate:', error);
      setDbError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificateData && certificateData.filePath) {
      const link = document.createElement('a');
      link.href = certificateData.filePath;
      link.download = `certificate-${certificateData.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = () => {
    if (certificateData && certificateData.filePath) {
      onOpen();
    }
  };

  return (
    <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-br, blue.50, purple.50)"
        py={16}
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        {/* Animated background elements */}
        <Box
          position="absolute"
          top="-10%"
          right="-5%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="blue.100"
          opacity="0.3"
          css={{
            animation: `${pulse} 8s ease-in-out infinite`,
          }}
        />
        <Box
          position="absolute"
          bottom="10%"
          left="-5%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="purple.100"
          opacity="0.3"
          css={{
            animation: `${pulse} 6s ease-in-out infinite reverse`,
          }}
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge 
                colorScheme="blue" 
                fontSize="lg" 
                p={3} 
                borderRadius="md"
                boxShadow="md"
                mb={4}
                fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              >
                Certificate Download Portal
              </Badge>
            </MotionBox>

            {/* Logo container with border */}
            <Box
              position="relative"
              width="140px"
              height="140px"
              mx="auto"
              mb={4}
            >
              <Box
                width="110px"
                height="110px"
                borderRadius="full"
                border="4px solid"
                borderColor="blue.600"
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex="1"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="white"
                fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              >
                <Image
                  src="/logo.png"
                  alt="Internship Portal Logo"
                  width="100px"
                  height="100px"
                  objectFit="contain"
                />
              </Box>
            </Box>

            <MotionHeading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              lineHeight="shorter"
              color="blue.900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            >
              Download Your <Box as="span" color="purple.600">Internship Certificate</Box>
            </MotionHeading>

            <MotionText
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="medium"
              color="blue.800"
              maxW="2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            >
              Find and download your official internship certificate issued by 
              Info Tech Corporation of Goa Ltd.
            </MotionText>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box flex="1" py={16} bg={sectionBg} fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <Container maxW="3xl">
          <VStack spacing={10}>
            {/* Download Card */}
            <MotionCard 
              boxShadow="2xl" 
              borderRadius="2xl" 
              overflow="hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              position="relative"
              bg="white"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #4F46E5, #8B5CF6)",
              }}
            >
              <CardBody p={8}>
                <VStack spacing={6}>
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      borderRadius="full"
                      bgGradient="linear(to-br, blue.100, purple.100)"
                    >
                      <Icon as={FaCertificate} w={8} h={8} color="blue.500" />
                    </Box>
                    <Heading as="h2" size="lg" color={headingColor} fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Download Your Certificate
                    </Heading>
                  </HStack>
                  
                  <Text color={textColor} textAlign="center" fontSize="lg" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                    Enter your Student ID and Full Name to find and download your certificate
                  </Text>

                  {dbError && (
                    <Alert status="error" borderRadius="md" width="100%" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">Database Connection Error</Text>
                        <Text fontSize="sm">{dbError}</Text>
                      </Box>
                    </Alert>
                  )}

                  <VStack spacing={6} width="100%" mt={4}>
                    <FormControl>
                      <FormLabel fontWeight="bold" color="blue.700" fontSize="md" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" autocomplete="off">
                        Student ID
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiKey} color="blue.500" />
                        </InputLeftElement>
                        <Input
                          placeholder="Enter your Student ID"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          borderRadius="lg"
                          focusBorderColor="blue.500"
                          bg={inputBg}
                          fontSize="md"
                          height="50px"
                          boxShadow="sm"
                          _focus={{
                            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.2)",
                          }}
                          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold" color="blue.700" fontSize="md" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" autocomplete="off">
                        Full Name
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiUser} color="blue.500" />
                        </InputLeftElement>
                        <Input
                          placeholder="Enter your Full Name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          borderRadius="lg"
                          focusBorderColor="blue.500"
                          bg={inputBg}
                          fontSize="md"
                          height="50px"
                          boxShadow="sm"
                          _focus={{
                            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.2)",
                          }}
                          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        />
                      </InputGroup>
                    </FormControl>

                    <Button
                      bgGradient="linear(to-r, blue.500, purple.600)"
                      color="white"
                      size="lg"
                      width="100%"
                      onClick={handleSearch}
                      isLoading={isLoading}
                      loadingText="Searching..."
                      leftIcon={<FiSearch />}
                      borderRadius="lg"
                      py={6}
                      fontWeight="bold"
                      fontSize="md"
                      _hover={{
                        bgGradient: "linear(to-r, blue.600, purple.700)",
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                        _before: {
                          transform: "translateX(100%)"
                        }
                      }}
                      _active={{
                        bgGradient: "linear(to-r, blue.700, purple.800)",
                      }}
                      transition="all 0.2s"
                      position="relative"
                      overflow="hidden"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
                        transform: "translateX(-100%)",
                        transition: "transform 0.6s ease"
                      }}
                      fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    >
                      Find Certificate
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Results Section */}
            {isLoading ? (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Center py={10}>
                  <VStack spacing={6}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text fontWeight="medium" color={textColor} fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Searching for your certificate...
                    </Text>
                  </VStack>
                </Center>
              </MotionBox>
            ) : certificateData && certificateStatus === 'verified' ? (
              <MotionCard 
                bg="blue.50" 
                borderColor="blue.200"
                borderWidth="2px"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardBody p={8}>
                  <VStack spacing={6} textAlign="center">
                    <Icon as={FiCheckCircle} w={16} h={16} color="green.500" />
                    <Heading as="h2" size="lg" color="green.700" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Certificate Found!
                    </Heading>
                    <Text fontSize="lg" fontWeight="medium" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Great news, {certificateData.studentName}! Your certificate for {certificateData.programName} is available.
                    </Text>
                    
                    <Box mt={4} p={6} bg="white" borderRadius="xl" w="100%" boxShadow="md">
                      <Heading as="h3" size="md" mb={4} color="blue.700" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Certificate Details</Heading>
                      <VStack spacing={3} align="start" divider={<Divider />}>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Certificate ID:</Text>
                          <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.certificateId}</Text>
                        </HStack>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Student Name:</Text>
                          <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.studentName}</Text>
                        </HStack>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Program:</Text>
                          <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.programName}</Text>
                        </HStack>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Issue Date:</Text>
                          <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.issueDate}</Text>
                        </HStack>
                        {certificateData.duration && (
                          <HStack justify="space-between" w="100%">
                            <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Duration:</Text>
                            <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.duration}</Text>
                          </HStack>
                        )}
                        {certificateData.domain && (
                          <HStack justify="space-between" w="100%" align="start">
                            <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Domain:</Text>
                            <Text textAlign="right" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.domain}</Text>
                          </HStack>
                        )}
                        {certificateData.verificationId && (
                          <HStack justify="space-between" w="100%">
                            <Text fontWeight="bold" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Verification ID:</Text>
                            <Text fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">{certificateData.verificationId}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                    
                    {/* Action Buttons */}
                    <HStack spacing={4} width="100%">
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiEye />}
                        onClick={handleView}
                        size="lg"
                        flex="1"
                        py={6}
                        borderRadius="lg"
                        fontWeight="bold"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg"
                        }}
                        transition="all 0.2s"
                        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                      >
                        View Certificate
                      </Button>
                      <Button
                        colorScheme="green"
                        leftIcon={<FiDownload />}
                        onClick={handleDownload}
                        size="lg"
                        flex="1"
                        py={6}
                        borderRadius="lg"
                        fontWeight="bold"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg"
                        }}
                        transition="all 0.2s"
                        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                      >
                        Download PDF
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </MotionCard>
            ) : certificateStatus === 'pending_verification' ? (
              <MotionCard 
                bg="yellow.50" 
                borderColor="yellow.200"
                borderWidth="2px"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardBody p={8}>
                  <VStack spacing={6} textAlign="center">
                    <Icon as={FiInfo} w={16} h={16} color="yellow.500" />
                    <Heading as="h2" size="lg" color="yellow.700" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Certificate Pending Verification
                    </Heading>
                    <Text fontSize="lg" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Your certificate is currently under review and pending verification.
                    </Text>
                    <Text fontSize="md" color="gray.600" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Please check back later. You will be able to download your certificate once it&apos;s verified.
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>
            ) : certificateStatus === 'rejected' ? (
              <MotionCard 
                bg="red.50" 
                borderColor="red.200"
                borderWidth="2px"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardBody p={8}>
                  <VStack spacing={6} textAlign="center">
                    <Icon as={FiXCircle} w={16} h={16} color="red.500" />
                    <Heading as="h2" size="lg" color="red.700" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Certificate Rejected
                    </Heading>
                    <Text fontSize="lg" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Your certificate has been rejected during the verification process.
                    </Text>
                    <Text fontSize="md" color="gray.600" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Please contact the administrator at support itggoa.helpdesk@gmail.com for more information.
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>
            ) : certificateStatus === 'not_found' ? (
              <MotionCard 
                bg="orange.50" 
                borderColor="orange.200"
                borderWidth="2px"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardBody p={8}>
                  <VStack spacing={6} textAlign="center">
                    <Icon as={FiInfo} w={16} h={16} color="orange.500" />
                    <Heading as="h2" size="lg" color="orange.700" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      Certificate Not Found
                    </Heading>
                    <Text fontSize="lg" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      No certificate found for the provided details. Please check your information and try again.
                    </Text>
                    <Text fontSize="md" color="gray.600" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                      If you believe this is an error, please contact the administrator at support itggoa.helpdesk@gmail.com

                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>
            ) : (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                textAlign="center"
                py={10}
              >
                <VStack spacing={6}>
                  <Icon as={FiAward} w={12} h={12} color="gray.400" />
                  <Text fontSize="lg" color="gray.500" fontWeight="medium" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                    Enter your details above to find and download your certificate
                  </Text>
                </VStack>
              </MotionBox>
            )}

            {/* View Certificate Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="6xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                  Certificate Preview - {certificateData?.studentName}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {certificateData && certificateData.filePath ? (
                    <Box 
                      width="100%" 
                      height="70vh" 
                      border="1px solid" 
                      borderColor="gray.200" 
                      borderRadius="md"
                    >
                      <iframe 
                        src={certificateData.filePath} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        title={`Certificate - ${certificateData.studentName}`}
                      />
                    </Box>
                  ) : (
                    <Center height="200px">
                      <Text color="gray.500" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                        Certificate file not available for preview
                      </Text>
                    </Center>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FiDownload />}
                    onClick={handleDownload}
                    fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  >
                    Download Certificate
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Additional Information */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              textAlign="center"
              pt={8}
            >
              <VStack spacing={4}>
                <Heading as="h3" size="md" color={headingColor} fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                  Need Help?
                </Heading>
                <Text color={textColor} maxW="xl" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
                  If you&apos;re experiencing issues with certificate download, please contact 
                  our support team at <Box as="span" fontWeight="bold">itggoa.helpdesk@gmail.com</Box> or 
                  call <Box as="span" fontWeight="bold">+91 (832) 2226024</Box>
                </Text>
              </VStack>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}