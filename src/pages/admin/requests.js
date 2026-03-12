// pages/admin/requests.js
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Link,
  Select,
  Spinner,
  Flex,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useToast,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Tag,
  TagLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Wrap,
  WrapItem,
  VStack,
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import { 
  FiSearch, 
  FiFilter, 
  FiMail, 
  FiDownload,
  FiMoreVertical,
  FiEdit,
  FiUser,
  FiCalendar,
  FiBook,
  FiAward,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiDatabase,
  FiClock,
  FiUsers,
  FiArrowLeft,
  FiSave,
  FiEye,
} from "react-icons/fi";
import { FaClipboardCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { keyframes } from "@emotion/react";

const MotionBox = motion(Box);
const MotionTr = motion(Tr);
const MotionCard = motion(Card);

// Pulse animation for loading state
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

export default function InternshipRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tempMentor, setTempMentor] = useState(""); // Temporary mentor selection
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isClient, setIsClient] = useState(false);
  const [mentorAssignments, setMentorAssignments] = useState({}); // Track mentor assignments per application

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const iconColor = useColorModeValue("gray.300", "gray.600");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const subtleBg = useColorModeValue("gray.50", "gray.900");
  const gradientBg = "linear(to-r, blue.500, blue.600)";
  const accentColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    setIsClient(true);
    
    // Disable browser navigation only on client side
    if (typeof window !== 'undefined') {
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function() {
        window.history.go(1);
      };
      
      const disableRefresh = (e) => {
        if ((e.which || e.keyCode) === 116 || (e.ctrlKey && (e.which || e.keyCode) === 82)) {
          e.preventDefault();
        }
      };
      
      document.addEventListener("keydown", disableRefresh);
      
      return () => {
        document.removeEventListener("keydown", disableRefresh);
      };
    }
  }, []);

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const fetchApplications = useCallback(async () => {
    try {
      // Add 2-second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch("/api/getApplications");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch applications");
      }
      const data = await res.json();
      
      // Format dates for display
      const formattedData = data.map(app => ({
        ...app,
        start_date: formatDateForDisplay(app.start_date),
        end_date: formatDateForDisplay(app.end_date)
      }));
      
      setRequests(formattedData);
      setError(null);
    } catch (err) {
      console.error("⚠️ Fetch error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
    
    // Show toast notification for refresh start
    toast({
      title: "🔄 Refreshing Data",
      description: "Fetching the latest applications...",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
    
    // Add this code to show validation toast after refresh is done
    // This will be triggered when the fetchApplications completes
    const checkRefreshCompletion = () => {
      if (!refreshing) {
        // Show success toast when refresh is complete
        toast({
          title: "✅ Refresh Complete",
          description: "Applications data has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        // Check again after a short delay
        setTimeout(checkRefreshCompletion, 100);
      }
    };
    
    // Start checking for refresh completion
    setTimeout(checkRefreshCompletion, 500);
  };

  // Filter requests based on search term and status filter (exclude completed)
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" 
      ? request.status !== "completed" // Exclude completed when showing "all"
      : request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get completed internships (status = "completed")
  const completedInternships = requests.filter(request => request.status === "completed");

  // Get mentors from API (actual signed-up mentors)
  const [mentors, setMentors] = useState([]);

  const fetchMentors = useCallback(async () => {
    try {
      const res = await fetch("/api/mentors");
      if (!res.ok) throw new Error("Failed to fetch mentors");
      const data = await res.json();
      setMentors(data); // Store full mentor objects
    } catch (err) {
      console.error("Mentor fetch error:", err.message);
      setMentors([]);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // ✅ Update status or mentor (merged logic)
  const updateApplication = async (applicationId, fields) => {
    const originalRequests = [...requests];
    
    try {
      const res = await fetch("/api/updateApplicationStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          status: fields.status,
          mentor: fields.mentor || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update application");
      }

      const updatedRow = await res.json();

      // Format dates for display
      updatedRow.start_date = formatDateForDisplay(updatedRow.start_date);
      updatedRow.end_date = formatDateForDisplay(updatedRow.end_date);

      // Update local state
      setRequests((prev) => {
        return prev.map(req => 
          req.application_id === applicationId ? updatedRow : req
        );
      });
      
      // Clear any pending mentor assignment for this application
      setMentorAssignments(prev => {
        const newAssignments = {...prev};
        delete newAssignments[applicationId];
        return newAssignments;
      });
      
      toast({
        title: "🎉 Application Updated Successfully!",
        description: "The student application has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "left-accent",
      });
      
      return true;
    } catch (err) {
      console.error("❌ Update error:", err.message);
      setRequests(originalRequests);
      toast({
        title: "😞 Update Failed",
        description: "Failed to update application. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setTempMentor(request.mentor || ""); // Set temporary mentor value
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "green";
      case "rejected": return "red";
      case "pending": return "yellow";
      case "completed": return "purple";
      default: return "gray";
    }
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = "Name,Email,Contact,College,Branch,Year,CGPA,Area of Interest,Duration,Start Date,End Date,Status,Mentor\n";
    const csvContent = filteredRequests.map(req => 
      `"${req.full_name}","${req.email}","${req.contact}","${req.college}","${req.branch}","${req.year_of_study}","${req.cgpa}","${req.areas_of_interest || ''}","${req.duration_months} months","${req.start_date}","${req.end_date}","${req.status}","${req.mentor || ''}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `internship_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download resume function
  const downloadResume = async (resumeUrl, applicantName) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.setAttribute('download', `${applicantName}_Resume.pdf`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "📥 Download Started",
        description: "Resume download has started",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "❌ Download Failed",
        description: "Could not download the resume",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Send email function with status-specific content
  const sendEmail = (email, status, applicantName) => {
    let subject = "";
    let body = "";
    
    if (status === "accepted") {
      subject = `Congratulations! Your Internship Application Has Been Accepted by Infotech Corporation of Goa Ltd.`;
      body = `Dear ${applicantName},\n\nWe are delighted to inform you that your application for the internship program at Infotech Corporation of Goa Limited has been successfully accepted.\n\nThis internship is designed to provide you with extensive, hands-on exposure to real-world projects, enabling you to apply your academic knowledge to practical scenarios. You will work closely with experienced mentors and professionals from various departments, gaining insights into our operations, processes, and innovative initiatives.\n\nOur Human Resources department will contact you shortly with:\n• Detailed onboarding instructions\n• Required documentation checklist\n• Orientation schedule and reporting location\n• Your internship start date and assigned department\n\nWe are confident that your skills, dedication, and enthusiasm will make a valuable contribution to our organization. We are equally committed to providing you with opportunities to develop your technical expertise, teamwork skills, and industry knowledge during your time with us.\n\nWelcome to Infotech Corporation of Goa Limited. We look forward to supporting you throughout this exciting journey.\n\nWarm regards,\nHR Department\nInfotech Corporation of Goa Limited\n\nThis communication is officially sent to you by Infotech Corporation of Goa Limited.`;
    } else if (status === "rejected") {
      subject = `Update on Your Internship Application with Infotech Corporation of Goa Ltd.`;
      body = `Dear ${applicantName},\n\nThank you sincerely for applying to the internship program at Infotech Corporation of Goa Limited. After a thorough and careful review of your application and credentials, we regret to inform you that we are unable to extend an internship offer to you at this time.\n\nPlease be assured that your application received full and fair consideration. We truly appreciate the time, effort, and interest you have shown in our organization. Although we could not offer you a position in this cycle, we encourage you to continue enhancing your skills and to consider reapplying for future internship or employment opportunities with us.\n\nWe wish you the very best in your academic endeavors and career aspirations and hope to cross paths again in the future.\n\nWarm regards,\nHR Department\nInfotech Corporation of Goa Limited\n\nThis communication is officially sent to you by Infotech Corporation of Goa Limited.`;
    } else {
      subject = `Status Update on Your Internship Application with Infotech Corporation of Goa Ltd.`;
      body = `Dear ${applicantName},\n\nThank you for submitting your application for the internship program at Infotech Corporation of Goa Limited. We have successfully received your details and your application is currently under review by our selection committee.\n\nOur evaluation process involves a careful assessment of academic achievements, skills, and alignment with the objectives of our internship program. This process may take some time to ensure fairness and transparency.\n\nWe will notify you promptly once a decision has been reached or if any further information or documents are required from your side. We appreciate your patience and your interest in joining our organization.\n\nWarm regards,\nHR Department\nInfotech Corporation of Goa Limited\n\nThis communication is officially sent to you by Infotech Corporation of Goa Limited.`;
    }
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  // View student profile function - fetches from student_profiles table
  const viewStudentProfile = async (applicationId) => {
    try {
      // Find the application by ID
      const application = requests.find(req => req.application_id === applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // First, try to fetch student profile from the database using email
      try {
        const res = await fetch(`/api/getStudentProfile?email=${encodeURIComponent(application.email)}`);
        
        if (res.ok) {
          const studentProfile = await res.json();
          
          // Navigate to student profile page with the profile data
          router.push({
            pathname: `/admin/students/${studentProfile.id || studentProfile.profile_id || application.application_id}`,
            query: { profile: JSON.stringify(studentProfile) }
          });
          return;
        }
        
        // If we get a 404, the profile doesn't exist yet
        if (res.status === 404) {
          throw new Error('Profile not found');
        }
        
        // For other errors, throw the error
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch student profile');
        
      } catch (apiError) {
        // If API call fails or profile not found, navigate to basic profile
        console.log('Profile not found, using basic profile:', apiError.message);
        
        toast({
          title: "⚠️ Profile Not Found",
          description: "No detailed profile found for this student",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        
        router.push({
          pathname: `/admin/students/${application.application_id}`,
          query: { 
            basic: true,
            name: application.full_name,
            email: application.email,
            contact: application.contact,
            college: application.college,
            branch: application.branch,
            year: application.year_of_study,
            cgpa: application.cgpa
          }
        });
      }
      
    } catch (error) {
      console.error("Error in viewStudentProfile:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load student profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate statistics
  const totalRequests = requests.length;
  const acceptedRequests = requests.filter(req => req.status === "accepted").length;
  const pendingRequests = requests.filter(req => req.status === "pending").length;
  const rejectedRequests = requests.filter(req => req.status === "rejected").length;
  const completedRequests = completedInternships.length;
  const acceptanceRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0;

  // Handle mentor selection change
  const handleMentorChange = (applicationId, mentorId) => {
    setMentorAssignments(prev => ({
      ...prev,
      [applicationId]: mentorId
    }));
  };

  // Confirm mentor assignment
  const confirmMentorAssignment = async (applicationId) => {
    const mentorId = mentorAssignments[applicationId];
    if (!mentorId) {
      toast({
        title: "⚠️ No Mentor Selected",
        description: "Please select a mentor first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const success = await updateApplication(applicationId, { mentor: mentorId });
    if (success) {
      // Clear the assignment from state
      setMentorAssignments(prev => {
        const newAssignments = {...prev};
        delete newAssignments[applicationId];
        return newAssignments;
      });
    }
  };

  // Get mentor name by ID
  const getMentorName = (mentorId) => {
    if (!mentorId) return "Not assigned";
    const mentor = mentors.find(m => m.id === mentorId);
    return mentor ? mentor.name : "Unknown mentor";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Function to handle mentor change button click
  const handleMentorChangeClick = (applicationId, currentMentor) => {
    setMentorAssignments(prev => ({
      ...prev,
      [applicationId]: currentMentor || ""
    }));
  };

  // Function to cancel mentor assignment
  const cancelMentorAssignment = (applicationId) => {
    setMentorAssignments(prev => {
      const newAssignments = {...prev};
      delete newAssignments[applicationId];
      return newAssignments;
    });
  };

  // Loading state
  if (loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient={gradientBg}
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <FaClipboardCheck size={40} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color={accentColor} />
          <Text fontWeight="medium" fontSize="lg" color="black">
            Loading Internship Applications...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6} fontFamily="'Segoe UI', sans-serif">
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="outline" 
          colorScheme="blue" 
          onClick={() => router.push("/admin/dashboard")}
          size="sm"
        >
          Back to Dashboard
        </Button>

        <HStack spacing={4}>
          <Button 
            colorScheme="blue" 
            variant="outline" 
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<FiRefreshCw />}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Heading size="xl" color="blue.700" textAlign="center" mb={2} bgGradient="linear(to-r, blue.600, blue.800)" bgClip="text">
        Internship Applications Hub
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Manage and review internship applications with precision
      </Text>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <MotionCard 
          bg={cardBg} 
          shadow="lg" 
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          borderLeft="4px"
          borderColor="blue.400"
          borderRadius="xl"
          overflow="hidden"
        >
          <CardBody>
            <Flex align="center">
              <Center mr={4} w={12} h={12} bg="blue.100" borderRadius="full">
                <FiUsers size={24} color="#3182CE" />
              </Center>
              <Box>
                <Stat>
                  <StatLabel color="gray.600" fontWeight="medium">Total Requests</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.700">{totalRequests}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {requests.filter(req => new Date(req.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
                  </StatHelpText>
                </Stat>
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard 
          bg={cardBg} 
          shadow="lg" 
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          borderLeft="4px"
          borderColor="green.400"
          borderRadius="xl"
          overflow="hidden"
        >
          <CardBody>
            <Flex align="center">
              <Center mr={4} w={12} h={12} bg="green.100" borderRadius="full">
                <FiCheckCircle size={24} color="#38A169" />
              </Center>
              <Box>
                <Stat>
                  <StatLabel color="gray.600" fontWeight="medium">Accepted</StatLabel>
                  <StatNumber fontSize="2xl" color="green.700">{acceptedRequests}</StatNumber>
                  <StatHelpText>
                    {acceptanceRate}% acceptance rate
                  </StatHelpText>
                </Stat>
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard 
          bg={cardBg} 
          shadow="lg" 
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          borderLeft="4px"
          borderColor="yellow.400"
          borderRadius="xl"
          overflow="hidden"
        >
          <CardBody>
            <Flex align="center">
              <Center mr={4} w={12} h={12} bg="yellow.100" borderRadius="full">
                <FiClock size={24} color="#D69E2E" />
              </Center>
              <Box>
                <Stat>
                  <StatLabel color="gray.600" fontWeight="medium">Pending Review</StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.700">{pendingRequests}</StatNumber>
                  <StatHelpText>
                    Needs attention
                  </StatHelpText>
                </Stat>
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>

        <MotionCard 
          bg={cardBg} 
          shadow="lg" 
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          borderLeft="4px"
          borderColor="red.400"
          borderRadius="xl"
          overflow="hidden"
        >
          <CardBody>
            <Flex align="center">
              <Center mr={4} w={12} h={12} bg="red.100" borderRadius="full">
                <FiXCircle size={24} color="#E53E3E" />
              </Center>
              <Box>
                <Stat>
                  <StatLabel color="gray.600" fontWeight="medium">Rejected</StatLabel>
                  <StatNumber fontSize="2xl" color="red.700">{rejectedRequests}</StatNumber>
                  <StatHelpText>
                    {totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0}% of total
                  </StatHelpText>
                </Stat>
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* Filters and Actions */}
      <Card bg={cardBg} shadow="xl" mb={6} overflow="hidden" border="1px" borderColor={borderColor} borderRadius="2xl">
        <CardHeader pb={3} bg={tableHeaderBg} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Heading size="md" color="blue.800">Applications Management</Heading>
            
            <HStack flexWrap="nowrap" spacing={3}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search applications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="white"
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                />
              </InputGroup>
              
              <Select 
                placeholder="Filter by status" 
                w="200px" 
                icon={<FiFilter />}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                bg="white"
                borderRadius="md"
                borderColor="gray.300"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Select>
              
              <Button 
                colorScheme="blue" 
                leftIcon={<FiDownload />}
                onClick={exportToCSV}
                variant="solid"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)" }}
                borderRadius="md"
              >
                Export CSV
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        
        <CardBody p={0}>
          {error ? (
            <Center py={10} flexDirection="column">
              <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" maxW="500px" mx="auto" borderRadius="lg">
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Failed to load applications
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  {error}. Please try refreshing the page.
                </AlertDescription>
                <Button colorScheme="red" variant="solid" mt={4} onClick={handleRefresh} borderRadius="md">
                  Try Again
                </Button>
              </Alert>
            </Center>
          ) : filteredRequests.length === 0 ? (
            <Center py={10} flexDirection="column">
              <FiDatabase size={48} color={iconColor} />
              <Text mt={4} fontSize="lg" color="gray.500" fontWeight="medium">
                No applications found
                </Text>
              <Text color="gray.500" textAlign="center" maxW="md" mt={2}>
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "There are no internship applications at this time."}
              </Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Applicant</Th>
                    <Th>College & Course</Th>
                    <Th>Duration</Th>
                    <Th>Interest</Th>
                    <Th>Status</Th>
                    <Th>Mentor</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {filteredRequests.map((req, idx) => (
                      <MotionTr 
                        key={req.application_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        _hover={{ bg: hoverBg }}
                      >
                        <Td>
                          <Flex align="center">
                            <Avatar name={req.full_name} size="sm" mr={3} bg="blue.500" color="white" />
                            <Box>
                              <Text fontWeight="medium">{req.full_name}</Text>
                              <Text fontSize="sm" color="gray.600">{req.email}</Text>
                              <Text fontSize="xs" color="gray.500">{req.contact}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>
                          <Box>
                            <Text fontWeight="medium" isTruncated maxW="200px">{req.college}</Text>
                            <Text fontSize="sm">{req.branch}, Year {req.year_of_study}</Text>
                            <Badge colorScheme="purple" fontSize="xs" borderRadius="full" px={2}>CGPA: {req.cgpa}</Badge>
                          </Box>
                        </Td>
                        <Td>
                          <Box>
                            <Badge colorScheme="blue" fontSize="sm" borderRadius="full" px={2}>{req.duration_months} months</Badge>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {req.start_date} to {req.end_date}
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1} maxW="200px">
                            {req.areas_of_interest && (
                              <Tooltip 
                                label={req.areas_of_interest} 
                                placement="top" 
                                hasArrow 
                                bg="blue.600"
                                color="white"
                                borderRadius="md"
                                p={3}
                              >
                                <Tag size="sm" colorScheme="blue" borderRadius="full" cursor="pointer">
                                  <TagLabel isTruncated maxW="150px">
                                    {req.areas_of_interest}
                                  </TagLabel>
                                </Tag>
                              </Tooltip>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={getStatusColor(req.status)} 
                            fontSize="sm" 
                            p={2} 
                            borderRadius="md"
                            variant="subtle"
                            textTransform="uppercase"
                            fontWeight="bold"
                          >
                            {req.status}
                          </Badge>
                        </Td>
                        <Td>
                          {mentorAssignments[req.application_id] !== undefined ? (
                            <Box>
                              <Select
                                placeholder="Select mentor"
                                value={mentorAssignments[req.application_id] || ""}
                                onChange={(e) => handleMentorChange(req.application_id, e.target.value)}
                                size="sm"
                                minW="150px"
                                bg="white"
                                borderRadius="md"
                                mb={2}
                              >
                                {mentors.length === 0 ? (
                                  <option value="" disabled>No mentors available</option>
                                ) : (
                                  mentors.map((mentor) => (
                                    <option key={mentor.id} value={mentor.id}>
                                      {mentor.name}
                                    </option>
                                  ))
                                )}
                              </Select>
                              <HStack spacing={1} mt={1}>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => confirmMentorAssignment(req.application_id)}
                                  leftIcon={<FiCheckCircle />}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="gray"
                                  variant="outline"
                                  onClick={() => cancelMentorAssignment(req.application_id)}
                                >
                                  Cancel
                                </Button>
                              </HStack>
                            </Box>
                          ) : req.mentor ? (
                            <Box>
                              <Text fontWeight="medium">{getMentorName(req.mentor)}</Text>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                mt={1}
                                onClick={() => handleMentorChangeClick(req.application_id, req.mentor)}
                                leftIcon={<FiEdit />}
                              >
                                Change
                              </Button>
                            </Box>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleMentorChangeClick(req.application_id, "")}
                              leftIcon={<FiUser />}
                            >
                              Assign Mentor
                            </Button>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {req.status === "pending" ? (
                              <>
                                <Button
                                  colorScheme="green"
                                  size="sm"
                                  onClick={() => updateApplication(req.application_id, { status: "accepted" })}
                                  leftIcon={<FiCheckCircle />}
                                  bgGradient="linear(to-r, green.400, green.600)"
                                  _hover={{ bgGradient: "linear(to-r, green.500, green.700)" }}
                                  borderRadius="md"
                                >
                                  Accept
                                </Button>
                                <Button
                                  colorScheme="red"
                                  size="sm"
                                  onClick={() => updateApplication(req.application_id, { status: "rejected" })}
                                  leftIcon={<FiXCircle />}
                                  variant="outline"
                                  borderColor="red.400"
                                  _hover={{ bg: "red.50" }}
                                  borderRadius="md"
                                >
                                  Reject
                                </Button>
                              </>
                            ) : req.status === "accepted" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateApplication(req.application_id, { status: "pending" })}
                                color="gray.600"
                                _hover={{ bg: "gray.100" }}
                                borderRadius="md"
                              >
                                Revert
                              </Button>
                            ) : req.status === "rejected" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateApplication(req.application_id, { status: "pending" })}
                                color="gray.600"
                                _hover={{ bg: "gray.100" }}
                                borderRadius="md"
                              >
                                Revert
                              </Button>
                            ) : null}
                            
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => openDetailsModal(req)}
                              variant="outline"
                              colorScheme="blue"
                              borderColor="blue.400"
                              _hover={{ bg: "blue.50" }}
                              borderRadius="md"
                            >
                              Details
                            </Button>
                            
                            <Menu isLazy placement="left-start">
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                                color="gray.600"
                                _hover={{ bg: "gray.100" }}
                                borderRadius="md"
                              />
                              <MenuList zIndex={9999} minWidth="200px" borderRadius="md">
                                <MenuItem 
                                  icon={<FiMail />}
                                  onClick={() => sendEmail(req.email, req.status, req.full_name)}
                                  _focus={{ bg: "blue.50" }}
                                >
                                  Send Email
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiUser />}
                                  onClick={() => viewStudentProfile(req.application_id)}
                                  _focus={{ bg: "blue.50" }}
                                >
                                  View Full Profile
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiDownload />}
                                  onClick={() => downloadResume(req.resume_url, req.full_name)}
                                  _focus={{ bg: "blue.50" }}
                                >
                                  Download Resume
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </MotionTr>
                    ))}
                  </AnimatePresence>
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Completed Internships Section */}
      {completedInternships.length > 0 && (
        <Card bg={cardBg} shadow="xl" mb={6} overflow="hidden" border="1px" borderColor={borderColor} borderRadius="2xl">
          <CardHeader pb={3} bg="purple.50" borderBottom="1px" borderColor={borderColor}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <Heading size="md" color="purple.800">Completed Internships</Heading>
              <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
                {completedRequests} Completed
              </Badge>
            </Flex>
          </CardHeader>
          
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="purple.50">
                  <Tr>
                    <Th>Applicant</Th>
                    <Th>College & Course</Th>
                    <Th>Duration</Th>
                    <Th>Interest</Th>
                    <Th>Mentor</Th>
                    <Th>Completion Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {completedInternships.map((req, idx) => (
                      <MotionTr 
                        key={req.application_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        _hover={{ bg: "purple.50" }}
                      >
                        <Td>
                          <Flex align="center">
                            <Avatar name={req.full_name} size="sm" mr={3} bg="purple.500" color="white" />
                            <Box>
                              <Text fontWeight="medium">{req.full_name}</Text>
                              <Text fontSize="sm" color="gray.600">{req.email}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>
                          <Box>
                            <Text fontWeight="medium" isTruncated maxW="200px">{req.college}</Text>
                            <Text fontSize="sm">{req.branch}, Year {req.year_of_study}</Text>
                          </Box>
                        </Td>
                        <Td>
                          <Box>
                            <Badge colorScheme="purple" fontSize="sm" borderRadius="full" px={2}>
                              {req.duration_months} months
                            </Badge>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {req.start_date} to {req.end_date}
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1} maxW="200px">
                            {req.areas_of_interest && (
                              <Tooltip 
                                label={req.areas_of_interest} 
                                placement="top" 
                                hasArrow 
                                bg="purple.600"
                                color="white"
                                borderRadius="md"
                                p={3}
                              >
                                <Tag size="sm" colorScheme="purple" borderRadius="full" cursor="pointer">
                                  <TagLabel isTruncated maxW="150px">
                                    {req.areas_of_interest}
                                  </TagLabel>
                                </Tag>
                              </Tooltip>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="medium">{getMentorName(req.mentor)}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {req.end_date}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => openDetailsModal(req)}
                              variant="outline"
                              colorScheme="purple"
                              borderColor="purple.400"
                              _hover={{ bg: "purple.50" }}
                              borderRadius="md"
                            >
                              Details
                            </Button>
                            
                            <Menu isLazy placement="left-start">
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                                color="gray.600"
                                _hover={{ bg: "gray.100" }}
                                borderRadius="md"
                              />
                              <MenuList zIndex={9999} minWidth="200px" borderRadius="md">
                                <MenuItem 
                                  icon={<FiUser />}
                                  onClick={() => viewStudentProfile(req.application_id)}
                                  _focus={{ bg: "purple.50" }}
                                >
                                  View Full Profile
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiDownload />}
                                  onClick={() => downloadResume(req.resume_url, req.full_name)}
                                  _focus={{ bg: "purple.50" }}
                                >
                                  Download Resume
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </MotionTr>
                    ))}
                  </AnimatePresence>
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Application Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent fontFamily="'Segoe UI', sans-serif" borderRadius="2xl" overflow="hidden">
          <ModalHeader bg={tableHeaderBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <Flex align="center">
              <Avatar name={selectedRequest?.full_name} mr={3} size="md" bg="blue.500" color="white" />
              <Box>
                <Heading size="md">{selectedRequest?.full_name}</Heading>
                <Text color="gray.600">{selectedRequest?.email}</Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={6}>
            {selectedRequest && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Heading size="sm" mb={4} color="gray.700" display="flex" alignItems="center">
                    <Box as="span" bg="blue.100" p={1} borderRadius="md" mr={2}>
                      <FiUser size={16} color="#3182CE" />
                    </Box>
                    Personal Information
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Contact</Text>
                      <Text>{selectedRequest.contact}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">College</Text>
                      <Text>{selectedRequest.college}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Branch</Text>
                      <Text>{selectedRequest.branch}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Year</Text>
                      <Text>Year {selectedRequest.year_of_study}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">CGPA</Text>
                      <Text>{selectedRequest.cgpa}</Text>
                    </Box>
                  </Grid>
                </Box>

                <Box>
                  <Heading size="sm" mb={4} color="gray.700" display="flex" alignItems="center">
                    <Box as="span" bg="blue.100" p={1} borderRadius="md" mr={2}>
                      <FiCalendar size={16} color="#3182CE" />
                    </Box>
                    Internship Details
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Duration</Text>
                      <Text>{selectedRequest.duration_months} months</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Start Date</Text>
                      <Text>{selectedRequest.start_date}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">End Date</Text>
                      <Text>{selectedRequest.end_date}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                      <Badge colorScheme={getStatusColor(selectedRequest.status)} fontSize="sm" p={1} borderRadius="md">
                        {selectedRequest.status.toUpperCase()}
                      </Badge>
                    </Box>
                    <Box gridColumn="span 2">
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>Assigned Mentor</Text>
                      {selectedRequest.mentor ? (
                        <Box>
                          <Text fontWeight="medium" color="blue.700">{getMentorName(selectedRequest.mentor)}</Text>
                          <Text fontSize="sm" color="gray.600">Currently assigned</Text>
                        </Box>
                      ) : (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>No mentor assigned yet</Text>
                          <Select
                            value={tempMentor}
                            onChange={(e) => setTempMentor(e.target.value)}
                            size="sm"
                            placeholder="Select a mentor"
                          >
                            {mentors.map((mentor) => (
                              <option key={mentor.id} value={mentor.id}>
                                {mentor.name}
                              </option>
                            ))}
                          </Select>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Box mt={6}>
                    <Heading size="sm" mb={2} color="gray.700" display="flex" alignItems="center">
                      <Box as="span" bg="blue.100" p={1} borderRadius="md" mr={2}>
                        <FiAward size={16} color="#3182CE" />
                      </Box>
                      Area of Interest
                    </Heading>
                    <Text color="gray.700" fontSize="md">
                      {selectedRequest.areas_of_interest}
                    </Text>
                  </Box>

                  <Box mt={6}>
                    <Heading size="sm" mb={2} color="gray.700" display="flex" alignItems="center">
                      <Box as="span" bg="blue.100" p={1} borderRadius="md" mr={2}>
                        <FiBook size={16} color="#3182CE" />
                      </Box>
                      Resume
                    </Heading>
                    <HStack spacing={3}>
                      <Button 
                        as={Link} 
                        href={selectedRequest.resume_url} 
                        colorScheme="blue" 
                        variant="outline" 
                        leftIcon={<FiExternalLink />}
                        isExternal
                        borderRadius="md"
                        _hover={{ textDecoration: "none" }} // Remove underline on hover
                      >
                        View Resume
                      </Button>
                      <Button 
                        colorScheme="green" 
                        variant="outline" 
                        leftIcon={<FiDownload />}
                        onClick={() => downloadResume(selectedRequest.resume_url, selectedRequest.full_name)}
                        borderRadius="md"
                      >
                        Download
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              </SimpleGrid>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={borderColor} py={4}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="md">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Footer Stats */}
      {isClient && (
        <Flex justify="space-between" align="center" mt={8} color="gray.600" fontSize="sm">
          <Text>
            Showing {filteredRequests.length} of {requests.length} applications
            {completedInternships.length > 0 && ` (${completedInternships.length} completed)`}
          </Text>
          <Text>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </Flex>
      )}
    </Box>
  );
}