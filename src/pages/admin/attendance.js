import React, { useState, useEffect, useCallback } from "react";
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
  Tag,
  Tooltip,
  Center,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  keyframes,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Wrap,
  WrapItem,
  Link,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaBuilding,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUserGraduate,
  FaIdCard,
  FaPhone,
  FaCalendarCheck,
  FaChartLine,
  FaUniversity,
  FaChalkboardTeacher,
  FaUsers,
  FaEye,
  FaStar,
  FaDownload,
  FaSync,
  FaChartBar,
  FaHistory,
  FaUserCircle,
  FaLinkedin,
  FaGithub,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaAward,
  FaFilePdf,
  FaUserCheck,
  FaClipboardCheck,
  FaRegFileAlt,
  FaRobot,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaIdBadge,
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

export default function AdminAttendance() {
  const router = useRouter();
  const toast = useToast();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentAttendanceHistory, setStudentAttendanceHistory] = useState([]);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [exportLoading, setExportLoading] = useState(false);
  const [minimumLoading, setMinimumLoading] = useState(true);
  const [mentorLoading, setMentorLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const subtleBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerGradient = useColorModeValue("linear(to-r, blue.500, purple.500)", "linear(to-r, blue.600, purple.600)");

  // Fetch overall attendance data
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/overall-attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.attendance || []);
      } else {
        throw new Error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setMinimumLoading(false);
    }
  }, [toast]);

  // Fetch mentor details
  const fetchMentorDetails = async (mentorId) => {
    if (!mentorId) {
      setMentorDetails(null);
      return;
    }

    try {
      setMentorLoading(true);
      const response = await fetch(`/api/admin/mentor-details?mentorId=${mentorId}`);
      if (response.ok) {
        const data = await response.json();
        setMentorDetails(data.mentor);
      } else {
        throw new Error("Failed to fetch mentor details");
      }
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor details",
        status: "error",
        duration: 2000,
      });
      setMentorDetails(null);
    } finally {
      setMentorLoading(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchAttendanceData();
  };

  useEffect(() => {
    const loadData = async () => {
      // Set minimum loading time to 2 seconds
      const minimumLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([
        fetchAttendanceData(),
        minimumLoadTime
      ]);
    };
    
    loadData();
  }, [fetchAttendanceData]);

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 60) return 'orange';
    return 'red';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return FaCheckCircle;
    if (percentage >= 75) return FaChartLine;
    if (percentage >= 60) return FaClock;
    return FaTimesCircle;
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

  const formatTime = (timeString) => {
    if (!timeString) return 'Not recorded';
    try {
      const timePart = timeString.includes('+') ? timeString.split('+')[0] : timeString;
      const [hours, minutes, seconds] = timePart.split(':');
      
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Calculate working days between start and end date (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let count = 0;
      
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const current = new Date(start);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    } catch (error) {
      console.error("Error calculating working days:", error);
      return 0;
    }
  };

  // Calculate internship duration in months
  const calculateDurationMonths = (startDate, endDate, durationMonths = null) => {
    if (durationMonths) {
      return `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`;
    }
    
    if (!startDate || !endDate) return 'Not specified';
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Invalid date';
      }
      
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      
      // Adjust for cases where end date is before start date
      const adjustedMonths = Math.max(0, months);
      
      return `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 'Calculation error';
    }
  };

  // Calculate attendance percentage based on internship working days
  const calculateAttendancePercentage = (studentData = null, attendanceHistory = []) => {
    if (!studentData) return 0;
    
    const startDate = studentData.start_date || studentData.internship_start_date;
    const endDate = studentData.end_date || studentData.internship_end_date;
    
    const totalWorkingDays = calculateWorkingDays(startDate, endDate);
    if (totalWorkingDays === 0) return 0;
    
    const presentDays = attendanceHistory.filter(a => a.status === 'present').length;
    return Math.round((presentDays / totalWorkingDays) * 100);
  };

  // Calculate student performance metrics using internship duration
  const calculateStudentPerformance = (studentData = null, attendanceHistory = []) => {
    if (!studentData) return { attendance: 0, punctuality: 0, consistency: 0 };
    
    const startDate = studentData.start_date || studentData.internship_start_date;
    const endDate = studentData.end_date || studentData.internship_end_date;
    
    const totalDays = calculateWorkingDays(startDate, endDate);
    if (totalDays === 0) return { attendance: 0, punctuality: 0, consistency: 0 };
    
    const presentDays = attendanceHistory.filter(a => a.status === 'present').length;
    const onTimeDays = attendanceHistory.filter(a => a.status === 'present' && !a.is_late).length;
    
    const attendance = Math.round((presentDays / totalDays) * 100);
    const punctuality = presentDays > 0 ? Math.round((onTimeDays / presentDays) * 100) : 0;
    const consistency = Math.round((attendance + punctuality) / 2);
    
    return { attendance, punctuality, consistency };
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const birthDate = new Date(dateString);
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

  // Fetch student details for modal
  const fetchStudentDetails = async (student) => {
    try {
      // Fetch student profile
      const profileResponse = await fetch(`/api/admin/student-profile?studentId=${student.user_id}`);
      const historyResponse = await fetch(`/api/admin/student-attendance-history?studentId=${student.user_id}`);

      const profileData = profileResponse.ok ? await profileResponse.json() : { student: null };
      const historyData = historyResponse.ok ? await historyResponse.json() : { attendance: [] };

      const completeProfile = profileData.student || {};
      const attendanceHistory = historyData.attendance || [];

      // Calculate various metrics
      const attendancePercentage = calculateAttendancePercentage(completeProfile, attendanceHistory);
      const performanceMetrics = calculateStudentPerformance(completeProfile, attendanceHistory);

      const studentWithDetails = { 
        ...student, 
        ...completeProfile,
        attendanceHistory: attendanceHistory,
        calculatedAttendancePercentage: attendancePercentage,
        performanceMetrics: performanceMetrics
      };

      setSelectedStudent(studentWithDetails);
      setStudentAttendanceHistory(attendanceHistory);

      // Fetch mentor details if mentor is assigned
      if (completeProfile.mentor && completeProfile.mentor.mentor_id) {
        await fetchMentorDetails(completeProfile.mentor.mentor_id);
      } else {
        setMentorDetails(null);
      }

      onOpen();
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        status: "error",
        duration: 2000,
      });
    }
  };

  const sendEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Attendance Follow-up&body=Dear Student,%0D%0A%0D%0AI would like to discuss your recent attendance. Please let me know when you're available for a quick chat.%0D%0A%0D%0ABest regards,%0D%0AAdministrator`;
    }
  };

  const sendMentorEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Student Attendance Update&body=Dear Mentor,%0D%0A%0D%0AI would like to discuss the attendance performance of your assigned student. Please let me know when you're available for a quick chat.%0D%0A%0D%0ABest regards,%0D%0AAdministrator`;
    }
  };

  const exportAttendance = async () => {
    setExportLoading(true);
    try {
      const headers = ['Student ID', 'Name', 'College', 'Branch', 'Total Days', 'Present Days', 'Absent Days', 'Late Days', 'Attendance %', 'Office Days', 'WFH Days', 'First Record', 'Last Record'];
      const csvData = filteredAttendance.map(record => [
        record.student_id,
        record.name,
        record.college || 'N/A',
        record.branch || 'N/A',
        record.total_days,
        record.present_days,
        record.absent_days,
        record.late_days,
        `${record.attendance_percentage}%`,
        record.office_days,
        record.wfh_days,
        formatDate(record.first_attendance),
        formatDate(record.last_attendance)
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `overall-attendance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Overall attendance data has been exported to CSV",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error exporting attendance:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data",
        status: "error",
        duration: 3000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate overall stats
  const stats = {
    total: attendanceData.length,
    excellent: attendanceData.filter(a => a.attendance_percentage >= 90).length,
    good: attendanceData.filter(a => a.attendance_percentage >= 75 && a.attendance_percentage < 90).length,
    average: attendanceData.filter(a => a.attendance_percentage >= 60 && a.attendance_percentage < 75).length,
    poor: attendanceData.filter(a => a.attendance_percentage < 60).length,
    totalPresent: attendanceData.reduce((sum, student) => sum + student.present_days, 0),
    totalAbsent: attendanceData.reduce((sum, student) => sum + student.absent_days, 0),
    totalLate: attendanceData.reduce((sum, student) => sum + student.late_days, 0),
  };

  // Get unique colleges for filter
  const colleges = [...new Set(attendanceData.map(student => student.college).filter(Boolean))];

  // Filter attendance data
  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.college?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAttendance = attendanceFilter === "all" || 
      (attendanceFilter === "excellent" && record.attendance_percentage >= 90) ||
      (attendanceFilter === "good" && record.attendance_percentage >= 75 && record.attendance_percentage < 90) ||
      (attendanceFilter === "average" && record.attendance_percentage >= 60 && record.attendance_percentage < 75) ||
      (attendanceFilter === "poor" && record.attendance_percentage < 60);
    
    const matchesCollege = collegeFilter === "all" || record.college === collegeFilter;
    
    return matchesSearch && matchesAttendance && matchesCollege;
  });

  // Enhanced loading component
  if (minimumLoading || (loading && !refreshing)) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="2xl"
            bgGradient="linear(to-r, green.500, green.600)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaUserCheck} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
          <Text fontWeight="medium" fontSize="lg" color="black">
            Loading Overall Attendance Dashboard...
          </Text>
          <Text fontSize="sm" color="gray.500">Gathering comprehensive attendance data</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" fontFamily="'Segoe UI', sans-serif" py={4}>
      <Container maxW="8xl" px={4}>
        {/* Header with Back Button and Actions */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="blue"
            variant="outline"
            size="md"
            onClick={() => router.push("/admin/dashboard")}
            _hover={{ 
              bg: "blue.50",
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
              colorScheme="blue"
              variant="outline"
              size="md"
              onClick={refreshData}
              isLoading={refreshing}
              borderRadius="xl"
              fontWeight="600"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FaDownload />}
              colorScheme="green"
              size="md"
              onClick={exportAttendance}
              isLoading={exportLoading}
              borderRadius="xl"
              fontWeight="600"
              bgGradient="linear(to-r, green.500, teal.500)"
              _hover={{ bgGradient: "linear(to-r, green.600, teal.600)" }}
            >
              Export CSV
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
                <Icon as={FaChartBar} boxSize={8} />
              </Box>
              <Heading size="xl" fontWeight="700" textAlign="center">
                <Text as="span" mr={2}>📊</Text>
                <Text
                    as="span"
                    bgGradient={headerGradient}
                    bgClip="text"
                > 
                    Overall Student Attendance
              </Text>
              </Heading>

              <Text color="gray.600" fontSize="lg" fontWeight="500" maxW="2xl">
                Comprehensive attendance tracking and analytics for all students
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          {[
            { 
              label: "Total Students", 
              value: stats.total, 
              color: "blue", 
              icon: FaUsers,
              gradient: "linear(to-r, blue.500, cyan.500)"
            },
            { 
              label: "Excellent (90%+)", 
              value: stats.excellent, 
              color: "green", 
              icon: FaCheckCircle,
              gradient: "linear(to-r, green.500, teal.500)"
            },
            { 
              label: "Good (75-89%)", 
              value: stats.good, 
              color: "blue", 
              icon: FaChartLine,
              gradient: "linear(to-r, blue.500, cyan.500)"
            },
            { 
              label: "Needs Attention", 
              value: stats.average + stats.poor, 
              color: "orange", 
              icon: FaExclamationTriangle,
              gradient: "linear(to-r, orange.500, yellow.500)"
            },
          ].map((stat, index) => (
            <Card 
              key={index} 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg"
              _hover={{ transform: "translateY(-4px)", transition: "transform 0.2s" }}
              transition="transform 0.2s"
            >
              <CardBody py={5}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="600" mb={1}>
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
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  🔍 Search Students
                </Text>
                <Input
                  placeholder="Name, ID, or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  📊 Attendance Range
                </Text>
                <Select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="all">All Students</option>
                  <option value="excellent">Excellent (90%+)</option>
                  <option value="good">Good (75-89%)</option>
                  <option value="average">Average (60-74%)</option>
                  <option value="poor">Poor (&lt;60%)</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  🎓 Filter by College
                </Text>
                <Select
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="all">All Colleges</option>
                  {colleges.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  Actions
                </Text>
                <Button
                  leftIcon={<FaFilter />}
                  colorScheme="blue"
                  variant="outline"
                  size="md"
                  w="full"
                  onClick={() => {
                    setSearchTerm("");
                    setAttendanceFilter("all");
                    setCollegeFilter("all");
                  }}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Overall Attendance Table */}
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
                📋 Overall Attendance Summary
              </Heading>
              <Badge 
                bg="white" 
                color="blue.600" 
                fontSize="md" 
                px={4} 
                py={2} 
                borderRadius="full" 
                fontWeight="700"
                boxShadow="md"
              >
                {filteredAttendance.length} Students
              </Badge>
            </Flex>
          </Box>
          
          <Box overflowX="auto" p={6}>
            <Table variant="simple" size="lg" colorScheme="blue">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">Student Information</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">College & Branch</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">Attendance Performance</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">Work Mode Distribution</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">Attendance Period</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4} borderBottom="2px solid" borderColor="gray.200">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAttendance.map((record) => {
                  const StatusIcon = getStatusIcon(record.attendance_percentage);
                  const statusColor = getStatusColor(record.attendance_percentage);
                  
                  return (
                    <Tr 
                      key={record.user_id} 
                      _hover={{ bg: "gray.50", transform: "translateY(-2px)" }} 
                      transition="all 0.3s ease-in-out"
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Td py={5} px={4}>
                        <Flex align="center">
                          <Avatar
                            size="lg"
                            name={record.name}
                            src={record.profile_photo}
                            mr={4}
                            border="3px solid"
                            borderColor={`${statusColor}.300`}
                            boxShadow="lg"
                          />
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="lg" color="blue.900" mb={1}>
                              {record.name}
                            </Text>
                            <Flex align="center" mb={1}>
                              <Icon as={FaIdCard} mr={2} color="blue.500" size="sm" />
                              <Text fontSize="sm" color="gray.600" fontWeight="500">
                                Student ID: {record.student_id || 'Not assigned'}
                              </Text>
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                              {record.email}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="600" color="gray.800" fontSize="md">
                            {record.college || 'N/A'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {record.branch || 'N/A'}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Year: {record.year_of_study || 'N/A'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={3}>
                          <Flex align="center">
                            <Badge
                              colorScheme={statusColor}
                              display="flex"
                              alignItems="center"
                              px={3}
                              py={2}
                              borderRadius="full"
                              fontSize="md"
                              fontWeight="700"
                            >
                              <Icon as={StatusIcon} mr={2} boxSize={4} />
                              {record.attendance_percentage}%
                            </Badge>
                          </Flex>
                          <Progress 
                            value={record.attendance_percentage} 
                            colorScheme={statusColor}
                            size="lg"
                            width="180px"
                            borderRadius="full"
                            height="12px"
                          />
                          <HStack spacing={4} fontSize="sm">
                            <Text color="green.600" fontWeight="600">
                              ✅ {record.present_days}
                            </Text>
                            <Text color="red.600" fontWeight="600">
                              ❌ {record.absent_days}
                            </Text>
                            <Text color="orange.600" fontWeight="600">
                              ⏰ {record.late_days}
                            </Text>
                          </HStack>
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={2}>
                          <Flex align="center">
                            <Icon as={FaBuilding} color="blue.500" mr={2} />
                            <Text fontWeight="600" color="blue.600">
                              Office: {record.office_days}
                            </Text>
                          </Flex>
                          <Flex align="center">
                            <Icon as={FaHome} color="purple.500" mr={2} />
                            <Text fontWeight="600" color="purple.600">
                              WFH: {record.wfh_days}
                            </Text>
                          </Flex>
                          <Box mt={2}>
                            <Progress 
                              value={record.total_days > 0 ? (record.office_days / record.total_days) * 100 : 0} 
                              colorScheme="blue" 
                              size="sm"
                              width="120px"
                              borderRadius="full"
                            />
                          </Box>
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            <strong>First:</strong> {formatDate(record.first_attendance)}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            <strong>Last:</strong> {formatDate(record.last_attendance)}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            <strong>Total Days:</strong> {record.total_days}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <HStack spacing={3}>
                          <Tooltip label="View Detailed Profile" hasArrow>
                            <Button
                              size="md"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FaEye />}
                              onClick={() => fetchStudentDetails(record)}
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              View
                            </Button>
                          </Tooltip>
                          <Tooltip label="Send Email" hasArrow>
                            <IconButton
                              size="md"
                              colorScheme="green"
                              variant="outline"
                              icon={<FaEnvelope />}
                              onClick={() => sendEmail(record.email)}
                              aria-label="Send email"
                              borderRadius="lg"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          {filteredAttendance.length === 0 && (
            <Center py={16}>
              <VStack spacing={6}>
                <Box
                  w={24}
                  h={24}
                  bg="blue.100"
                  borderRadius="2xl"
                  color="blue.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="lg"
                >
                  <Icon as={FaUserGraduate} boxSize={10} />
                </Box>
                <Text color="gray.500" fontSize="lg" fontWeight="600">No students found</Text>
                {(searchTerm || attendanceFilter !== "all" || collegeFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setAttendanceFilter("all");
                      setCollegeFilter("all");
                    }}
                    colorScheme="blue"
                    size="md"
                    borderRadius="xl"
                    fontWeight="600"
                    leftIcon={<FaSync />}
                  >
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </Center>
          )}
        </Card>
      </Container>

      {/* Student Details Modal with Fixed Header and Duration Display */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxH="90vh" fontFamily="'Segoe UI', sans-serif" overflow="hidden">
          {selectedStudent && (
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
                    name={selectedStudent.name}
                    src={selectedStudent.profile_photo}
                    mr={4}
                    border="3px solid white"
                    boxShadow="lg"
                  />
                  <Box flex="1">
                    <Heading size="lg" fontWeight="700">{selectedStudent.name}</Heading>
                    <Text fontSize="md" opacity={0.9}>
                      <strong>Student ID:</strong> {selectedStudent.student_id} • {selectedStudent.college}
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      <strong>Overall Attendance:</strong> {selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage}%
                    </Text>
                  </Box>
                </Flex>
              </ModalHeader>
              <ModalCloseButton color="white" size="lg" />
              
              <ModalBody p={0}>
                <Tabs colorScheme="blue" isFitted>
                  <TabList 
                    bg="gray.50" 
                    px={6} 
                    borderBottom="1px solid" 
                    borderColor="gray.200"
                    position="sticky"
                    top={0}
                    zIndex={10}
                  >
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaHistory} mr={3} />
                      Attendance History
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaUserCircle} mr={3} />
                      Student Profile
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaUserTie} mr={3} />
                      Mentor Details
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaChartBar} mr={3} />
                      Performance Analytics
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Attendance History Panel */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="start">
                        <Card w="full" bg="blue.50" borderRadius="xl">
                          <CardBody py={4}>
                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontWeight="600" color="blue.700" fontSize="lg">
                                  Overall Attendance Summary
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                  {selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage}%
                                </Text>
                                <Text fontSize="sm" color="blue.600" mt={1}>
                                  Based on {selectedStudent.total_days || studentAttendanceHistory.length} recorded days
                                </Text>
                              </Box>
                              <Progress 
                                value={selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage} 
                                colorScheme="blue" 
                                w="120px"
                                h="3"
                                borderRadius="full"
                              />
                            </Flex>
                          </CardBody>
                        </Card>
                        
                        {studentAttendanceHistory.length > 0 ? (
                          <Box w="full" maxH="400px" overflowY="auto" borderRadius="xl" border="1px solid" borderColor="gray.200">
                            <Table size="md" variant="simple">
                              <Thead bg="gray.50" position="sticky" top={0}>
                                <Tr>
                                  <Th fontSize="md" fontWeight="700" py={4}>Date</Th>
                                  <Th fontSize="md" fontWeight="700">Status</Th>
                                  <Th fontSize="md" fontWeight="700">Check-in</Th>
                                  <Th fontSize="md" fontWeight="700">Check-out</Th>
                                  <Th fontSize="md" fontWeight="700">Work Mode</Th>
                                  <Th fontSize="md" fontWeight="700">Auto-marked</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {studentAttendanceHistory.slice(0, 30).map((record, index) => (
                                  <Tr key={index} _hover={{ bg: "gray.50" }}>
                                    <Td py={3} fontSize="md" fontWeight="500">{formatDate(record.date)}</Td>
                                    <Td>
                                      <Badge 
                                        colorScheme={record.status === 'present' ? 'green' : record.status === 'absent' ? 'red' : 'orange'}
                                        fontSize="sm"
                                        fontWeight="600"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {record.status?.toUpperCase()}
                                      </Badge>
                                    </Td>
                                    <Td fontSize="md" fontWeight="500">{formatTime(record.entry_time) || 'N/A'}</Td>
                                    <Td fontSize="md" fontWeight="500">{formatTime(record.exit_time) || 'N/A'}</Td>
                                    <Td>
                                      {record.work_mode ? (
                                        <Tag 
                                          colorScheme={record.work_mode === 'office' ? 'blue' : 'purple'}
                                          size="sm"
                                          borderRadius="full"
                                          fontWeight="500"
                                        >
                                          {record.work_mode === 'office' ? 'Office' : 'WFH'}
                                        </Tag>
                                      ) : (
                                        'N/A'
                                      )}
                                    </Td>
                                    <Td>
                                      {record.is_auto_marked ? (
                                        <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
                                          Yes
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="gray" fontSize="xs" px={2} py={1}>
                                          No
                                        </Badge>
                                      )}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        ) : (
                          <Center w="full" py={12}>
                            <VStack spacing={4}>
                              <Icon as={FaHistory} boxSize={12} color="gray.400" />
                              <Text color="gray.500" fontSize="lg" fontWeight="600">No attendance history available</Text>
                            </VStack>
                          </Center>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Student Profile Panel */}
                    <TabPanel p={6}>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        {/* Personal Information */}
                        <VStack align="start" spacing={6}>
                          <Card w="full" borderRadius="xl" boxShadow="lg">
                            <CardBody>
                              <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                👤 Personal Information
                              </Text>
                              <VStack align="start" spacing={3} fontSize="md">
                                <HStack>
                                  <Icon as={FaBirthdayCake} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500">
                                    <strong>DOB:</strong> {formatDate(selectedStudent.dob)} 
                                    {selectedStudent.dob && ` (${calculateAge(selectedStudent.dob)} years)`}
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaVenusMars} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</Text>
                                </HStack>
                                <HStack align="start">
                                  <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={5} mt={1} />
                                  <Text fontWeight="500"><strong>Address:</strong> {selectedStudent.address || 'N/A'}</Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Contact Information */}
                          <Card w="full" borderRadius="xl" boxShadow="lg">
                            <CardBody>
                              <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                📞 Contact Information
                              </Text>
                              <VStack align="start" spacing={3} fontSize="md">
                                <HStack>
                                  <Icon as={FaEnvelope} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>Email:</strong> {selectedStudent.email}</Text>
                                </HStack>
                                {selectedStudent.phone && (
                                  <HStack>
                                    <Icon as={FaPhone} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Phone:</strong> {selectedStudent.phone}</Text>
                                  </HStack>
                                )}
                                {selectedStudent.linkedin_url && (
                                  <HStack>
                                    <Icon as={FaLinkedin} color="blue.500" boxSize={5} />
                                    <Link href={selectedStudent.linkedin_url} isExternal color="blue.500" fontWeight="500">
                                      LinkedIn Profile
                                    </Link>
                                  </HStack>
                                )}
                                {selectedStudent.github_url && (
                                  <HStack>
                                    <Icon as={FaGithub} color="blue.500" boxSize={5} />
                                    <Link href={selectedStudent.github_url} isExternal color="blue.500" fontWeight="500">
                                      GitHub Profile
                                    </Link>
                                  </HStack>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Skills & Interests */}
                          {(selectedStudent.skills || selectedStudent.areas_of_interest) && (
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                  💡 Skills & Interests
                                </Text>
                                <VStack align="start" spacing={4}>
                                  {selectedStudent.skills && (
                                    <Box w="full">
                                      <Text fontWeight="600" color="gray.600" mb={2}>Technical Skills</Text>
                                      <Wrap>
                                        {selectedStudent.skills.split(',').map((skill, index) => (
                                          <Tag 
                                            key={index} 
                                            colorScheme="blue" 
                                            size="md" 
                                            borderRadius="full" 
                                            m={1} 
                                            fontWeight="500"
                                            boxShadow="sm"
                                          >
                                            {skill.trim()}
                                          </Tag>
                                        ))}
                                      </Wrap>
                                    </Box>
                                  )}
                                  
                                  {selectedStudent.areas_of_interest && (
                                    <Box w="full">
                                      <Text fontWeight="600" color="gray.600" mb={2}>Areas of Interest</Text>
                                      <Wrap>
                                        {Array.isArray(selectedStudent.areas_of_interest) ? (
                                          selectedStudent.areas_of_interest.map((interest, index) => (
                                            <Tag 
                                              key={index} 
                                              colorScheme="purple" 
                                              size="md" 
                                              borderRadius="full" 
                                              m={1}
                                              fontWeight="500"
                                              boxShadow="sm"
                                            >
                                              {interest}
                                            </Tag>
                                          ))
                                        ) : typeof selectedStudent.areas_of_interest === 'string' ? (
                                          selectedStudent.areas_of_interest.split(',').map((interest, index) => (
                                            <Tag 
                                              key={index} 
                                              colorScheme="purple" 
                                              size="md" 
                                              borderRadius="full" 
                                              m={1}
                                              fontWeight="500"
                                              boxShadow="sm"
                                            >
                                              {interest.trim()}
                                            </Tag>
                                          ))
                                        ) : (
                                          <Tag 
                                            colorScheme="purple" 
                                            size="md" 
                                            borderRadius="full" 
                                            fontWeight="500"
                                            boxShadow="sm"
                                          >
                                            {selectedStudent.areas_of_interest}
                                          </Tag>
                                        )}
                                      </Wrap>
                                    </Box>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          )}

                          {/* About Section */}
                          {selectedStudent.about && selectedStudent.about !== 'Null' && selectedStudent.about !== 'null' && selectedStudent.about.trim() !== '' && (
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                  ℹ️ About
                                </Text>
                                <Text fontSize="md" whiteSpace="pre-wrap" lineHeight="1.6">
                                  {selectedStudent.about}
                                </Text>
                              </CardBody>
                            </Card>
                          )}
                        </VStack>

                        {/* Academic Information */}
                        <VStack align="start" spacing={6}>
                          <Card w="full" borderRadius="xl" boxShadow="lg">
                            <CardBody>
                              <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                🎓 Academic Information
                              </Text>
                              <VStack align="start" spacing={3} fontSize="md">
                                <HStack>
                                  <Icon as={FaUniversity} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>College:</strong> {selectedStudent.college || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaChalkboardTeacher} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>Branch:</strong> {selectedStudent.branch || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaUserGraduate} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>Year:</strong> {selectedStudent.year_of_study || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaAward} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500"><strong>CGPA:</strong> {selectedStudent.cgpa || 'N/A'}</Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Internship Information */}
                          {(selectedStudent.start_date || selectedStudent.end_date || selectedStudent.duration_months) && (
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                  📅 Internship Period
                                </Text>
                                <VStack align="start" spacing={3} fontSize="md">
                                  <HStack>
                                    <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Start Date:</strong> {formatDate(selectedStudent.start_date)}</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FaCalendarCheck} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>End Date:</strong> {formatDate(selectedStudent.end_date)}</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FaBuilding} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500">
                                      <strong>Duration:</strong> {calculateDurationMonths(
                                        selectedStudent.start_date, 
                                        selectedStudent.end_date, 
                                        selectedStudent.duration_months
                                      )}
                                    </Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FaClipboardCheck} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500">
                                      <strong>Working Days:</strong> {calculateWorkingDays(selectedStudent.start_date, selectedStudent.end_date)}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}

                          {/* Resume Section */}
                          {(selectedStudent.resume || selectedStudent.application_resume) && (
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                                  📄 Resume
                                </Text>
                                <VStack align="start" spacing={3}>
                                  <HStack>
                                    <Icon as={FaFilePdf} color="red.500" boxSize={6} />
                                    <Text fontWeight="500">Student Resume</Text>
                                  </HStack>
                                  <Link 
                                    href={selectedStudent.resume || selectedStudent.application_resume} 
                                    isExternal 
                                    color="blue.500"
                                    fontWeight="600"
                                    fontSize="md"
                                  >
                                    <Button 
                                      colorScheme="blue" 
                                      variant="outline" 
                                      leftIcon={<FaRegFileAlt />}
                                      size="md"
                                      borderRadius="lg"
                                    >
                                      View/Download Resume
                                    </Button>
                                  </Link>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </VStack>
                      </Grid>
                    </TabPanel>

                    {/* Simplified Mentor Details Panel */}
                    <TabPanel p={6}>
                      {mentorLoading ? (
                        <Center py={12}>
                          <VStack spacing={4}>
                            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
                            <Text color="gray.500" fontSize="lg" fontWeight="600">Loading mentor details...</Text>
                          </VStack>
                        </Center>
                      ) : mentorDetails ? (
                        <VStack spacing={6} align="start">
                          {/* Mentor Header Card */}
                          <Card w="full" borderRadius="xl" boxShadow="lg" bgGradient="linear(to-r, teal.50, blue.50)">
                            <CardBody py={6}>
                              <Flex align="center" justify="space-between">
                                <Flex align="center">
                                  <Avatar
                                    size="xl"
                                    name={mentorDetails.name}
                                    src={mentorDetails.profile_photo}
                                    mr={6}
                                    border="4px solid"
                                    borderColor="white"
                                    boxShadow="lg"
                                  />
                                  <Box>
                                    <Heading size="lg" color="teal.700" mb={2}>
                                      {mentorDetails.name}
                                    </Heading>
                                    <Text fontSize="lg" color="teal.600" fontWeight="600" mb={1}>
                                      {mentorDetails.designation}
                                    </Text>
                                    <Text fontSize="md" color="gray.600">
                                      {mentorDetails.area_of_expertise} • {mentorDetails.years_of_experience}+ years experience
                                    </Text>
                                    <HStack mt={3} spacing={4}>
                                      <Button
                                        leftIcon={<FaEnvelope />}
                                        colorScheme="teal"
                                        size="sm"
                                        onClick={() => sendMentorEmail(mentorDetails.email)}
                                        borderRadius="lg"
                                        fontWeight="600"
                                      >
                                        Send Email
                                      </Button>
                                      <Button
                                        leftIcon={<FaPhone />}
                                        colorScheme="blue"
                                        variant="outline"
                                        size="sm"
                                        borderRadius="lg"
                                        fontWeight="600"
                                      >
                                        {mentorDetails.contact_no || 'Contact Not Available'}
                                      </Button>
                                    </HStack>
                                  </Box>
                                </Flex>
                              </Flex>
                            </CardBody>
                          </Card>

                          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                            {/* Professional Information */}
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="teal.600" mb={4} fontSize="lg">
                                  👨‍💼 Professional Details
                                </Text>
                                <VStack align="start" spacing={4} fontSize="md">
                                  <HStack>
                                    <Icon as={FaBriefcase} color="teal.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Designation:</strong> {mentorDetails.designation}</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FaGraduationCap} color="teal.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Area of Expertise:</strong> {mentorDetails.area_of_expertise}</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FaAward} color="teal.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Years of Experience:</strong> {mentorDetails.years_of_experience} years</Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Contact Information */}
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="teal.600" mb={4} fontSize="lg">
                                  📞 Contact Information
                                </Text>
                                <VStack align="start" spacing={4} fontSize="md">
                                  <HStack>
                                    <Icon as={FaEnvelope} color="teal.500" boxSize={5} />
                                    <Text fontWeight="500"><strong>Email:</strong> {mentorDetails.email}</Text>
                                  </HStack>
                                  {mentorDetails.contact_no && (
                                    <HStack>
                                      <Icon as={FaPhone} color="teal.500" boxSize={5} />
                                      <Text fontWeight="500"><strong>Phone:</strong> {mentorDetails.contact_no}</Text>
                                    </HStack>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          </Grid>

                          {/* Bio Section */}
                          {mentorDetails.bio && (
                            <Card w="full" borderRadius="xl" boxShadow="lg">
                              <CardBody>
                                <Text fontWeight="bold" color="teal.600" mb={4} fontSize="lg">
                                  ℹ️ Professional Bio
                                </Text>
                                <Text fontSize="md" whiteSpace="pre-wrap" lineHeight="1.6" color="gray.700">
                                  {mentorDetails.bio}
                                </Text>
                              </CardBody>
                            </Card>
                          )}
                        </VStack>
                      ) : (
                        <Center py={12}>
                          <VStack spacing={6}>
                            <Box
                              w={24}
                              h={24}
                              bg="gray.100"
                              borderRadius="2xl"
                              color="gray.400"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              boxShadow="lg"
                            >
                              <Icon as={FaUserTie} boxSize={10} />
                            </Box>
                            <Text color="gray.500" fontSize="lg" fontWeight="600">No Mentor Assigned</Text>
                            <Text color="gray.500" textAlign="center" maxW="md">
                              This student doesn&apos;t have a mentor assigned yet. 
                              You can assign a mentor through the student management system.
                            </Text>
                          </VStack>
                        </Center>
                      )}
                    </TabPanel>

                    {/* Performance Analytics Panel */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="start">
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                          {[
                            { 
                              label: "Attendance Rate", 
                              value: selectedStudent.performanceMetrics?.attendance || selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage, 
                              color: "green",
                              icon: FaCheckCircle,
                              gradient: "linear(to-r, green.500, teal.500)"
                            },
                            { 
                              label: "Punctuality Score", 
                              value: selectedStudent.performanceMetrics?.punctuality || 0, 
                              color: "blue",
                              icon: FaClock,
                              gradient: "linear(to-r, blue.500, cyan.500)"
                            },
                            { 
                              label: "Overall Consistency", 
                              value: selectedStudent.performanceMetrics?.consistency || selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage, 
                              color: "purple",
                              icon: FaChartLine,
                              gradient: "linear(to-r, purple.500, pink.500)"
                            },
                          ].map((metric, index) => (
                            <Card 
                              key={index} 
                              bg={`${metric.color}.50`} 
                              borderRadius="xl"
                              boxShadow="lg"
                              _hover={{ transform: "translateY(-4px)", transition: "transform 0.2s" }}
                              transition="transform 0.2s"
                            >
                              <CardBody py={6}>
                                <VStack spacing={3}>
                                  <Box 
                                    p={3} 
                                    borderRadius="xl" 
                                    bgGradient={metric.gradient}
                                    color="white"
                                    boxShadow="md"
                                  >
                                    <Icon as={metric.icon} boxSize={6} />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" bgGradient={metric.gradient} bgClip="text">
                                    {metric.value}%
                                  </Text>
                                  <Text fontSize="md" color="gray.600" fontWeight="600" textAlign="center">
                                    {metric.label}
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Additional Analytics */}
                        <Card w="full" borderRadius="xl" boxShadow="lg">
                          <CardBody>
                            <Text fontWeight="bold" color="blue.600" mb={4} fontSize="lg">
                              📈 Internship Performance
                            </Text>
                            <VStack spacing={4} align="start">
                              <Text color="gray.600">
                                Student has maintained <strong>{selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage}%</strong> attendance out of <strong>{calculateWorkingDays(selectedStudent.start_date, selectedStudent.end_date)}</strong> working days in their internship period.
                              </Text>
                              <Progress 
                                value={selectedStudent.attendance_percentage || selectedStudent.calculatedAttendancePercentage} 
                                colorScheme="blue" 
                                w="full"
                                h="3"
                                borderRadius="full"
                              />
                              <HStack spacing={6} mt={2}>
                                <Stat>
                                  <StatLabel color="gray.600">Present Days</StatLabel>
                                  <StatNumber color="green.500">
                                    {selectedStudent.present_days || studentAttendanceHistory.filter(a => a.status === 'present').length}
                                  </StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel color="gray.600">Absent Days</StatLabel>
                                  <StatNumber color="red.500">
                                    {selectedStudent.absent_days || studentAttendanceHistory.filter(a => a.status === 'absent').length}
                                  </StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel color="gray.600">Late Days</StatLabel>
                                  <StatNumber color="orange.500">
                                    {selectedStudent.late_days || studentAttendanceHistory.filter(a => a.is_late).length}
                                  </StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel color="gray.600">Office Days</StatLabel>
                                  <StatNumber color="blue.500">
                                    {selectedStudent.office_days || studentAttendanceHistory.filter(a => a.work_mode === 'office').length}
                                  </StatNumber>
                                </Stat>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              
              <ModalFooter>
                <Button
                  leftIcon={<FaEnvelope />}
                  colorScheme="blue"
                  onClick={() => sendEmail(selectedStudent.email)}
                  size="md"
                  borderRadius="xl"
                  fontWeight="600"
                  bgGradient={headerGradient}
                  _hover={{ bgGradient: headerGradient, transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Send Email to Student
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}