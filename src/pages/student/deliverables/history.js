import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Card,
  CardBody,
  Flex,
  Icon,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Container,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Collapse,
  AspectRatio,
  Grid,
  GridItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { 
  FaArrowLeft, 
  FaEye, 
  FaDownload,
  FaCalendarDay,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaFileUpload,
  FaHistory
} from "react-icons/fa";

export default function DeliverablesHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [filteredDeliverables, setFilteredDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    sortBy: "date-desc",
    search: ""
  });
  const [stats, setStats] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
    reviewed: 0,
    total: 0
  });

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const headerGradient = useColorModeValue("linear(to-r, blue.500, purple.500)", "linear(to-r, blue.300, purple.300)");
  const statCardBg = useColorModeValue("white", "gray.750");
  const filterCardBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.100", "blue.800");
  const tableHeaderBg = useColorModeValue("blue.500", "blue.600");
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Wrap fetchDeliverables in useCallback to prevent unnecessary re-renders
  const fetchDeliverables = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deliverables?user_id=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch deliverables');
      }
      
      const data = await response.json();
      setDeliverables(data);
      setFilteredDeliverables(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load submission history. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const calculateStats = (data) => {
    const approved = data.filter(item => item.status === "approved").length;
    const rejected = data.filter(item => item.status === "rejected").length;
    const pending = data.filter(item => !item.status || item.status === "submitted").length;
    const reviewed = data.filter(item => item.status === "reviewed").length;
    const total = data.length;
    
    setStats({
      approved,
      rejected,
      pending,
      reviewed,
      total
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser.user_id || parsedUser.id || parsedUser.userId;
          
          if (userId) {
            setUser({ ...parsedUser, user_id: userId });
            await fetchDeliverables(userId);
          } else {
            console.error('No user ID found in user data');
            toast({
              title: "Error",
              description: "User data is incomplete. Please login again.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, toast, fetchDeliverables]); // Added fetchDeliverables to dependencies

  useEffect(() => {
    let filtered = [...deliverables];

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        (item.submission_id && item.submission_id.toLowerCase().includes(searchTerm)) ||
        (item.remarks && item.remarks.toLowerCase().includes(searchTerm)) ||
        (item.feedback && item.feedback.toLowerCase().includes(searchTerm)) ||
        (item.status && item.status.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    switch(filters.sortBy) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.submission_date) - new Date(b.submission_date));
        break;
      case "date-desc":
        filtered.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
        break;
      case "status":
        filtered.sort((a, b) => {
          const statusOrder = { "approved": 1, "reviewed": 2, "submitted": 3, "rejected": 4 };
          return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
        });
        break;
      default:
        break;
    }

    setFilteredDeliverables(filtered);
    calculateStats(filtered);
  }, [filters, deliverables]);

  const viewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    onOpen();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Icon as={FaCheckCircle} color="green.500" />;
      case 'rejected':
        return <Icon as={FaTimesCircle} color="red.500" />;
      case 'reviewed':
        return <Icon as={FaExclamationTriangle} color="orange.500" />;
      default:
        return <Icon as={FaClock} color="blue.500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return "green";
      case 'rejected':
        return "red";
      case 'reviewed':
        return "orange";
      default:
        return "blue";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Loading submission history...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} py={8} fontFamily="'Segoe UI', sans-serif">
      <Container maxW="6xl">
        {/* Header with decorative elements */}
        <Box position="relative" mb={8}>
          <AspectRatio ratio={16 / 3} maxH="160px">
            <Box
              bgGradient={headerGradient}
              borderRadius="2xl"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-50px"
                right="-50px"
                w="200px"
                h="200px"
                borderRadius="full"
                bg="whiteAlpha.200"
              />
              <Box
                position="absolute"
                bottom="-30px"
                left="-30px"
                w="150px"
                h="150px"
                borderRadius="full"
                bg="whiteAlpha.200"
              />
              <Flex 
                position="absolute" 
                inset={0} 
                align="center" 
                justify="center"
                direction="column"
                px={8}
                color="white"
                textAlign="center"
              >
                <HStack spacing={3}>
                  <Icon as={FaFileUpload} boxSize={8} />
                  <Heading size="xl" fontFamily="'Segoe UI', sans-serif">
                    Deliverables History
                  </Heading>
                </HStack>
                <Text mt={2} fontSize="lg" opacity={0.9} fontFamily="'Segoe UI', sans-serif">
                  Track and manage your submission history
                </Text>
              </Flex>
            </Box>
          </AspectRatio>
          
          <Button 
            position="absolute"
            left={4}
            top={4}
            colorScheme="whiteAlpha" 
            variant="solid" 
            onClick={() => router.push("/student/deliverables")}
            leftIcon={<FaArrowLeft />}
            fontFamily="'Segoe UI', sans-serif"
            borderRadius="full"
            size={isMobile ? "sm" : "md"}
          >
            Back to Submission
          </Button>
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
            </Box>
            <VStack>
              <Badge 
                colorScheme="green" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                minH="28px"
                display="flex"
                alignItems="center"
              >
                <HStack spacing={1}>
                  <Icon as={FaCheckCircle} boxSize={3} />
                  <Text fontFamily="'Segoe UI', sans-serif">Approved</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="green.500" fontFamily="'Segoe UI', sans-serif">
                {stats.approved}
              </Text>
            </VStack>
          </Card>
          
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaExclamationTriangle} boxSize={16} color="orange.500" />
            </Box>
            <VStack>
              <Badge 
                colorScheme="orange" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                minH="28px"
                display="flex"
                alignItems="center"
              >
                <HStack spacing={1}>
                  <Icon as={FaExclamationTriangle} boxSize={3} />
                  <Text fontFamily="'Segoe UI', sans-serif">Reviewed</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500" fontFamily="'Segoe UI', sans-serif">
                {stats.reviewed}
              </Text>
            </VStack>
          </Card>
          
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaClock} boxSize={16} color="blue.500" />
            </Box>
            <VStack>
              <Badge 
                colorScheme="blue" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                minH="28px"
                display="flex"
                alignItems="center"
              >
                <HStack spacing={1}>
                  <Icon as={FaClock} boxSize={3} />
                  <Text fontFamily="'Segoe UI', sans-serif">Pending</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500" fontFamily="'Segoe UI', sans-serif">
                {stats.pending}
              </Text>
            </VStack>
          </Card>
          
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaTimesCircle} boxSize={16} color="red.500" />
            </Box>
            <VStack>
              <Badge 
                colorScheme="red" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                minH="28px"
                display="flex"
                alignItems="center"
              >
                <HStack spacing={1}>
                  <Icon as={FaTimesCircle} boxSize={3} />
                  <Text fontFamily="'Segoe UI', sans-serif">Rejected</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="red.500" fontFamily="'Segoe UI', sans-serif">
                {stats.rejected}
              </Text>
            </VStack>
          </Card>
          
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaHistory} boxSize={16} color="purple.500" />
            </Box>
            <VStack>
              <Badge 
                colorScheme="purple" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                minH="28px"
                display="flex"
                alignItems="center"
              >
                <HStack spacing={1}>
                  <Icon as={FaHistory} boxSize={3} />
                  <Text fontFamily="'Segoe UI', sans-serif">Total</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500" fontFamily="'Segoe UI', sans-serif">
                {stats.total}
              </Text>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Enhanced Filters Section */}
        <Card bg={filterCardBg} mb={6} p={4} borderRadius="2xl" boxShadow="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" cursor="pointer" onClick={() => setShowFilters(!showFilters)}>
              <Heading size="md" fontFamily="'Segoe UI', sans-serif">
                <HStack>
                  <Icon as={FaFilter} color="blue.500" />
                  <Text>Filters & Options</Text>
                </HStack>
              </Heading>
              <HStack>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters({ status: "", sortBy: "date-desc", search: "" });
                  }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  Clear All
                </Button>
                <Icon as={showFilters ? FaChevronUp : FaChevronDown} color="blue.500" />
              </HStack>
            </Flex>
            
            <Collapse in={showFilters} animateOpacity>
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Status Filter</Text>
                      <Select
                        placeholder="All Statuses"
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        borderRadius="lg"
                        fontFamily="'Segoe UI', sans-serif"
                        bg="white"
                        _dark={{ bg: "gray.700" }}
                      >
                        <option value="approved">Approved</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="submitted">Pending</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </VStack>
                  </GridItem>
                  
                  <GridItem>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Sort By</Text>
                      <Select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                        borderRadius="lg"
                        fontFamily="'Segoe UI', sans-serif"
                        bg="white"
                        _dark={{ bg: "gray.700" }}
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="status">By Status</option>
                      </Select>
                    </VStack>
                  </GridItem>
                </Grid>
                
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by ID, remarks, or feedback..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    borderRadius="lg"
                    fontFamily="'Segoe UI', sans-serif"
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                  />
                </InputGroup>
              </VStack>
            </Collapse>
          </VStack>
        </Card>

        {/* Results Count */}
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <HStack>
            <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontWeight="medium">
              Showing {filteredDeliverables.length} of {deliverables.length} submissions
            </Text>
            <Badge colorScheme={filteredDeliverables.length === deliverables.length ? "gray" : "blue"} fontFamily="'Segoe UI', sans-serif">
              {filteredDeliverables.length === deliverables.length ? "No filters" : "Filtered"}
            </Badge>
          </HStack>
          
          <HStack spacing={3}>
            <HStack>
              <Icon as={FaInfoCircle} color="gray.500" boxSize={4} />
              <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                Last updated: {new Date().toLocaleDateString('en-GB')}
              </Text>
            </HStack>
          </HStack>
        </Flex>

        {/* Content */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden">
          <CardBody p={6}>
            {filteredDeliverables.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Icon as={FaFileAlt} fontSize="4xl" color="gray.400" mb={4} />
                <Text fontSize="lg" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                  No submissions found
                </Text>
                <Text fontSize="sm" color="gray.500" mt={2} fontFamily="'Segoe UI', sans-serif">
                  {deliverables.length === 0 
                    ? "Submit your first deliverable to get started." 
                    : "Try adjusting your filters or search term."}
                </Text>
                {deliverables.length > 0 && (
                  <Button 
                    colorScheme="blue" 
                    variant="ghost" 
                    onClick={() => setFilters({ status: "", sortBy: "date-desc", search: "" })}
                    fontFamily="'Segoe UI', sans-serif"
                    size="sm"
                    mt={4}
                  >
                    Clear all filters
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={headerGradient}>
                    <Tr>
                      <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Submission ID</Th>
                      <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Date</Th>
                      <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Files</Th>
                      <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Status</Th>
                      <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredDeliverables.map((submission) => (
                      <Tr key={submission.id || submission.submission_id} _hover={{ bg: subtleBg }} transition="all 0.2s">
                        <Td textAlign="center">
                          <Text fontSize="sm" fontWeight="medium" fontFamily="'Segoe UI', sans-serif" isTruncated maxW="120px">
                            {submission.submission_id || "N/A"}
                          </Text>
                        </Td>
                        <Td textAlign="center">
                          <HStack justify="center">
                            <Icon as={FaCalendarDay} color="gray.500" />
                            <Text fontFamily="'Segoe UI', sans-serif">{formatDate(submission.submission_date)}</Text>
                          </HStack>
                        </Td>
                        <Td textAlign="center">
                          <Badge colorScheme="blue" fontFamily="'Segoe UI', sans-serif">
                            {submission.file_paths?.length || 0} files
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <HStack justify="center">
                            {getStatusIcon(submission.status)}
                            <Badge 
                              colorScheme={getStatusColor(submission.status)} 
                              textTransform="capitalize"
                              fontFamily="'Segoe UI', sans-serif"
                              minH="24px"
                              display="flex"
                              alignItems="center"
                            >
                              {submission.status || "submitted"}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td textAlign="center">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<FaEye />}
                            onClick={() => viewSubmissionDetails(submission)}
                            fontFamily="'Segoe UI', sans-serif"
                          >
                            View Details
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Submission Details Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">Submission Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedSubmission && (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Submission ID:</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">{selectedSubmission.submission_id || "N/A"}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Date:</Text>
                    <Text fontFamily="'Segoe UI', sans-serif">{formatDate(selectedSubmission.submission_date)}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Status:</Text>
                    <Badge 
                      colorScheme={getStatusColor(selectedSubmission.status)} 
                      textTransform="capitalize"
                      fontFamily="'Segoe UI', sans-serif"
                      minH="24px"
                      display="flex"
                      alignItems="center"
                    >
                      {selectedSubmission.status || "submitted"}
                    </Badge>
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2} fontFamily="'Segoe UI', sans-serif">Remarks:</Text>
                    <Text p={3} bg="gray.50" borderRadius="md" fontFamily="'Segoe UI', sans-serif">
                      {selectedSubmission.remarks || "No remarks provided"}
                    </Text>
                  </Box>
                  
                  {selectedSubmission.feedback && (
                    <Box>
                      <Text fontWeight="bold" mb={2} fontFamily="'Segoe UI', sans-serif">Feedback:</Text>
                      <Text p={3} bg="blue.50" borderRadius="md" fontFamily="'Segoe UI', sans-serif">
                        {selectedSubmission.feedback}
                      </Text>
                    </Box>
                  )}
                  
                  {selectedSubmission.reviewed_by && (
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Reviewed By:</Text>
                      <Text fontFamily="'Segoe UI', sans-serif">{selectedSubmission.reviewed_by}</Text>
                    </HStack>
                  )}
                  
                  {selectedSubmission.reviewed_at && (
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontFamily="'Segoe UI', sans-serif">Reviewed At:</Text>
                      <Text fontFamily="'Segoe UI', sans-serif">{formatDateTime(selectedSubmission.reviewed_at)}</Text>
                    </HStack>
                  )}
                  
                  <Box>
                    <Text fontWeight="bold" mb={2} fontFamily="'Segoe UI', sans-serif">Files:</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedSubmission.file_paths?.map((file, index) => (
                        <HStack 
                          key={index} 
                          p={2} 
                          bg="gray.50" 
                          borderRadius="md"
                          justify="space-between"
                        >
                          <HStack>
                            <Icon as={FaFileAlt} color="blue.500" />
                            <Text fontSize="sm" isTruncated maxW="200px" fontFamily="'Segoe UI', sans-serif">
                              {file.split('/').pop()}
                            </Text>
                          </HStack>
                          <Tooltip label="Download file">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              as="a"
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaDownload />
                            </Button>
                          </Tooltip>
                        </HStack>
                      )) || (
                        <Text color="gray.500" fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          No files available
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose} fontFamily="'Segoe UI', sans-serif">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}