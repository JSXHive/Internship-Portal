import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  useToast,
  Flex,
  Icon,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  Card,
  CardBody,
  SimpleGrid,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  VStack,
  Spinner,
  HStack,
  Divider,
  Center,
  Grid,
  useBreakpointValue
} from "@chakra-ui/react";
import {
  FaUserTie,
  FaArrowLeft,
  FaEye,
  FaEllipsisV,
  FaPhone,
  FaBriefcase,
  FaAward,
  FaSearch,
  FaFilter,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaRocket,
  FaHandshake,
  FaLightbulb
} from "react-icons/fa";
import { FiMail, FiUsers, FiClock, FiBookOpen, FiMessageSquare } from "react-icons/fi";
import { keyframes } from "@chakra-ui/react";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function ManageMentors() {
  const router = useRouter();
  const toast = useToast();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("blue.50", "blue.900");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const hoverBg = useColorModeValue("blue.100", "blue.800");
  const headerBg = useColorModeValue("white", "gray.800");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const subtleBg = useColorModeValue("gray.50", "gray.900");
  const gradientBg = "linear(to-r, blue.500, blue.600)";

  // Function to format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Function to open email client with mentor's email
  const handleSendEmail = (email) => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available for this mentor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    window.location.href = `mailto:${email}`;
  };

  // Function to view assigned students for a mentor
  const handleViewAssignedStudents = (mentorId) => {
    router.push(`/admin/students-assigned?mentorId=${mentorId}`);
  };

  // Fixed the ESLint error by using useCallback
  const fetchMentors = useCallback(async () => {
    try {
      // Start timer for minimum 2 second loading
      const startTime = Date.now();
      
      const response = await fetch("/api/admin/mentors");
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      } else {
        throw new Error("Failed to fetch mentors");
      }
      
      // Ensure loading lasts at least 2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch mentors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    
    fetchMentors();
  }, [router, fetchMentors]); // Added fetchMentors to dependency array

  const handleViewDetails = (mentor) => {
    setSelectedMentor(mentor);
    onOpen();
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || mentor.area_of_expertise === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(mentors.map(mentor => mentor.area_of_expertise))];

  const totalMentors = mentors.length;
  const activeMentors = mentors.filter(mentor => mentor.status !== "inactive").length;
  const newThisWeek = mentors.filter(mentor => {
    const created = new Date(mentor.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

 // Loading state
if (loading) {
  return (
    <Box
      minH="100vh"
      bg={subtleBg}
      fontFamily="'Segoe UI', sans-serif"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={6}>
        <Box
          p={6}
          borderRadius="xl"
          bg="orange.500"
          color="white"
          boxShadow="xl"
          animation={`${pulse} 2s infinite`}
        >
          <FaChalkboardTeacher size={40} />
        </Box>
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.65s"
          color="orange.500"
        />
        <Text fontWeight="medium" fontSize="lg" color="black">
          Loading Mentor Directory...
        </Text>
        <Text fontSize="sm" color="gray.500">
          Preparing everything for you
        </Text>
      </VStack>
    </Box>
  );
}

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={6} px={4}>
      <Box maxW="7xl" mx="auto">
        {/* Back Button */}
        <Button
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
          fontWeight="bold"
          borderRadius="xl"
          mb={6}
          onClick={() => router.push("/admin/dashboard")}
          _hover={{ 
            bg: "blue.50",
          }}
        >
          Back to Dashboard
        </Button>

        {/* Enhanced Header Section */}
        <Card 
          mb={8} 
          borderRadius="2xl" 
          boxShadow="xl" 
          bg={headerBg}
          overflow="hidden"
          position="relative"
        >
          <Box 
            position="absolute" 
            top={0} 
            right={0} 
            w="300px" 
            h="300px" 
            bgGradient="linear(to-br, blue.100, purple.100, transparent)" 
            borderRadius="full" 
            transform="translate(30%, -30%)"
            zIndex={0}
          />
          <CardBody p={8} position="relative" zIndex={1}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
              <VStack spacing={3} textAlign="center" flex="1" px={{ base: 0, md: 8 }}>
                <Heading 
                  size="xl" 
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                  fontWeight="bold"
                  mb={2}
                  lineHeight="short"
                >
                  Manage Mentors
                </Heading>
                <Text color="gray.600" fontSize="lg" textAlign="center" whiteSpace="nowrap">
                  Connect guides with aspiring professionals
                </Text>
                <HStack spacing={4} mt={3} flexWrap="wrap" justify="center">
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    <Icon as={FaHandshake} mr={1} /> Guidance
                  </Badge>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    <Icon as={FaLightbulb} mr={1} /> Expertise
                  </Badge>
                  <Badge colorScheme="cyan" px={3} py={1} borderRadius="full">
                    <Icon as={FaRocket} mr={1} /> Growth
                  </Badge>
                </HStack>
              </VStack>
              
              <Box 
                display={{ base: "none", md: "block" }} 
              >
                <Center
                  w={16}
                  h={16}
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  borderRadius="2xl"
                  color="white"
                  boxShadow="xl"
                  fontSize="2xl"
                >
                  <Icon as={FaUserTie} />
                </Center>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
          <Card 
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            borderLeft="6px solid"
            borderColor="blue.500"
          >
            <CardBody py={5}>
              <Flex align="center">
                <Center
                  w={14}
                  h={14}
                  bg="blue.100"
                  borderRadius="xl"
                  color="blue.600"
                  mr={4}
                >
                  <Icon as={FaUserTie} boxSize={7} />
                </Center>
                <Box>
                  <Text color="gray.600" fontSize="sm" fontWeight="medium">Total Mentors</Text>
                  <Text color="blue.700" fontSize="2xl" fontWeight="bold">{totalMentors}</Text>
                  <Text color="blue.600" fontSize="xs">
                    Guiding future professionals
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card 
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            borderLeft="6px solid"
            borderColor="green.500"
          >
            <CardBody py={5}>
              <Flex align="center">
                <Center
                  w={14}
                  h={14}
                  bg="green.100"
                  borderRadius="xl"
                  color="green.600"
                  mr={4}
                >
                  <Icon as={FiUsers} boxSize={7} />
                </Center>
                <Box>
                  <Text color="gray.600" fontSize="sm" fontWeight="medium">Active Mentors</Text>
                  <Text color="green.700" fontSize="2xl" fontWeight="bold">{activeMentors}</Text>
                  <Text color="green.600" fontSize="xs">
                    Currently mentoring
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card 
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            borderLeft="6px solid"
            borderColor="purple.500"
          >
            <CardBody py={5}>
              <Flex align="center">
                <Center
                  w={14}
                  h={14}
                  bg="purple.100"
                  borderRadius="xl"
                  color="purple.600"
                  mr={4}
                >
                  <Icon as={FiClock} boxSize={7} />
                </Center>
                <Box>
                  <Text color="gray.600" fontSize="sm" fontWeight="medium">New This Week</Text>
                  <Text color="purple.700" fontSize="2xl" fontWeight="bold">{newThisWeek}</Text>
                  <Text color="purple.600" fontSize="xs">
                    Recent additions
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters and Search */}
        <Card 
          mb={6} 
          borderRadius="2xl" 
          boxShadow="xl" 
          bg={cardBg}
        >
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="blue.800" display="flex" alignItems="center">
                <Icon as={FaSearch} mr={3} color="blue.500" />
                Find Mentors
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
                <Box position="relative">
                  <Icon as={FaSearch} position="absolute" left={4} top={4} color="gray.400" />
                  <Input 
                    pl={12}
                    placeholder="Search by name, expertise, or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius="xl"
                    height="50px"
                    fontSize="md"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px blue.100" }}
                  />
                </Box>
                <Box>
                  <Flex align="center" height="100%">
                    <Icon as={FaFilter} mr={3} color="blue.500" />
                    <Select 
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      borderRadius="xl"
                      height="50px"
                      fontSize="md"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px blue.100" }}
                    >
                      <option value="all">All Expertise Areas</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>
                  </Flex>
                </Box>
              </Grid>
            </VStack>
          </CardBody>
        </Card>

        {/* Mentors Table */}
        <Card 
          borderRadius="2xl" 
          boxShadow="xl" 
          overflow="hidden" 
          bg={cardBg}
        >
          <Box p={6} borderBottom="1px solid" borderColor="gray.100" bg={tableHeaderBg}>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="blue.800">
                Mentor Directory
              </Heading>
              <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
                {filteredMentors.length} {filteredMentors.length === 1 ? 'Mentor' : 'Mentors'}
              </Badge>
            </Flex>
          </Box>
          
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color="blue.800" fontSize="md" py={5}>MENTOR PROFILE</Th>
                  <Th color="blue.800" fontSize="md">CONTACT INFORMATION</Th>
                  <Th color="blue.800" fontSize="md">EXPERTISE & EXPERIENCE</Th>
                  <Th color="blue.800" fontSize="md" textAlign="center">ACTIONS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredMentors.map((mentor) => (
                  <Tr 
                    key={mentor.user_id} 
                    _hover={{ bg: hoverBg }}
                    transition="background 0.2s"
                    cursor="pointer"
                  >
                    <Td py={5}>
                      <Flex align="center">
                        <Avatar
                          size="lg"
                          name={mentor.name}
                          src={mentor.profile_photo}
                          mr={4}
                          border="3px solid"
                          borderColor="blue.200"
                          boxShadow="md"
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="lg" color="blue.900">{mentor.name}</Text>
                          <Flex align="center" mt={2}>
                            <Icon as={FaBriefcase} mr={2} color="blue.500" size="sm" />
                            <Text fontSize="md" color="gray.700">{mentor.designation}</Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={3}>
                        <Flex align="center">
                          <Center w={8} h={8} bg="blue.100" borderRadius="full" mr={3}>
                            <Icon as={FiMail} color="blue.600" size="sm" />
                          </Center>
                          <Text fontSize="md">{mentor.email}</Text>
                        </Flex>
                        {mentor.contact_no && (
                          <Flex align="center">
                            <Center w={8} h={8} bg="green.100" borderRadius="full" mr={3}>
                              <Icon as={FaPhone} color="green.600" size="sm" />
                            </Center>
                            <Text fontSize="md">{mentor.contact_no}</Text>
                          </Flex>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontWeight="bold" color="gray.600" fontSize="sm">Area of Expertise</Text>
                          <Badge 
                            colorScheme="blue" 
                            px={3} 
                            py={1} 
                            borderRadius="full"
                            fontSize="sm"
                            mt={1}
                          >
                            {mentor.area_of_expertise || 'N/A'}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.600" fontSize="sm">Experience</Text>
                          <Flex align="center" mt={1}>
                            <Icon as={FaAward} mr={2} color="purple.500" />
                            <Text fontSize="md">{mentor.years_of_experience} years</Text>
                          </Flex>
                        </Box>
                      </VStack>
                    </Td>
                    <Td textAlign="center">
                      <Flex justify="center" gap={2}>
                        <Tooltip label="View details" hasArrow>
                          <IconButton
                            aria-label="View details"
                            icon={<FaEye />}
                            size="md"
                            colorScheme="blue"
                            variant="solid"
                            borderRadius="xl"
                            onClick={() => handleViewDetails(mentor)}
                          />
                        </Tooltip>
                        <Menu>
                          <Tooltip label="More options" hasArrow>
                            <MenuButton
                              as={IconButton}
                              aria-label="Options"
                              icon={<FaEllipsisV />}
                              size="md"
                              variant="outline"
                              colorScheme="blue"
                              borderRadius="xl"
                            />
                          </Tooltip>
                          <MenuList borderRadius="xl" py={2}>
                            <MenuItem 
                              icon={<FiMail />} 
                              borderRadius="md"
                              onClick={() => handleSendEmail(mentor.email)}
                            >
                              Send Email
                            </MenuItem>
                            <MenuItem 
                              icon={<FiUsers />} 
                              borderRadius="md"
                              onClick={() => handleViewAssignedStudents(mentor.user_id)}
                            >
                              View Assigned Students
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {filteredMentors.length === 0 && (
            <Box py={16} textAlign="center">
              <Center>
                <VStack spacing={4}>
                  <Center w={20} h={20} bg="blue.100" borderRadius="full">
                    <Icon as={FaUserTie} fontSize="3xl" color="blue.500" />
                  </Center>
                  <Heading size="md" color="gray.500">
                    {searchTerm || filterDepartment !== "all" 
                      ? "No mentors match your search criteria" 
                      : "No mentors available yet"
                    }
                  </Heading>
                  <Text color="gray.500">
                    {searchTerm || filterDepartment !== "all" 
                      ? "Try adjusting your search terms or filters" 
                      : "Check back later or add new mentors"
                    }
                  </Text>
                </VStack>
              </Center>
            </Box>
          )}
        </Card>

        {/* Mentor Details Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="2xl" overflow="hidden">
            <ModalHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white" py={6}>
              <Flex align="center">
                <Avatar
                  size="xl"
                  name={selectedMentor?.name}
                  src={selectedMentor?.profile_photo}
                  mr={5}
                  border="4px solid white"
                  boxShadow="lg"
                />
                <Box>
                  <Heading size="lg">{selectedMentor?.name}</Heading>
                  <Text fontSize="md" fontWeight="normal" opacity={0.9}>{selectedMentor?.designation}</Text>
                </Box>
              </Flex>
            </ModalHeader>
            <ModalCloseButton color="white" size="lg" />
            <ModalBody py={6}>
              <SimpleGrid columns={2} spacing={6} mb={6}>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Mentor ID</Text>
                  <Text fontSize="md">#{selectedMentor?.user_id}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Area of Expertise</Text>
                  <Text fontSize="md">{selectedMentor?.area_of_expertise || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Contact Number</Text>
                  <Text fontSize="md">{selectedMentor?.contact_no || 'Not provided'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Email Address</Text>
                  <Text fontSize="md">{selectedMentor?.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Joined On</Text>
                  <Text fontSize="md">{formatDate(selectedMentor?.created_at)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>Experience</Text>
                  <Text fontSize="md">{selectedMentor?.years_of_experience} years</Text>
                </Box>
              </SimpleGrid>
              
              <Divider my={4} />
              
              {selectedMentor?.bio && (
                <Box mt={6}>
                  <Heading size="sm" mb={3} color="blue.700" display="flex" alignItems="center">
                    <Icon as={FiBookOpen} mr={2} /> Professional Bio
                  </Heading>
                  <Text color="gray.700" lineHeight="tall">{selectedMentor.bio}</Text>
                </Box>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose} borderRadius="xl">
                Close
              </Button>
              <Button 
                colorScheme="blue"
                leftIcon={<FiMessageSquare />}
                borderRadius="xl"
                onClick={() => handleSendEmail(selectedMentor?.email)}
              >
                Send Message
              </Button>
              <Button 
                colorScheme="green"
                leftIcon={<FiUsers />}
                borderRadius="xl"
                ml={3}
                onClick={() => handleViewAssignedStudents(selectedMentor?.user_id)}
              >
                View Assigned Students
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
}