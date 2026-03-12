import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  useToast,
  Flex,
  Icon,
  Avatar,
  Card,
  CardBody,
  VStack,
  Spinner,
  HStack,
  Input,
  Select,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
  FormControl,
  FormLabel,
  keyframes,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaSync,
  FaEye,
  FaCheckCircle,
  FaCertificate,
  FaFilePdf,
  FaUserGraduate,
  FaShieldCheck,
  FaCheck,
  FaTimes,
  FaClock,
  FaUndo,
  FaExclamationTriangle,
  FaEnvelope,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaUserTie,
} from "react-icons/fa";

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

export default function MentorVerifyCertificates() {
  const router = useRouter();
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifying, setVerifying] = useState(false);
  const [sendingCorrection, setSendingCorrection] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState("");
  const [correctionDetails, setCorrectionDetails] = useState(null);
  const [updatingCorrection, setUpdatingCorrection] = useState(false);
  const [updatedCorrectionMessage, setUpdatedCorrectionMessage] = useState("");
  const [minimumLoadingTimePassed, setMinimumLoadingTimePassed] = useState(false);
  const [currentStudentMentor, setCurrentStudentMentor] = useState(null);
  const [mentorId, setMentorId] = useState(null);
  const loadingStartTime = useRef(null);

  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isVerifyOpen, onOpen: onVerifyOpen, onClose: onVerifyClose } = useDisclosure();
  const { isOpen: isCorrectionOpen, onOpen: onCorrectionOpen, onClose: onCorrectionClose } = useDisclosure();
  const { isOpen: isCorrectionDetailsOpen, onOpen: onCorrectionDetailsOpen, onClose: onCorrectionDetailsClose } = useDisclosure();
  const { isOpen: isEditCorrectionOpen, onOpen: onEditCorrectionOpen, onClose: onEditCorrectionClose } = useDisclosure();
  const { isOpen: isDeleteCorrectionOpen, onOpen: onDeleteCorrectionOpen, onClose: onDeleteCorrectionClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("purple.500", "purple.400");
  const subtleBg = useColorModeValue("purple.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerGradient = useColorModeValue("linear(to-r, purple.500, purple.600)", "linear(to-r, purple.600, purple.700)");

  // Enhanced toast notifications
  const showToast = useCallback((title, description, status, emoji) => {
    toast({
      title: `${emoji} ${title}`,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  }, [toast]);

  // Function to ensure minimum loading time
  const ensureMinimumLoadingTime = (startTime, callback) => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(2000 - elapsedTime, 0);
    
    setTimeout(() => {
      callback();
    }, remainingTime);
  };

  // Fetch certificates for verification
  const fetchCertificates = useCallback(async () => {
    if (!mentorId) {
      console.warn('Mentor ID not available yet');
      return;
    }

    loadingStartTime.current = Date.now();
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('mentorId', mentorId);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      console.log('Fetching certificates with mentor ID:', mentorId);

      const response = await fetch(`/api/mentor/certificates?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Certificates data received:', data);
        
        ensureMinimumLoadingTime(loadingStartTime.current, () => {
          setCertificates(data.certificates || []);
          setLoading(false);
          setRefreshing(false);
          
          if (data.certificates && data.certificates.length === 0) {
            showToast(
              "No Certificates Found", 
              data.message || "No students are currently assigned to you or no certificates issued yet.", 
              "info", 
              "🔍"
            );
          }
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch certificates");
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      
      ensureMinimumLoadingTime(loadingStartTime.current, () => {
        setLoading(false);
        setRefreshing(false);
        setCertificates([]);
        showToast(
          "Connection Issue", 
          error.message || "We couldn't fetch certificates. Please check your connection! 🌐", 
          "error", 
          "❌"
        );
      });
    }
  }, [showToast, statusFilter, searchTerm, mentorId]);

  // Get mentor ID from localStorage or session - FIXED VERSION
  useEffect(() => {
    const getMentorId = () => {
      if (typeof window !== 'undefined') {
        // Try different storage locations - prioritize userId like the working example
        const storedMentor = localStorage.getItem('userId') || 
                            localStorage.getItem('user_id') || 
                            localStorage.getItem('mentorId') || 
                            sessionStorage.getItem('userId') ||
                            sessionStorage.getItem('user_id') ||
                            sessionStorage.getItem('mentorId');
        
        if (storedMentor) {
          console.log('Found mentor ID:', storedMentor);
          setMentorId(storedMentor);
          return storedMentor;
        }
        
        console.warn('Mentor ID not found in storage. Checked for: userId, user_id, mentorId');
        console.log('Available localStorage:', Object.keys(localStorage));
        console.log('Available sessionStorage:', Object.keys(sessionStorage));
      }
      return null;
    };

    const mentor = getMentorId();
    if (!mentor) {
      // If no mentor ID found, wait 2 seconds then show error
      const timer = setTimeout(() => {
        setLoading(false);
        setMinimumLoadingTimePassed(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // If mentor ID found, still wait 2 seconds for consistent loading
      const timer = setTimeout(() => {
        setMinimumLoadingTimePassed(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const refreshData = () => {
    if (!mentorId) {
      showToast(
        "Mentor ID Missing", 
        "Please wait while we load your mentor information... 🔄", 
        "warning", 
        "⚠️"
      );
      return;
    }
    setRefreshing(true);
    fetchCertificates();
    showToast(
      "Refreshing Data", 
      "Fetching the latest certificates... 🔄", 
      "info", 
      "🔄"
    );
  };

  // Fetch certificates when mentorId is available
  useEffect(() => {
    if (mentorId) {
      fetchCertificates();
    }
  }, [mentorId, fetchCertificates]); // Fixed: Added fetchCertificates to dependencies

  // Update certificates when filters change
  useEffect(() => {
    if (mentorId && minimumLoadingTimePassed) {
      const timeoutId = setTimeout(() => {
        fetchCertificates();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, mentorId, minimumLoadingTimePassed, fetchCertificates]); // Fixed: Added fetchCertificates to dependencies

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'green';
      case 'issued': return 'purple';
      case 'correction_requested': return 'orange';
      case 'pending_verification': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return FaCheckCircle;
      case 'issued': return FaCertificate;
      case 'correction_requested': return FaExclamationTriangle;
      case 'pending_verification': return FaClock;
      default: return FaFilePdf;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // View certificate details
  const viewCertificateDetails = async (certificate) => {
    try {
      const response = await fetch(`/api/mentor/certificates/${certificate.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCertificate(data.certificate);
        // Fetch mentor info for this student
        await fetchStudentMentor(data.certificate.student_id);
        onDetailsOpen();
      } else {
        throw new Error("Failed to fetch certificate details");
      }
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      showToast(
        "Details Unavailable", 
        "Couldn't load certificate details. Please try again! 📄", 
        "error", 
        "🔍"
      );
    }
  };

  // Fetch mentor info for a student
  const fetchStudentMentor = async (studentId) => {
    try {
      const response = await fetch(`/api/mentor/get-student-mentor?student_id=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentStudentMentor(data.mentor);
      } else {
        console.error('Failed to fetch mentor info');
        setCurrentStudentMentor(null);
      }
    } catch (error) {
      console.error('Error fetching mentor:', error);
      setCurrentStudentMentor(null);
    }
  };

  // View correction details
  const viewCorrectionDetails = async (certificate) => {
    try {
      const response = await fetch(`/api/mentor/certificates/${certificate.id}/correction-details`);
      if (response.ok) {
        const data = await response.json();
        setCorrectionDetails(data.correctionDetails);
        setSelectedCertificate(certificate);
        setUpdatedCorrectionMessage(data.correctionDetails?.message || "");
        onCorrectionDetailsOpen();
      } else {
        throw new Error("Failed to fetch correction details");
      }
    } catch (error) {
      console.error("Error fetching correction details:", error);
      showToast(
        "Correction Details Unavailable", 
        "Couldn't load correction details. Please try again! 📄", 
        "error", 
        "🔍"
      );
    }
  };

  // Open verify confirmation
  const openVerifyModal = (certificate) => {
    setSelectedCertificate(certificate);
    onVerifyOpen();
  };

  // Open correction request modal
  const openCorrectionModal = (certificate) => {
    setSelectedCertificate(certificate);
    setCorrectionMessage("");
    onCorrectionOpen();
  };

  // Open edit correction modal
  const openEditCorrectionModal = () => {
    setUpdatedCorrectionMessage(correctionDetails?.message || "");
    onEditCorrectionOpen();
  };

  // Open delete correction confirmation
  const openDeleteCorrectionModal = () => {
    onDeleteCorrectionOpen();
  };

  // Verify/Unverify certificate
  const handleVerifyCertificate = async () => {
    setVerifying(true);

    try {
      const response = await fetch(`/api/mentor/certificates/${selectedCertificate.id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.action === 'verified') {
          showToast(
            "Certificate Verified!", 
            "The certificate has been successfully verified! 🎓✨", 
            "success", 
            "✅"
          );
        } else {
          showToast(
            "Verification Undone!", 
            "The certificate verification has been removed! ↩️", 
            "info", 
            "🔄"
          );
        }
        
        onVerifyClose();
        refreshData();
        setSelectedCertificate(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify certificate");
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      showToast(
        "Verification Failed", 
        "We couldn't verify the certificate. Please try again! 🛠️", 
        "error", 
        "❌"
      );
    } finally {
      setVerifying(false);
    }
  };

  // Send correction request to admin
  const handleSendCorrection = async () => {
    if (!correctionMessage.trim()) {
      showToast(
        "Message Required", 
        "Please provide details about the required correction 📝", 
        "error", 
        "❌"
      );
      return;
    }

    setSendingCorrection(true);

    try {
      console.log('Sending correction for certificate:', selectedCertificate.id);
      console.log('Student ID:', selectedCertificate.student_id);
      
      const requestData = {
        correction_message: correctionMessage
      };

      const response = await fetch(`/api/mentor/certificates/${selectedCertificate.id}/request-correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Correction API response:', data);
        
        showToast(
          "Correction Request Sent!", 
          "Your request has been sent to the admin team 📨", 
          "success", 
          "✅"
        );
        onCorrectionClose();
        refreshData();
        setSelectedCertificate(null);
        setCorrectionMessage("");
      } else {
        const errorData = await response.json();
        console.error('Correction API error:', errorData);
        throw new Error(errorData.error || "Failed to send correction request");
      }
    } catch (error) {
      console.error("Error sending correction request:", error);
      
      if (error.message.includes('Mentor profile not found') || error.message.includes('No mentor allocated')) {
        showToast(
          "Mentor Allocation Issue", 
          error.message || "No mentor allocated for this student. Please check student application. 👤", 
          "error", 
          "❌"
        );
      } else {
        showToast(
          "Request Failed", 
          "We couldn't send your correction request. Please try again! 🛠️", 
          "error", 
          "❌"
        );
      }
    } finally {
      setSendingCorrection(false);
    }
  };

  // Update correction request
  const handleUpdateCorrection = async () => {
    if (!updatedCorrectionMessage.trim()) {
      showToast(
        "Message Required", 
        "Please provide details about the required correction 📝", 
        "error", 
        "❌"
      );
      return;
    }

    setUpdatingCorrection(true);

    try {
      const response = await fetch(`/api/mentor/correction-requests/${correctionDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: updatedCorrectionMessage
        }),
      });

      if (response.ok) {
        showToast(
          "Correction Request Updated!", 
          "Your correction request has been updated successfully! 📝", 
          "success", 
          "✅"
        );
        onEditCorrectionClose();
        // Refresh correction details
        if (selectedCertificate) {
          await viewCorrectionDetails(selectedCertificate);
        }
        refreshData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update correction request");
      }
    } catch (error) {
      console.error("Error updating correction request:", error);
      showToast(
        "Update Failed", 
        "We couldn't update your correction request. Please try again! 🛠️", 
        "error", 
        "❌"
      );
    } finally {
      setUpdatingCorrection(false);
    }
  };

  // Delete correction request
  const handleDeleteCorrection = async () => {
    try {
      const response = await fetch(`/api/mentor/correction-requests/${correctionDetails.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast(
          "Correction Request Deleted!", 
          "Your correction request has been deleted successfully! 🗑️", 
          "success", 
          "✅"
        );
        onDeleteCorrectionClose();
        onCorrectionDetailsClose();
        refreshData();
        setSelectedCertificate(null);
        setCorrectionDetails(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete correction request");
      }
    } catch (error) {
      console.error("Error deleting correction request:", error);
      showToast(
        "Deletion Failed", 
        "We couldn't delete your correction request. Please try again! 🛠️", 
        "error", 
        "❌"
      );
    }
  };

  // View certificate PDF
  const viewCertificatePDF = (filePath) => {
    if (filePath) {
      window.open(filePath, '_blank');
      showToast(
        "PDF Opening", 
        "Certificate PDF is opening in a new tab... 📄", 
        "info", 
        "🔓"
      );
    } else {
      showToast(
        "PDF Not Available", 
        "No certificate PDF found for this record. 📭", 
        "error", 
        "❌"
      );
    }
  };

  // Calculate stats
  const stats = {
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    verified: certificates.filter(c => c.status === 'verified').length,
    correctionRequested: certificates.filter(c => c.status === 'correction_requested').length,
    pending: certificates.filter(c => c.status === 'pending_verification').length,
  };

  // Enhanced loading component - now shows for at least 2 seconds
  if (loading && !minimumLoadingTimePassed) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="2xl"
            bgGradient={headerGradient}
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaCertificate} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          <Text fontWeight="medium" fontSize="lg" color="black">
            Loading Certificate Verification...
          </Text>
          <Text fontSize="sm" color="gray.500">Gathering certificates for verification</Text>
        </VStack>
      </Box>
    );
  }

  // Show message if mentor ID is not available
  if (!mentorId && minimumLoadingTimePassed) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="2xl"
            bg="orange.500"
            color="white"
            boxShadow="xl"
          >
            <Icon as={FaExclamationTriangle} boxSize={10} />
          </Box>
          <Text fontWeight="bold" fontSize="xl" color="gray.700">
            Mentor Information Required
          </Text>
          <Text fontSize="md" color="gray.600" textAlign="center" maxW="md">
            We couldn&apos;t retrieve your mentor information. Please make sure you&apos;re logged in as a mentor.
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
            Looking for: userId, user_id, or mentorId in localStorage/sessionStorage
          </Text>
          <Button
            colorScheme="purple"
            onClick={() => router.push('/mentor/dashboard')}
            leftIcon={<FaArrowLeft />}
          >
            Back to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.50, pink.50)" fontFamily="'Segoe UI', sans-serif" py={4}>
      <Container maxW="8xl" px={4}>
        {/* Header with Back Button and Actions */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="purple"
            variant="outline"
            size="md"
            onClick={() => router.push("/mentor/dashboard")}
            _hover={{ 
              bg: "purple.50",
              transform: "translateX(-4px)",
              transition: "transform 0.2s"
            }}
            borderRadius="xl"
            fontWeight="600"
          >
            Back to Dashboard
          </Button>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FaSync />}
              colorScheme="purple"
              variant="outline"
              size="md"
              onClick={refreshData}
              isLoading={refreshing}
              borderRadius="xl"
              fontWeight="600"
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {/* Main Header */}
        <Card 
          mb={6} 
          borderRadius="2xl" 
          boxShadow="xl" 
          bg={cardBg}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100px"
            bgGradient={headerGradient}
            opacity="0.1"
          />
          <CardBody py={8}>
            <VStack spacing={4} textAlign="center" position="relative" zIndex={1}>
              <Box
                w={20}
                h={20}
                bgGradient={headerGradient}
                borderRadius="2xl"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="lg"
                animation={`${float} 3s ease-in-out infinite`}
                mb={4}
              >
                <Icon as={FaCertificate} boxSize={8} />
              </Box>
              <Heading size="xl" fontWeight="700" textAlign="center">
                <Text as="span" mr={2}>🔍</Text>
                <Text
                  as="span"
                  bgGradient={headerGradient}
                  bgClip="text"
                > 
                  Certificate Verification
                </Text>
              </Heading>
              <Text color="gray.600" fontSize="lg" fontWeight="500" maxW="2xl">
                Verify internship completion certificates issued to students
              </Text>
              <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                {stats.total} Total Certificates
              </Badge>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={4} mb={6}>
          {[
            { 
              label: "Total", 
              value: stats.total, 
              color: "purple", 
              icon: FaCertificate,
              gradient: "linear(to-r, purple.500, pink.500)"
            },
            { 
              label: "Pending", 
              value: stats.pending + stats.issued, 
              color: "blue", 
              icon: FaClock,
              gradient: "linear(to-r, blue.500, cyan.500)"
            },
            { 
              label: "Verified", 
              value: stats.verified, 
              color: "green", 
              icon: FaCheckCircle,
              gradient: "linear(to-r, green.500, teal.500)"
            },
            { 
              label: "Corrections", 
              value: stats.correctionRequested, 
              color: "orange", 
              icon: FaExclamationTriangle,
              gradient: "linear(to-r, orange.500, red.500)"
            },
          ].map((stat, index) => (
            <Card 
              key={index} 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg"
              _hover={{ transform: "translateY(-4px)", transition: "transform 0.2s" }}
              transition="transform 0.2s"
              flex="1"
              minW="0"
            >
              <CardBody py={5}>
                <Flex align="center" justify="space-between">
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" color="gray.600" fontWeight="600" mb={1} noOfLines={1}>
                      {stat.label}
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" bgGradient={stat.gradient} bgClip="text">
                      {stat.value}
                    </Text>
                  </Box>
                  <Box 
                    p={3} 
                    borderRadius="xl" 
                    bgGradient={stat.gradient}
                    color="white"
                    boxShadow="md"
                    flexShrink={0}
                    ml={3}
                  >
                    <Icon as={stat.icon} boxSize={5} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Controls Section */}
        <Card bg={cardBg} mb={6} borderRadius="2xl" boxShadow="lg">
          <CardBody py={5}>
            <Flex direction={{ base: "column", md: "row" }} gap={4} align="end">
              <Box flex="1">
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  🔍 Search Certificates
                </Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Student name, email, or certificate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="md"
                    borderRadius="xl"
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  />
                </InputGroup>
              </Box>
              
              <Box flex="1">
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  📊 Filter by Status
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                >
                  <option value="all">All Status</option>
                  <option value="issued">Issued</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="correction_requested">Correction Requested</option>
                </Select>
              </Box>
              
              <Box>
                <Button
                  leftIcon={<FaFilter />}
                  colorScheme="purple"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Clear Filters
                </Button>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Certificates Table */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" overflow="hidden">
          <Box 
            bgGradient={headerGradient} 
            px={6} 
            py={4} 
            borderTopRadius="2xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="200px"
              h="200px"
              bg="white"
              opacity="0.1"
              borderRadius="full"
              transform="translate(100px, -100px)"
            />
            <Flex justify="space-between" align="center" position="relative" zIndex={1}>
              <Heading size="lg" color="white" fontWeight="700">
                📋 Certificates for Verification
              </Heading>
              <Badge 
                bg="white" 
                color="purple.600" 
                fontSize="md" 
                px={4} 
                py={2} 
                borderRadius="full" 
                fontWeight="700"
                boxShadow="md"
              >
                {certificates.length} Certificates
              </Badge>
            </Flex>
          </Box>
          
          <Box overflowX="auto" p={6}>
            {certificates.length > 0 ? (
              <Table variant="simple" size="lg" colorScheme="purple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Student Information</Th>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Program Details</Th>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Certificate Info</Th>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Status</Th>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Issue Date</Th>
                    <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {certificates.map((certificate) => {
                    const StatusIcon = getStatusIcon(certificate.status);
                    const statusColor = getStatusColor(certificate.status);
                    
                    return (
                      <Tr 
                        key={certificate.id} 
                        _hover={{ bg: "gray.50", transform: "translateY(-2px)" }} 
                        transition="all 0.3s ease-in-out"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                      >
                        <Td py={5} px={4}>
                          <Flex align="center">
                            <Avatar
                              size="lg"
                              name={certificate.student_name}
                              src={certificate.profile_photo}
                              mr={4}
                              border="3px solid"
                              borderColor={`${statusColor}.300`}
                              boxShadow="lg"
                            />
                            <Box flex="1">
                              <Text fontWeight="bold" fontSize="lg" color="purple.900" mb={1}>
                                {certificate.student_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600" fontWeight="500" mb={1}>
                                {certificate.student_email}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Student ID: {certificate.student_id} • {certificate.college}
                              </Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td py={5} px={4}>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="600" color="gray.800" fontSize="md">
                              {certificate.program_name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Duration: {certificate.duration}
                            </Text>
                            {certificate.domain && (
                              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                Domain: {certificate.domain}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td py={5} px={4}>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color="gray.600" fontWeight="500">
                              Certificate ID: {certificate.certificate_id}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Verification ID: {certificate.verification_id}
                            </Text>
                            {certificate.file_path && (
                              <Badge colorScheme="green" fontSize="xs">
                                PDF Attached
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td py={5} px={4}>
                          <Badge
                            colorScheme={statusColor}
                            display="flex"
                            alignItems="center"
                            px={3}
                            py={2}
                            borderRadius="full"
                            fontSize="md"
                            fontWeight="700"
                            w="fit-content"
                          >
                            <Icon as={StatusIcon} mr={2} boxSize={4} />
                            {certificate.status === 'issued' ? 'ISSUED' : 
                             certificate.status === 'verified' ? 'VERIFIED' : 
                             certificate.status === 'correction_requested' ? 'CORRECTION REQUESTED' : 
                             certificate.status === 'pending_verification' ? 'PENDING VERIFICATION' :
                             certificate.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td py={5} px={4}>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(certificate.issue_date)}
                          </Text>
                        </Td>
                        <Td py={5} px={4}>
                          <HStack spacing={3}>
                            <Tooltip label="View Certificate PDF" hasArrow>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                variant="outline"
                                leftIcon={<FaEye />}
                                onClick={() => viewCertificatePDF(certificate.file_path)}
                                isDisabled={!certificate.file_path}
                                borderRadius="lg"
                                fontWeight="600"
                              >
                                View PDF
                              </Button>
                            </Tooltip>
                            <Tooltip label="View Details" hasArrow>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                variant="outline"
                                leftIcon={<FaEye />}
                                onClick={() => viewCertificateDetails(certificate)}
                                borderRadius="lg"
                                fontWeight="600"
                              >
                                Details
                              </Button>
                            </Tooltip>
                            
                            {(certificate.status === 'issued' || certificate.status === 'pending_verification') && (
                              <>
                                <Tooltip label="Verify Certificate" hasArrow>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<FaCheck />}
                                    onClick={() => openVerifyModal(certificate)}
                                    borderRadius="lg"
                                    fontWeight="600"
                                  >
                                    Verify
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Request Correction" hasArrow>
                                  <Button
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<FaExclamationTriangle />}
                                    onClick={() => openCorrectionModal(certificate)}
                                    borderRadius="lg"
                                    fontWeight="600"
                                  >
                                    Correction
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                            
                            {certificate.status === 'verified' && (
                              <>
                                <Tooltip label="Undo Verification" hasArrow>
                                  <Button
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<FaUndo />}
                                    onClick={() => openVerifyModal(certificate)}
                                    borderRadius="lg"
                                    fontWeight="600"
                                  >
                                    Unverify
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Request Correction" hasArrow>
                                  <Button
                                    size="sm"
                                    colorScheme="orange"
                                    variant="outline"
                                    leftIcon={<FaExclamationTriangle />}
                                    onClick={() => openCorrectionModal(certificate)}
                                    borderRadius="lg"
                                    fontWeight="600"
                                  >
                                    Correction
                                  </Button>
                                </Tooltip>
                              </>
                            )}

                            {certificate.status === 'correction_requested' && (
                              <>
                                <Tooltip label="View Correction Details" hasArrow>
                                  <Button
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<FaInfoCircle />}
                                    onClick={() => viewCorrectionDetails(certificate)}
                                    borderRadius="lg"
                                    fontWeight="600"
                                  >
                                    View Details
                                  </Button>
                                </Tooltip>
                                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                                  Correction Requested
                                </Badge>
                              </>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <Center py={16}>
                <VStack spacing={6}>
                  <Box
                    w={24}
                    h={24}
                    bg="purple.100"
                    borderRadius="2xl"
                    color="purple.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="lg"
                  >
                    <Icon as={FaCertificate} boxSize={10} />
                  </Box>
                  <Text color="gray.500" fontSize="lg" fontWeight="600">No certificates found</Text>
                  <Text color="gray.500" fontSize="md" textAlign="center">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No certificates are currently assigned to you for verification"}
                  </Text>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      colorScheme="purple"
                      size="md"
                      borderRadius="xl"
                      fontWeight="600"
                      leftIcon={<FaSync />}
                    >
                      Show All Certificates
                    </Button>
                  )}
                </VStack>
              </Center>
            )}
          </Box>
        </Card>
      </Container>

      {/* All modals remain the same as in your original code */}
      {/* Certificate Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" fontFamily="'Segoe UI', sans-serif">
          {selectedCertificate && (
            <>
              <ModalHeader 
                bgGradient={headerGradient} 
                color="white" 
                borderTopRadius="2xl" 
                py={6}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="200px"
                  h="200px"
                  bg="white"
                  opacity="0.1"
                  borderRadius="full"
                  transform="translate(100px, -100px)"
                />
                <Flex align="center" position="relative" zIndex={1}>
                  <Avatar
                    size="lg"
                    name={selectedCertificate.student_name}
                    src={selectedCertificate.profile_photo}
                    mr={4}
                    border="3px solid white"
                    boxShadow="lg"
                  />
                  <Box flex="1">
                    <Heading size="lg" fontWeight="700">{selectedCertificate.student_name}</Heading>
                    <Text fontSize="md" opacity={0.9}>
                      {selectedCertificate.program_name} • {selectedCertificate.college}
                    </Text>
                  </Box>
                </Flex>
              </ModalHeader>
              <ModalCloseButton color="white" size="lg" />
              
              <ModalBody p={6}>
                <Flex direction={{ base: "column", md: "row" }} gap={6}>
                  <VStack align="start" spacing={4} flex="1">
                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Certificate Information</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Certificate ID:</strong> {selectedCertificate.certificate_id}</Text>
                        <Text><strong>Verification ID:</strong> {selectedCertificate.verification_id}</Text>
                        <Text><strong>Program:</strong> {selectedCertificate.program_name}</Text>
                        <Text><strong>Duration:</strong> {selectedCertificate.duration}</Text>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Student Information</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Name:</strong> {selectedCertificate.student_name}</Text>
                        <Text><strong>Student ID:</strong> {selectedCertificate.student_id}</Text>
                        <Text><strong>Email:</strong> {selectedCertificate.student_email}</Text>
                        <Text><strong>College:</strong> {selectedCertificate.college}</Text>
                        <Text><strong>Branch:</strong> {selectedCertificate.branch}</Text>
                      </VStack>
                    </Box>
                  </VStack>

                  <VStack align="start" spacing={4} flex="1">
                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Dates</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Issue Date:</strong> {formatDate(selectedCertificate.issue_date)}</Text>
                        {selectedCertificate.verified_at && (
                          <Text><strong>Verified At:</strong> {formatDate(selectedCertificate.verified_at)}</Text>
                        )}
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Status & Verification</Text>
                      <VStack align="start" spacing={2}>
                        <Badge
                          colorScheme={getStatusColor(selectedCertificate.status)}
                          fontSize="md"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {selectedCertificate.status === 'issued' ? 'ISSUED' : 
                           selectedCertificate.status === 'verified' ? 'VERIFIED' : 
                           selectedCertificate.status === 'correction_requested' ? 'CORRECTION REQUESTED' : 
                           selectedCertificate.status === 'pending_verification' ? 'PENDING VERIFICATION' :
                           selectedCertificate.status.toUpperCase()}
                        </Badge>
                        {selectedCertificate.issued_by_name && (
                          <Text><strong>Issued By:</strong> {selectedCertificate.issued_by_name}</Text>
                        )}
                        {selectedCertificate.verified_by_name && (
                          <Text><strong>Verified By:</strong> {selectedCertificate.verified_by_name}</Text>
                        )}
                      </VStack>
                    </Box>

                    {selectedCertificate.domain && (
                      <Box>
                        <Text fontWeight="600" color="gray.600" mb={2}>Domain</Text>
                        <Text>{selectedCertificate.domain}</Text>
                      </Box>
                    )}
                  </VStack>
                </Flex>

                {/* Mentor Information Section */}
                {currentStudentMentor && (
                  <Box mt={6} p={4} bg="blue.50" borderRadius="xl">
                    <Flex align="center" mb={3}>
                      <Icon as={FaUserTie} color="blue.500" boxSize={5} mr={2} />
                      <Text fontWeight="600" color="blue.700" fontSize="lg">
                        Allocated Mentor Information
                      </Text>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Mentor Name:</strong> {currentStudentMentor.name}
                        </Text>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Email:</strong> {currentStudentMentor.email}
                        </Text>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Contact:</strong> {currentStudentMentor.contact_no}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Designation:</strong> {currentStudentMentor.designation}
                        </Text>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Area of Expertise:</strong> {currentStudentMentor.area_of_expertise}
                        </Text>
                        <Text fontSize="sm" color="blue.700">
                          <strong>Experience:</strong> {currentStudentMentor.years_of_experience} years
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                )}

                {selectedCertificate.file_path && (
                  <Box mt={6} p={4} bg="purple.50" borderRadius="xl">
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        <Icon as={FaFilePdf} color="red.500" boxSize={6} mr={3} />
                        <Box>
                          <Text fontWeight="600" color="gray.700">Certificate PDF</Text>
                          <Text fontSize="sm" color="gray.600">
                            File: Internship_Certificate_{selectedCertificate.student_id}.pdf
                          </Text>
                        </Box>
                      </Flex>
                      <Button
                        leftIcon={<FaEye />}
                        colorScheme="purple"
                        onClick={() => window.open(selectedCertificate.file_path, '_blank')}
                      >
                        View PDF
                      </Button>
                    </Flex>
                  </Box>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={onDetailsClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Verify/Unverify Certificate Confirmation Dialog */}
      <AlertDialog
        isOpen={isVerifyOpen}
        leastDestructiveRef={undefined}
        onClose={onVerifyClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader 
              fontSize="lg" 
              fontWeight="bold" 
              bg={selectedCertificate?.status === 'verified' ? "orange.500" : "green.500"} 
              color="white" 
              borderTopRadius="2xl" 
              py={4}
            >
              <Flex align="center">
                <Icon as={selectedCertificate?.status === 'verified' ? FaUndo : FaCheck} mr={3} />
                {selectedCertificate?.status === 'verified' ? 'Undo Verification' : 'Verify Certificate'}
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <VStack spacing={4} align="start">
                <Text fontWeight="600">
                  {selectedCertificate?.status === 'verified' 
                    ? 'Are you sure you want to undo this certificate verification?'
                    : 'Are you sure you want to verify this certificate?'}
                </Text>
                {selectedCertificate && (
                  <Box p={4} bg={selectedCertificate.status === 'verified' ? "orange.50" : "green.50"} borderRadius="xl" w="full">
                    <Text fontSize="sm" color={selectedCertificate.status === 'verified' ? "orange.700" : "green.700"}>
                      <strong>Student:</strong> {selectedCertificate.student_name}
                    </Text>
                    <Text fontSize="sm" color={selectedCertificate.status === 'verified' ? "orange.700" : "green.700"}>
                      <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                    </Text>
                    <Text fontSize="sm" color={selectedCertificate.status === 'verified' ? "orange.700" : "green.700"}>
                      <strong>Program:</strong> {selectedCertificate.program_name}
                    </Text>
                    <Text fontSize="sm" color={selectedCertificate.status === 'verified' ? "orange.700" : "green.700"}>
                      <strong>Duration:</strong> {selectedCertificate.duration}
                    </Text>
                  </Box>
                )}
                <Text fontSize="sm" color="gray.600">
                  {selectedCertificate?.status === 'verified' 
                    ? 'This will change the status back to "Issued" and remove the verification record.'
                    : 'This action will mark the certificate as verified.'}
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button
                  ref={undefined}
                  onClick={onVerifyClose}
                  variant="outline"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme={selectedCertificate?.status === 'verified' ? "orange" : "green"}
                  onClick={handleVerifyCertificate}
                  isLoading={verifying}
                  leftIcon={selectedCertificate?.status === 'verified' ? <FaUndo /> : <FaCheck />}
                  borderRadius="xl"
                >
                  {selectedCertificate?.status === 'verified' ? 'Undo Verification' : 'Verify Certificate'}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Correction Request Modal */}
      <Modal isOpen={isCorrectionOpen} onClose={onCorrectionClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader 
            bgGradient="linear(to-r, orange.500, orange.600)" 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Flex align="center">
              <Icon as={FaExclamationTriangle} mr={3} />
              <Heading size="lg" fontWeight="700">Request Certificate Correction</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6}>
            {selectedCertificate && (
              <VStack spacing={6} align="start">
                <Box p={4} bg="orange.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="orange.700" mb={2}>
                    Certificate Details
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Student:</strong> {selectedCertificate.student_name}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Program:</strong> {selectedCertificate.program_name}
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontWeight="600" color="gray.700">
                    Correction Details
                  </FormLabel>
                  <Textarea
                    value={correctionMessage}
                    onChange={(e) => setCorrectionMessage(e.target.value)}
                    placeholder="Please describe what needs to be corrected in this certificate. Be specific about the issues you've identified..."
                    size="md"
                    borderRadius="xl"
                    rows={6}
                    borderColor="gray.300"
                    _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                  />
                </FormControl>

                <Box p={4} bg="blue.50" borderRadius="xl" w="full">
                  <Text fontSize="sm" color="blue.700" fontWeight="600">
                    💡 Tips for effective correction requests:
                  </Text>
                  <Text fontSize="sm" color="blue.700" mt={2}>
                    • Be specific about incorrect information<br/>
                    • Mention the correct details if known<br/>
                    • Include any supporting evidence<br/>
                    • Explain the impact of the error
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onCorrectionClose}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleSendCorrection}
                isLoading={sendingCorrection}
                leftIcon={<FaExclamationTriangle />}
                borderRadius="xl"
                isDisabled={!correctionMessage.trim()}
              >
                Send Request
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Correction Details Modal */}
      <Modal isOpen={isCorrectionDetailsOpen} onClose={onCorrectionDetailsClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader 
            bgGradient="linear(to-r, orange.500, orange.600)" 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Flex align="center">
              <Icon as={FaInfoCircle} mr={3} />
              <Heading size="lg" fontWeight="700">Correction Request Details</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6}>
            {selectedCertificate && correctionDetails && (
              <VStack spacing={6} align="start">
                <Box p={4} bg="orange.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="orange.700" mb={2}>
                    Certificate Information
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Student:</strong> {selectedCertificate.student_name}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    <strong>Program:</strong> {selectedCertificate.program_name}
                  </Text>
                </Box>

                <Box p={4} bg="blue.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="blue.700" mb={2}>
                    Correction Request Details
                  </Text>
                  <Text fontSize="sm" color="blue.700" mb={3}>
                    <strong>Requested On:</strong> {formatDate(correctionDetails.created_at)}
                  </Text>
                  <Text fontSize="md" color="blue.700" fontWeight="500" mb={2}>
                    Correction Message:
                  </Text>
                  <Text fontSize="sm" color="blue.700" p={3} bg="white" borderRadius="md">
                    {correctionDetails.message}
                  </Text>
                </Box>

                {correctionDetails.admin_notes && (
                  <Box p={4} bg="green.50" borderRadius="xl" w="full">
                    <Text fontWeight="600" color="green.700" mb={2}>
                      Admin Response
                    </Text>
                    <Text fontSize="sm" color="green.700" mb={3}>
                      <strong>Status:</strong> {correctionDetails.status}
                    </Text>
                    {correctionDetails.resolved_at && (
                      <Text fontSize="sm" color="green.700" mb={3}>
                        <strong>Resolved On:</strong> {formatDate(correctionDetails.resolved_at)}
                      </Text>
                    )}
                    <Text fontSize="md" color="green.700" fontWeight="500" mb={2}>
                      Admin Notes:
                    </Text>
                    <Text fontSize="sm" color="green.700" p={3} bg="white" borderRadius="md">
                      {correctionDetails.admin_notes}
                    </Text>
                  </Box>
                )}

                {!correctionDetails.admin_notes && (
                  <Box p={4} bg="yellow.50" borderRadius="xl" w="full">
                    <Text fontSize="sm" color="yellow.700" fontWeight="600">
                      ⏳ Pending Admin Review
                    </Text>
                    <Text fontSize="sm" color="yellow.700" mt={2}>
                      Your correction request has been submitted and is awaiting review by the admin team.
                      You will be notified once the request is processed.
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              {!correctionDetails?.admin_notes && (
                <>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaEdit />}
                    onClick={openEditCorrectionModal}
                    borderRadius="xl"
                  >
                    Edit Request
                  </Button>
                  <Button
                    colorScheme="red"
                    leftIcon={<FaTrash />}
                    onClick={openDeleteCorrectionModal}
                    borderRadius="xl"
                  >
                    Delete Request
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={onCorrectionDetailsClose}
                borderRadius="xl"
              >
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Correction Modal */}
      <Modal isOpen={isEditCorrectionOpen} onClose={onEditCorrectionClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader 
            bgGradient="linear(to-r, blue.500, blue.600)" 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Flex align="center">
              <Icon as={FaEdit} mr={3} />
              <Heading size="lg" fontWeight="700">Edit Correction Request</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6}>
            {selectedCertificate && (
              <VStack spacing={6} align="start">
                <Box p={4} bg="blue.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="blue.700" mb={2}>
                    Certificate Details
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Student:</strong> {selectedCertificate.student_name}
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Program:</strong> {selectedCertificate.program_name}
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontWeight="600" color="gray.700">
                    Correction Details
                  </FormLabel>
                  <Textarea
                    value={updatedCorrectionMessage}
                    onChange={(e) => setUpdatedCorrectionMessage(e.target.value)}
                    placeholder="Please describe what needs to be corrected in this certificate. Be specific about the issues you've identified..."
                    size="md"
                    borderRadius="xl"
                    rows={6}
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onEditCorrectionClose}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleUpdateCorrection}
                isLoading={updatingCorrection}
                leftIcon={<FaCheck />}
                borderRadius="xl"
                isDisabled={!updatedCorrectionMessage.trim()}
              >
                Update Request
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Correction Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteCorrectionOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteCorrectionClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader 
              fontSize="lg" 
              fontWeight="bold" 
              bg="red.500" 
              color="white" 
              borderTopRadius="2xl" 
              py={4}
            >
              <Flex align="center">
                <Icon as={FaTrash} mr={3} />
                Delete Correction Request
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <VStack spacing={4} align="start">
                <Text fontWeight="600">
                  Are you sure you want to delete this correction request?
                </Text>
                {selectedCertificate && (
                  <Box p={4} bg="red.50" borderRadius="xl" w="full">
                    <Text fontSize="sm" color="red.700">
                      <strong>Student:</strong> {selectedCertificate.student_name}
                    </Text>
                    <Text fontSize="sm" color="red.700">
                      <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                    </Text>
                    <Text fontSize="sm" color="red.700">
                      <strong>Program:</strong> {selectedCertificate.program_name}
                    </Text>
                  </Box>
                )}
                <Text fontSize="sm" color="gray.600">
                  This action cannot be undone. The correction request will be permanently deleted,
                  and the certificate status will be changed back to &quot;Issued&quot;.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button
                  ref={undefined}
                  onClick={onDeleteCorrectionClose}
                  variant="outline"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteCorrection}
                  leftIcon={<FaTrash />}
                  borderRadius="xl"
                >
                  Delete Request
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}