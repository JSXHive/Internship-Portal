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
  Card,
  CardBody,
  VStack,
  Spinner,
  HStack,
  Divider,
  Center,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  IconButton,
  Tooltip,
  Wrap,
  WrapItem,
  Link
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaGraduationCap,
  FaIdCard,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaRegFileAlt,
  FaAward,
  FaLinkedin,
  FaGithub,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt
} from "react-icons/fa";
import { FiUsers, FiBookOpen, FiEye } from "react-icons/fi";

export default function StudentsAssigned() {
  const router = useRouter();
  const { mentorId } = router.query;
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("blue.50", "blue.800");

  const fetchAssignedStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching students for mentor:', mentorId);
      const response = await fetch(`/api/admin/mentor-students-details?mentorId=${mentorId}`);
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Check API endpoint.");
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      if (response.ok) {
        setStudents(responseData.students || []);
        
        // Also fetch mentor info for display
        try {
          const mentorResponse = await fetch(`/api/admin/mentors`);
          if (mentorResponse.ok) {
            const mentorData = await mentorResponse.json();
            const mentor = mentorData.mentors.find(m => m.user_id === mentorId);
            setMentorInfo(mentor);
          }
        } catch (mentorError) {
          console.error('Error fetching mentor info:', mentorError);
        }
      } else {
        throw new Error(responseData.message || "Failed to fetch assigned students");
      }
    } catch (error) {
      console.error("Error fetching assigned students:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assigned students",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [mentorId, toast]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    if (mentorId) {
      fetchAssignedStudents();
    }
  }, [mentorId, router, fetchAssignedStudents]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const birthDate = new Date(dateString);
      if (isNaN(birthDate.getTime())) return 'Invalid date';
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'active': return 'blue';
      case 'completed': return 'purple';
      case 'terminated': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear(to-br, blue.50, purple.50)">
        <VStack spacing={6}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text fontWeight="medium" color="blue.700">Loading assigned students...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear(to-br, blue.50, purple.50)">
        <VStack spacing={6}>
          <Box
            w={20}
            h={20}
            bg="red.100"
            borderRadius="2xl"
            color="red.500"
            boxShadow="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiUsers} boxSize={10} />
          </Box>
          <Text fontWeight="bold" fontSize="xl" color="red.600">Error Loading Students</Text>
          <Text color="red.500">{error}</Text>
          <Button 
            colorScheme="blue" 
            onClick={fetchAssignedStudents}
            leftIcon={<FaArrowLeft />}
          >
            Try Again
          </Button>
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
          onClick={() => router.push("/admin/mentors")}
          _hover={{ 
            bg: "blue.50",
            transform: "translateX(-4px)",
            transition: "transform 0.2s"
          }}
        >
          Back to Mentors
        </Button>

        {/* Header Section */}
        <Card 
          mb={8} 
          borderRadius="2xl" 
          boxShadow="xl" 
          bg={cardBg}
          overflow="hidden"
          position="relative"
        >
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            w="100%" 
            h="100px" 
            bgGradient="linear(to-r, blue.500, purple.500)" 
            opacity="0.1"
          />
          <CardBody p={8}>
            <VStack spacing={4} textAlign="center" position="relative" zIndex={1}>
              <Heading 
                size="xl" 
                lineHeight="shorter"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                fontWeight="bold"
              >
                Students Assigned to Mentor
              </Heading>
              
              {mentorInfo && (
                <HStack spacing={4} mt={4} justify="center" flexWrap="wrap">
                  <Box position="relative">
                    <Avatar
                      size="xl"
                      name={mentorInfo.name}
                      src={mentorInfo.profile_photo}
                      border="4px solid"
                      borderColor={cardBg}
                      boxShadow="lg"
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      w={6}
                      h={6}
                      borderRadius="full"
                      bg="green.400"
                      border="2px solid"
                      borderColor={cardBg}
                    />
                  </Box>
                  <Box textAlign="left">
                    <Text fontWeight="bold" fontSize="xl">{mentorInfo.name}</Text>
                    <Text color="gray.600" fontSize="md">{mentorInfo.designation}</Text>
                    <Wrap mt={2} justify="start">
                      <Tag colorScheme="blue" borderRadius="full">
                        <TagLeftIcon as={FaChalkboardTeacher} />
                        <TagLabel>{mentorInfo.area_of_expertise}</TagLabel>
                      </Tag>
                      <Tag colorScheme="purple" borderRadius="full">
                        <TagLabel>Students: {students.length}</TagLabel>
                      </Tag>
                    </Wrap>
                  </Box>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Students Table */}
        <Card 
          borderRadius="2xl" 
          boxShadow="xl" 
          overflow="hidden" 
          bg={cardBg}
        >
          <Box 
            p={6} 
            borderBottom="1px solid" 
            borderColor="gray.100" 
            bgGradient="linear(to-r, blue.50, purple.50)"
            position="relative"
            overflow="hidden"
            zIndex={1}
          >
            <Flex justify="space-between" align="center">
              <Heading size="md" color="blue.800">
                <Icon as={FiUsers} mr={3} /> Assigned Students List
              </Heading>
              <Badge 
                colorScheme={students.length > 0 ? "blue" : "gray"} 
                fontSize="lg" 
                px={4} 
                py={2} 
                borderRadius="full"
                bg="white"
                boxShadow="md"
              >
                {students.length} {students.length === 1 ? 'Student' : 'Students'}
              </Badge>
            </Flex>
          </Box>
          
          {students.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th color="blue.800" fontSize="md" py={5}>STUDENT PROFILE</Th>
                    <Th color="blue.800" fontSize="md">ACADEMIC INFORMATION</Th>
                    <Th color="blue.800" fontSize="md">CONTACT INFORMATION</Th>
                    <Th color="blue.800" fontSize="md">STATUS</Th>
                    <Th color="blue.800" fontSize="md">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {students.map((student) => (
                    <Tr 
                      key={student.student_id} 
                      _hover={{ bg: hoverBg }}
                      transition="background 0.2s"
                    >
                      <Td py={5}>
                        <Flex align="center">
                          <Box position="relative">
                            <Avatar
                              size="lg"
                              name={student.name}
                              src={student.profile_photo}
                              mr={4}
                              border="3px solid"
                              borderColor="blue.200"
                              boxShadow="md"
                            />
                            {(student.application_status === 'accepted' || student.application_status === 'active') && (
                              <Box
                                position="absolute"
                                bottom={0}
                                right={4}
                                w={4}
                                h={4}
                                borderRadius="full"
                                bg="green.400"
                                border="2px solid white"
                              />
                            )}
                          </Box>
                          <Box>
                            <Text fontWeight="bold" fontSize="lg" color="blue.900">{student.name}</Text>
                            <Flex align="center" mt={2}>
                              <Icon as={FaIdCard} mr={2} color="blue.500" size="sm" />
                              <Text fontSize="md" color="gray.700">Student ID: {student.student_id || 'N/A'}</Text>
                            </Flex>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          <Flex align="center">
                            <Icon as={FaUniversity} mr={2} color="blue.500" />
                            <Text>{student.college || 'N/A'}</Text>
                          </Flex>
                          <Flex align="center">
                            <Icon as={FiBookOpen} mr={2} color="blue.500" />
                            <Text>{student.branch || 'N/A'}</Text>
                          </Flex>
                          <Flex align="center">
                            <Icon as={FaGraduationCap} mr={2} color="blue.500" />
                            <Text>{student.year_of_study || 'N/A'} • CGPA: {student.cgpa || 'N/A'}</Text>
                          </Flex>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          <Flex align="center">
                            <Icon as={FaEnvelope} mr={2} color="blue.500" />
                            <Text fontSize="sm">{student.email}</Text>
                          </Flex>
                          {student.phone && (
                            <Flex align="center">
                              <Icon as={FaPhone} mr={2} color="blue.500" />
                              <Text fontSize="sm">{student.phone}</Text>
                            </Flex>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(student.application_status)} 
                          px={3} 
                          py={1} 
                          borderRadius="full"
                          fontSize="sm"
                          textTransform="uppercase"
                        >
                          {student.application_status === 'accepted' ? 'Accepted' : student.application_status || 'N/A'}
                        </Badge>
                        <Text fontSize="sm" mt={2} color="gray.600">
                          <Icon as={FaCalendarAlt} mr={1} />
                          Applied: {formatDate(student.application_date)}
                        </Text>
                      </Td>
                      <Td>
                        <Tooltip label="View student details" hasArrow>
                          <IconButton
                            icon={<FiEye />}
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            borderRadius="md"
                            onClick={() => viewStudentDetails(student)}
                            aria-label="View student details"
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box py={16} textAlign="center">
              <Center>
                <VStack spacing={4}>
                  <Center w={20} h={20} bg="blue.100" borderRadius="full">
                    <Icon as={FiUsers} fontSize="3xl" color="blue.500" />
                  </Center>
                  <Heading size="md" color="gray.500">
                    No Students Assigned
                  </Heading>
                  <Text color="gray.500">
                    This mentor doesn&apos;t have any students assigned yet.
                  </Text>
                </VStack>
              </Center>
            </Box>
          )}
        </Card>
      </Box>

      {/* Student Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh">
          <ModalHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaUserGraduate} />
              <Text>Student Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {selectedStudent && (
              <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                <GridItem colSpan={12}>
                  <Flex align="center" mb={4}>
                    <Avatar
                      size="xl"
                      name={selectedStudent.name}
                      src={selectedStudent.profile_photo}
                      mr={4}
                      border="3px solid"
                      borderColor="blue.200"
                    />
                    <Box>
                      <Heading size="md">{selectedStudent.name}</Heading>
                      <Text color="gray.600">Student ID: {selectedStudent.student_id}</Text>
                      <Badge 
                        colorScheme={getStatusColor(selectedStudent.application_status)} 
                        mt={1}
                        textTransform="uppercase"
                      >
                        {selectedStudent.application_status === 'accepted' ? 'Accepted' : selectedStudent.application_status}
                      </Badge>
                    </Box>
                  </Flex>
                </GridItem>

                <GridItem colSpan={6}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="blue.600">Personal Information</Text>
                    <Flex align="center">
                      <Icon as={FaBirthdayCake} mr={2} color="blue.500" />
                      <Text>
                        <strong>DOB:</strong> {formatDate(selectedStudent.dob)} 
                        {selectedStudent.dob && ` (${calculateAge(selectedStudent.dob)} years)`}
                      </Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaVenusMars} mr={2} color="blue.500" />
                      <Text><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaMapMarkerAlt} mr={2} color="blue.500" />
                      <Text><strong>Address:</strong> {selectedStudent.address || 'N/A'}</Text>
                    </Flex>
                  </VStack>
                </GridItem>

                <GridItem colSpan={6}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="blue.600">Contact Information</Text>
                    <Flex align="center">
                      <Icon as={FaEnvelope} mr={2} color="blue.500" />
                      <Text><strong>Email:</strong> {selectedStudent.email}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaPhone} mr={2} color="blue.500" />
                      <Text><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</Text>
                    </Flex>
                    {selectedStudent.linkedin_url && (
                      <Flex align="center">
                        <Icon as={FaLinkedin} mr={2} color="blue.500" />
                        <Link href={selectedStudent.linkedin_url} isExternal color="blue.500">
                          LinkedIn Profile
                        </Link>
                      </Flex>
                    )}
                    {selectedStudent.github_url && (
                      <Flex align="center">
                        <Icon as={FaGithub} mr={2} color="blue.500" />
                        <Link href={selectedStudent.github_url} isExternal color="blue.500">
                          GitHub Profile
                        </Link>
                      </Flex>
                    )}
                  </VStack>
                </GridItem>

                <GridItem colSpan={12}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="blue.600">Academic Information</Text>
                    <Flex align="center">
                      <Icon as={FaUniversity} mr={2} color="blue.500" />
                      <Text><strong>College:</strong> {selectedStudent.college || 'N/A'}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FiBookOpen} mr={2} color="blue.500" />
                      <Text><strong>Branch:</strong> {selectedStudent.branch || 'N/A'}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaGraduationCap} mr={2} color='blue.500' />
                      <Text><strong>Year:</strong> {selectedStudent.year_of_study || 'N/A'}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaAward} mr={2} color="blue.500" />
                      <Text><strong>CGPA:</strong> {selectedStudent.cgpa || 'N/A'}</Text>
                    </Flex>
                  </VStack>
                </GridItem>

                {selectedStudent.skills && (
                  <GridItem colSpan={12}>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color="blue.600">Skills</Text>
                      <Wrap>
                        {selectedStudent.skills.split(',').map((skill, index) => (
                          <Tag key={index} colorScheme="blue" borderRadius="full" size="sm">
                            <TagLabel>{skill.trim()}</TagLabel>
                          </Tag>
                        ))}
                      </Wrap>
                    </VStack>
                  </GridItem>
                )}

                {selectedStudent.areas_of_interest && (
                  <GridItem colSpan={12}>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color="blue.600">Areas of Interest</Text>
                      <Wrap>
                        {Array.isArray(selectedStudent.areas_of_interest) ? (
                          selectedStudent.areas_of_interest.map((interest, index) => (
                            <Tag key={index} colorScheme="purple" borderRadius="full" size="sm">
                              <TagLabel>{interest}</TagLabel>
                            </Tag>
                          ))
                        ) : (
                          <Tag colorScheme="purple" borderRadius="full" size="sm">
                            <TagLabel>{selectedStudent.areas_of_interest}</TagLabel>
                          </Tag>
                        )}
                      </Wrap>
                    </VStack>
                  </GridItem>
                )}

                {selectedStudent.about && selectedStudent.about !== 'Null' && selectedStudent.about !== 'null' && selectedStudent.about.trim() !== '' && (
                  <GridItem colSpan={12}>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color="blue.600">About Any Previous Work Experience</Text>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {selectedStudent.about}
                      </Text>
                    </VStack>
                  </GridItem>
                )}

                <GridItem colSpan={12}>
                  <Divider my={4} />
                </GridItem>

                <GridItem colSpan={12}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="blue.600">Application Details</Text>
                    <Text><strong>Applied on:</strong> {formatDate(selectedStudent.application_date)}</Text>
                    <Text><strong>Status:</strong> 
                      <Badge 
                        colorScheme={getStatusColor(selectedStudent.application_status)} 
                        ml={2}
                        textTransform="uppercase"
                      >
                        {selectedStudent.application_status === 'accepted' ? 'Accepted' : selectedStudent.application_status}
                      </Badge>
                    </Text>
                    {selectedStudent.duration_months && (
                      <Text><strong>Duration:</strong> {selectedStudent.duration_months} months</Text>
                    )}
                    {selectedStudent.start_date && selectedStudent.end_date && (
                      <Text><strong>Internship Period:</strong> {formatDate(selectedStudent.start_date)} to {formatDate(selectedStudent.end_date)}</Text>
                    )}
                    {(selectedStudent.application_resume || selectedStudent.resume) && (
                      <Flex align="center">
                        <Icon as={FaRegFileAlt} mr={2} color="blue.500" />
                        <Link 
                          href={selectedStudent.application_resume || selectedStudent.resume} 
                          isExternal 
                          color="blue.500"
                        >
                          View Resume
                        </Link>
                      </Flex>
                    )}
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}