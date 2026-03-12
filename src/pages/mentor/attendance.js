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
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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

// List of holidays (you can expand this list)
const HOLIDAYS = [
  '2024-01-01', // New Year
  '2024-01-26', // Republic Day
  '2024-03-25', // Holi
  '2024-04-09', // Eid al-Fitr
  '2024-08-15', // Independence Day
  '2024-10-02', // Gandhi Jayanti
  '2024-12-25', // Christmas
];

export default function MentorAttendance() {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentAttendanceHistory, setStudentAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [exportLoading, setExportLoading] = useState(false);
  const [minimumLoading, setMinimumLoading] = useState(true);
  const [autoMarkedCount, setAutoMarkedCount] = useState(0);
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(false);

  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const subtleBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerGradient = useColorModeValue("linear(to-r, blue.500, purple.500)", "linear(to-r, blue.600, purple.600)");

  // Check if a date is a weekend or holiday
  const isWorkingDay = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isHoliday = HOLIDAYS.includes(dateString);
    
    return !isWeekend && !isHoliday;
  };

  // Check if internship is completed
  const isInternshipCompleted = (studentData) => {
    if (!studentData.end_date) return false;
    
    const endDate = new Date(studentData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return endDate < today;
  };

  // Check if internship is active (started and not ended)
  const isInternshipActive = (studentData) => {
    if (!studentData.start_date || !studentData.end_date) return true; // Assume active if dates missing
    
    const startDate = new Date(studentData.start_date);
    const endDate = new Date(studentData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return startDate <= today && endDate >= today;
  };

  // Fetch students assigned to mentor with internship status
  const fetchStudents = useCallback(async () => {
    try {
      const mentorId = localStorage.getItem("userId");
      if (!mentorId) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`/api/mentor/mentor-students?mentorId=${mentorId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Filter out students with completed internships
        const activeStudents = (data.students || []).filter(student => 
          !isInternshipCompleted(student) && isInternshipActive(student)
        );
        
        setStudents(activeStudents);
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Fetch attendance data only for working days
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const mentorId = localStorage.getItem("userId");
      
      if (!mentorId) {
        throw new Error("Please log in again.");
      }

      // Check if selected date is a working day
      if (!isWorkingDay(selectedDate)) {
        setAttendanceData([]);
        setAutoMarkedCount(0);
        setAutoMarkEnabled(false);
        setLoading(false);
        setRefreshing(false);
        
        toast({
          title: "No Attendance Tracking",
          description: "Attendance is not tracked on weekends and holidays",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch(`/api/mentor/daily-attendance?mentorId=${mentorId}&date=${selectedDate}&autoMarkAbsent=true`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.attendance || []);
        setAutoMarkedCount(data.autoMarkedAbsent || 0);
        setAutoMarkEnabled(data.autoMarkEnabled || false);
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
      setRefreshing(false);
    }
  }, [selectedDate, toast]);

  // Fetch student's attendance history (only working days)
  const fetchStudentAttendanceHistory = async (studentId) => {
    try {
      const response = await fetch(`/api/mentor/student-attendance-history?studentId=${studentId}&days=30`);
      if (response.ok) {
        const data = await response.json();
        // Filter only working days
        const workingDayAttendance = (data.attendance || []).filter(record => 
          isWorkingDay(record.date)
        );
        setStudentAttendanceHistory(workingDayAttendance);
      }
    } catch (error) {
      console.error("Error fetching student attendance history:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance history",
        status: "error",
        duration: 2000,
      });
    }
  };

  // Fetch complete student profile
  const fetchStudentProfile = async (studentId) => {
    try {
      const response = await fetch(`/api/mentor/student-profile?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        return data.student || null;
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    }
    return null;
  };

  // Calculate working days between start and end date (excluding weekends and holidays)
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
        const dateString = current.toISOString().split('T')[0];
        if (isWorkingDay(dateString)) {
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
  const calculateInternshipDuration = (studentData) => {
    if (studentData?.duration_months) {
      return studentData.duration_months;
    }
    
    if (studentData?.start_date && studentData?.end_date) {
      const start = new Date(studentData.start_date);
      const end = new Date(studentData.end_date);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    }
    
    return 0;
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchStudents();
    fetchAttendanceData();
  };

  useEffect(() => {
    const loadData = async () => {
      const minimumLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      await Promise.all([
        fetchStudents(),
        fetchAttendanceData(),
        minimumLoadTime
      ]);
      
      setLoading(false);
      setMinimumLoading(false);
    };
    
    loadData();
  }, [fetchStudents, fetchAttendanceData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'late': return 'orange';
      case 'halfday': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return FaCheckCircle;
      case 'absent': return FaTimesCircle;
      case 'late': return FaExclamationTriangle;
      case 'halfday': return FaClock;
      default: return FaClock;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not recorded';
    try {
      const [hours, minutes, seconds] = timeString.split(':');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
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

  const viewStudentDetails = async (student) => {
    const studentAttendance = attendanceData.find(a => a.user_id === student.user_id);
    const completeProfile = await fetchStudentProfile(student.user_id);
    
    setSelectedStudent({ 
      ...student, 
      ...completeProfile,
      todayAttendance: studentAttendance 
    });
    await fetchStudentAttendanceHistory(student.user_id);
    onOpen();
  };

  const sendEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Attendance Follow-up&body=Dear Student,%0D%0A%0D%0AI would like to discuss your recent attendance. Please let me know when you're available for a quick chat.%0D%0A%0D%0ABest regards,%0D%0AYour Mentor`;
    }
  };

  const exportAttendance = async () => {
    if (!isWorkingDay(selectedDate)) {
      toast({
        title: "No Data to Export",
        description: "Attendance is not tracked on weekends and holidays",
        status: "info",
        duration: 3000,
      });
      return;
    }

    setExportLoading(true);
    try {
      const headers = ['Student ID', 'Name', 'Date', 'Status', 'Entry Time', 'Exit Time', 'Work Mode', 'Late Arrival', 'College', 'Auto Marked'];
      const csvData = attendanceData.map(record => [
        record.student_id,
        record.name,
        record.date,
        record.status,
        record.entry_time || 'N/A',
        record.exit_time || 'N/A',
        record.work_mode || 'N/A',
        record.is_late ? 'Yes' : 'No',
        record.college || 'N/A',
        record.is_auto_marked ? 'Yes' : 'No'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${selectedDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Attendance data has been exported to CSV",
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

  // Calculate stats from attendance data
  const stats = {
    total: students.length,
    present: attendanceData.filter(a => a.status === 'present').length,
    absent: attendanceData.filter(a => a.status === 'absent').length,
    late: attendanceData.filter(a => a.is_late).length,
    office: attendanceData.filter(a => a.work_mode === 'office').length,
    wfh: attendanceData.filter(a => a.work_mode === 'home').length,
    halfday: attendanceData.filter(a => a.status === 'halfday').length,
  };

  // Calculate attendance percentage based on internship working days
  const calculateAttendancePercentage = (studentData = null) => {
    if (!studentData) return 0;
    
    const startDate = studentData.start_date || studentData.internship_start_date;
    const endDate = studentData.end_date || studentData.internship_end_date;
    
    const totalWorkingDays = calculateWorkingDays(startDate, endDate);
    if (totalWorkingDays === 0) return 0;
    
    const presentDays = studentAttendanceHistory.filter(a => a.status === 'present').length;
    return Math.round((presentDays / totalWorkingDays) * 100);
  };

  // Calculate student performance metrics
  const calculateStudentPerformance = (studentData = null) => {
    if (!studentData) return { attendance: 0, punctuality: 0, consistency: 0 };
    
    const startDate = studentData.start_date || studentData.internship_start_date;
    const endDate = studentData.end_date || studentData.internship_end_date;
    
    const totalDays = calculateWorkingDays(startDate, endDate);
    if (totalDays === 0) return { attendance: 0, punctuality: 0, consistency: 0 };
    
    const presentDays = studentAttendanceHistory.filter(a => a.status === 'present').length;
    const onTimeDays = studentAttendanceHistory.filter(a => a.status === 'present' && !a.is_late).length;
    
    const attendance = Math.round((presentDays / totalDays) * 100);
    const punctuality = presentDays > 0 ? Math.round((onTimeDays / presentDays) * 100) : 0;
    const consistency = Math.round((attendance + punctuality) / 2);
    
    return { attendance, punctuality, consistency };
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const studentAttendance = attendanceData.find(a => a.user_id === student.user_id);
    
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.college?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || studentAttendance?.status === statusFilter;
    const matchesWorkMode = workModeFilter === "all" || studentAttendance?.work_mode === workModeFilter;
    
    return matchesSearch && matchesStatus && matchesWorkMode;
  });

  // Enhanced loading component
  if (minimumLoading || (loading && !refreshing)) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="2xl"
            bgGradient="linear(to-r, teal.500, teal.600)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaUserCheck} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
          <Text fontWeight="medium" fontSize="lg" color="black">
            Loading Attendance Dashboard...
          </Text>
          <Text fontSize="sm" color="gray.500">Gathering your students&apos; attendance data</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" fontFamily="'Segoe UI', sans-serif" py={4}>
      <Container maxW="7xl" px={4}>
        {/* Header with Back Button and Actions */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="blue"
            variant="outline"
            size="md"
            onClick={() => router.push("/mentor/dashboard")}
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

        {/* Weekend/Holiday Notice */}
        {!isWorkingDay(selectedDate) && (
          <Card mb={4} bg="blue.50" borderLeft="4px solid" borderColor="blue.500" borderRadius="xl">
            <CardBody py={3}>
              <Flex align="center">
                <Icon as={FaCalendarCheck} color="blue.500" boxSize={5} mr={3} />
                <Box>
                  <Text fontWeight="600" color="blue.700">
                    No Attendance Tracking Today
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Attendance is not tracked on weekends and holidays. Enjoy your day off!
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Auto-marked Absent Notification */}
        {autoMarkedCount > 0 && isWorkingDay(selectedDate) && (
          <Card mb={4} bg="orange.50" borderLeft="4px solid" borderColor="orange.500" borderRadius="xl">
            <CardBody py={3}>
              <Flex align="center">
                <Icon as={FaRobot} color="orange.500" boxSize={5} mr={3} />
                <Box>
                  <Text fontWeight="600" color="orange.700">
                    Auto-marked {autoMarkedCount} students as absent
                  </Text>
                  <Text fontSize="sm" color="orange.600">
                    {autoMarkEnabled 
                      ? `Students who didn't mark attendance for ${selectedDate} have been automatically marked as absent (after 6 PM)`
                      : `Auto-marking occurs only after 6 PM for students who haven't recorded attendance`}
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        )}

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
                <Icon as={FaCalendarCheck} boxSize={8} />
              </Box>
              <Heading size="xl" fontWeight="700" textAlign="center">
                <Text as="span" mr={2}>📊</Text>
                <Text
                  as="span"
                  bgGradient={headerGradient}
                  bgClip="text"
                > 
                  Student Attendance Tracker
                </Text>
              </Heading>

              <Text color="gray.600" fontSize="lg" fontWeight="500" maxW="2xl">
                Monitor your students&apos; daily attendance, work patterns, and performance metrics
                {!isWorkingDay(selectedDate) && (
                  <Text as="span" color="blue.600" fontWeight="600">
                    {" "}(No tracking on weekends/holidays)
                  </Text>
                )}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats - Only show for working days */}
        {isWorkingDay(selectedDate) && (
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
                label: "Present Today", 
                value: stats.present, 
                color: "green", 
                icon: FaCheckCircle,
                gradient: "linear(to-r, green.500, teal.500)"
              },
              { 
                label: "Absent Today", 
                value: stats.absent, 
                color: "red", 
                icon: FaTimesCircle,
                gradient: "linear(to-r, red.500, orange.500)"
              },
              { 
                label: "Late Arrivals", 
                value: stats.late, 
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
        )}

        {/* Controls Section */}
        <Card bg={cardBg} mb={6} borderRadius="2xl" boxShadow="lg">
          <CardBody py={5}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  📅 Select Date
                </Text>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
                {!isWorkingDay(selectedDate) && (
                  <Text fontSize="sm" color="blue.600" fontWeight="500" mt={1}>
                    Weekend/Holiday - No tracking
                  </Text>
                )}
              </Box>
              
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
                  📊 Filter by Status
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  💼 Work Mode
                </Text>
                <Select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="all">All Modes</option>
                  <option value="office">Office</option>
                  <option value="home">WFH</option>
                </Select>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Students Grid - Only show for working days */}
        {isWorkingDay(selectedDate) ? (
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
                  📋 Today&apos;s Attendance
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
                  {stats.present}/{stats.total} Present
                </Badge>
              </Flex>
            </Box>
            
            {filteredStudents.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} p={6}>
                {filteredStudents.map((student) => {
                  const studentAttendance = attendanceData.find(a => a.user_id === student.user_id);
                  const StatusIcon = getStatusIcon(studentAttendance?.status);
                  const statusColor = getStatusColor(studentAttendance?.status);
                  
                  return (
                    <Card 
                      key={student.user_id}
                      bg={cardBg}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={`${statusColor}.100`}
                      boxShadow="lg"
                      _hover={{ 
                        transform: "translateY(-8px)",
                        boxShadow: "2xl",
                        cursor: "pointer",
                        borderColor: `${statusColor}.300`,
                      }}
                      transition="all 0.3s ease-in-out"
                      onClick={() => viewStudentDetails(student)}
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Status indicator ribbon */}
                      <Box
                        position="absolute"
                        top={4}
                        right={-8}
                        bg={`${statusColor}.500`}
                        color="white"
                        px={8}
                        py={1}
                        transform="rotate(45deg)"
                        fontSize="xs"
                        fontWeight="bold"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        {studentAttendance?.status?.toUpperCase() || 'NO RECORD'}
                      </Box>

                      <CardBody p={5}>
                        <VStack spacing={4} align="start">
                          {/* Student Header */}
                          <Flex align="center" w="full">
                            <Box position="relative">
                              <Avatar
                                size="lg"
                                name={student.name}
                                src={student.profile_photo}
                                mr={4}
                                border="3px solid"
                                borderColor={`${statusColor}.300`}
                                boxShadow="lg"
                              />
                              <Box
                                position="absolute"
                                bottom={0}
                                right={4}
                                w={4}
                                h={4}
                                borderRadius="full"
                                bg={`${statusColor}.400`}
                                border="2px solid white"
                              />
                            </Box>
                            <Box flex="1">
                              <Text fontWeight="bold" fontSize="lg" color="blue.900" mb={1}>
                                {student.name}
                              </Text>
                              <Flex align="center" mb={1}>
                                <Icon as={FaIdCard} mr={2} color="blue.500" size="sm" />
                                <Text fontSize="sm" color="gray.600" fontWeight="500">
                                  Student ID: {student.student_id || 'Not assigned'}
                                </Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500">
                                {student.college}
                              </Text>
                            </Box>
                          </Flex>

                          {/* Auto-marked message for absent students */}
                          {studentAttendance?.is_auto_marked && (
                            <Box w="full" bg="orange.50" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200">
                              <Flex align="center">
                                <Icon as={FaRobot} color="orange.500" mr={2} />
                                <Text fontSize="sm" color="orange.700" fontWeight="500">
                                  No attendance marked for today
                                </Text>
                              </Flex>
                            </Box>
                          )}

                          {/* Time Details - Only show for present students */}
                          {studentAttendance && studentAttendance.status === 'present' && (
                            <VStack spacing={2} w="full" fontSize="sm" bg="gray.50" p={3} borderRadius="lg">
                              <Flex justify="space-between" w="full">
                                <Text color="gray.600" fontWeight="500">Check-in:</Text>
                                <Text fontWeight="bold" color="blue.600">{formatTime(studentAttendance.entry_time)}</Text>
                              </Flex>
                              <Flex justify="space-between" w="full">
                                <Text color="gray.600" fontWeight="500">Check-out:</Text>
                                <Text fontWeight="bold" color="blue.600">
                                  {formatTime(studentAttendance.exit_time) || 'Not recorded'}
                                </Text>
                              </Flex>
                            </VStack>
                          )}

                          {/* Work Mode & Status */}
                          <HStack spacing={3} w="full" mt={2}>
                            {studentAttendance?.work_mode && (
                              <Tag 
                                colorScheme={studentAttendance.work_mode === 'office' ? 'blue' : 'purple'}
                                size="md"
                                borderRadius="full"
                                fontWeight="600"
                                boxShadow="sm"
                              >
                                {studentAttendance.work_mode === 'office' ? '🏢 OFFICE' : '🏠 WFH'}
                              </Tag>
                            )}
                            <Badge
                              colorScheme={statusColor}
                              display="flex"
                              alignItems="center"
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="600"
                              ml="auto"
                            >
                              <Icon as={StatusIcon} mr={1} boxSize={3} />
                              {studentAttendance?.status?.toUpperCase() || 'NO RECORD'}
                            </Badge>
                          </HStack>

                          {/* Action Buttons */}
                          <HStack spacing={2} w="full" pt={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FaEye />}
                              flex="1"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewStudentDetails(student);
                              }}
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              View Details
                            </Button>
                            <Tooltip label="Send email" hasArrow>
                              <IconButton
                                size="sm"
                                colorScheme="green"
                                variant="outline"
                                icon={<FaEnvelope />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendEmail(student.email);
                                }}
                                aria-label="Send email"
                                borderRadius="lg"
                              />
                            </Tooltip>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            ) : (
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
                  {(searchTerm || statusFilter !== "all" || workModeFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setWorkModeFilter("all");
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
        ) : (
          // Weekend/Holiday Message
          <Card bg={cardBg} borderRadius="2xl" boxShadow="lg">
            <CardBody py={20}>
              <Center>
                <VStack spacing={6} textAlign="center">
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
                    <Icon as={FaCalendarCheck} boxSize={10} />
                  </Box>
                  <Heading size="lg" color="blue.600">
                    No Attendance Tracking Today
                  </Heading>
                  <Text color="gray.600" fontSize="lg" maxW="md">
                    Attendance is only tracked on working days (Monday-Friday, excluding holidays). 
                    Enjoy your weekend/holiday!
                  </Text>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    borderRadius="xl"
                    onClick={() => {
                      const today = new Date();
                      let nextWorkingDay = new Date(today);
                      
                      // Find next working day
                      do {
                        nextWorkingDay.setDate(nextWorkingDay.getDate() + 1);
                      } while (!isWorkingDay(nextWorkingDay.toISOString().split('T')[0]));
                      
                      setSelectedDate(nextWorkingDay.toISOString().split('T')[0]);
                    }}
                    leftIcon={<FaCalendarAlt />}
                    fontWeight="600"
                  >
                    View Next Working Day
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        )}
      </Container>

      {/* Student Details Modal */}
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
                  <Box>
                    <Heading size="lg" fontWeight="700">{selectedStudent.name}</Heading>
                    <Text fontSize="md" opacity={0.9}>
                      <strong>Student ID:</strong> {selectedStudent.student_id} • {selectedStudent.college}
                    </Text>
                    {selectedStudent.todayAttendance?.is_auto_marked && (
                      <Badge colorScheme="orange" mt={1} fontSize="xs">
                        <Icon as={FaRobot} mr={1} /> Auto-marked as absent
                      </Badge>
                    )}
                  </Box>
                </Flex>
              </ModalHeader>
              <ModalCloseButton color="white" size="lg" />
              
              <ModalBody p={0}>
                <Tabs colorScheme="blue" isFitted>
                  <TabList bg="gray.50" px={6} borderBottom="1px solid" borderColor="gray.200">
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaCalendarCheck} mr={3} />
                      Today&apos;s Attendance
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaHistory} mr={3} />
                      Attendance History
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaUserCircle} mr={3} />
                      Student Profile
                    </Tab>
                    <Tab py={4} fontSize="md" fontWeight="600" _selected={{ color: "blue.500", borderColor: "blue.500" }}>
                      <Icon as={FaChartBar} mr={3} />
                      Performance Analytics
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Today's Attendance Panel */}
                    <TabPanel p={6}>
                      {selectedStudent.todayAttendance ? (
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                          <Card 
                            bg={selectedStudent.todayAttendance.is_auto_marked ? "orange.50" : "blue.50"} 
                            borderLeft="4px solid" 
                            borderColor={selectedStudent.todayAttendance.is_auto_marked ? "orange.500" : "blue.500"} 
                            borderRadius="xl"
                          >
                            <CardBody>
                              <VStack align="start" spacing={4}>
                                <Box>
                                  <Badge 
                                    colorScheme={getStatusColor(selectedStudent.todayAttendance.status)}
                                    fontSize="md"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    fontWeight="700"
                                  >
                                    {selectedStudent.todayAttendance.status?.toUpperCase()}
                                  </Badge>
                                  {selectedStudent.todayAttendance.is_auto_marked && (
                                    <Badge colorScheme="orange" ml={2} fontSize="sm" px={2} py={1}>
                                      Auto-marked
                                    </Badge>
                                  )}
                                </Box>
                                <Box>
                                  <Text fontWeight="600" color="gray.600" mb={3} fontSize="lg">Time Details</Text>
                                  <VStack align="start" spacing={2}>
                                    <Text fontSize="md"><strong>Check-in:</strong> {formatTime(selectedStudent.todayAttendance.entry_time) || 'Not recorded'}</Text>
                                    <Text fontSize="md"><strong>Check-out:</strong> {formatTime(selectedStudent.todayAttendance.exit_time) || 'Not recorded'}</Text>
                                  </VStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                          
                          <Card bg="green.50" borderLeft="4px solid" borderColor="green.500" borderRadius="xl">
                            <CardBody>
                              <VStack align="start" spacing={4}>
                                <Text fontWeight="600" color="gray.600" fontSize="lg">Work Details</Text>
                                {selectedStudent.todayAttendance.work_mode ? (
                                  <Tag 
                                    colorScheme={selectedStudent.todayAttendance.work_mode === 'office' ? 'blue' : 'purple'}
                                    size="lg"
                                    fontWeight="600"
                                    borderRadius="full"
                                  >
                                    {selectedStudent.todayAttendance.work_mode === 'office' ? '🏢 Office Work' : '🏠 Work From Home'}
                                  </Tag>
                                ) : (
                                  <Text color="gray.500" fontSize="md">No work mode specified</Text>
                                )}
                                {selectedStudent.todayAttendance.is_late && (
                                  <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="full">
                                    ⚠️ Late Arrival
                                  </Badge>
                                )}
                                {selectedStudent.todayAttendance.is_auto_marked && (
                                  <Box bg="orange.100" p={3} borderRadius="lg" w="full">
                                    <Text fontSize="sm" color="orange.700" fontWeight="500">
                                      This student was automatically marked as absent because they didn&apos;t record attendance for today.
                                    </Text>
                                  </Box>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      ) : (
                        <Center py={12}>
                          <VStack spacing={4}>
                            <Icon as={FaTimesCircle} boxSize={12} color="gray.400" />
                            <Text color="gray.500" fontSize="lg" fontWeight="600">No attendance record for today</Text>
                          </VStack>
                        </Center>
                      )}
                    </TabPanel>

                    {/* Attendance History Panel */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="start">
                        <Card w="full" bg="blue.50" borderRadius="xl">
                          <CardBody py={4}>
                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontWeight="600" color="blue.700" fontSize="lg">
                                  Overall Attendance (Internship Period)
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                  {calculateAttendancePercentage(selectedStudent)}%
                                </Text>
                                <Text fontSize="sm" color="blue.600" mt={1}>
                                  Based on {calculateWorkingDays(selectedStudent.start_date, selectedStudent.end_date)} working days
                                </Text>
                              </Box>
                              <Progress 
                                value={calculateAttendancePercentage(selectedStudent)} 
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
                                {studentAttendanceHistory.slice(0, 15).map((record, index) => (
                                  <Tr key={index} _hover={{ bg: "gray.50" }}>
                                    <Td py={3} fontSize="md" fontWeight="500">{formatDate(record.date)}</Td>
                                    <Td>
                                      <Badge 
                                        colorScheme={getStatusColor(record.status)}
                                        fontSize="sm"
                                        fontWeight="600"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {record.status}
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
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} alignItems="start">
                        {/* Left Column - Personal & Contact Info */}
                        <VStack spacing={6} align="start">
                          {/* Personal Information */}
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
                        </VStack>

                        {/* Right Column - Academic & Internship Info */}
                        <VStack spacing={6} align="start">
                          {/* Academic Information */}
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
                                  {selectedStudent.start_date && (
                                    <HStack>
                                      <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} />
                                      <Text fontWeight="500"><strong>Start Date:</strong> {formatDate(selectedStudent.start_date)}</Text>
                                    </HStack>
                                  )}
                                  {selectedStudent.end_date && (
                                    <HStack>
                                      <Icon as={FaCalendarCheck} color="blue.500" boxSize={5} />
                                      <Text fontWeight="500"><strong>End Date:</strong> {formatDate(selectedStudent.end_date)}</Text>
                                    </HStack>
                                  )}
                                  {selectedStudent.duration_months && (
                                    <HStack>
                                      <Icon as={FaClock} color="blue.500" boxSize={5} />
                                      <Text fontWeight="500"><strong>Duration:</strong> {calculateInternshipDuration(selectedStudent)} months</Text>
                                    </HStack>
                                  )}
                                  <HStack>
                                    <Icon as={FaBuilding} color="blue.500" boxSize={5} />
                                    <Text fontWeight="500">
                                      <strong>Working Days:</strong> {calculateWorkingDays(selectedStudent.start_date, selectedStudent.end_date)}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}

                          {/* Resume Section */}
                          {(selectedStudent.resume || selectedStudent.application_resume || selectedStudent.resume_url) && (
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
                                    href={selectedStudent.resume || selectedStudent.application_resume || selectedStudent.resume_url} 
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
                      </Grid>
                    </TabPanel>

                    {/* Performance Analytics Panel */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="start">
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                          {[
                            { 
                              label: "Attendance Rate", 
                              value: calculateStudentPerformance(selectedStudent).attendance, 
                              color: "green",
                              icon: FaCheckCircle,
                              gradient: "linear(to-r, green.500, teal.500)"
                            },
                            { 
                              label: "Punctuality Score", 
                              value: calculateStudentPerformance(selectedStudent).punctuality, 
                              color: "blue",
                              icon: FaClock,
                              gradient: "linear(to-r, blue.500, cyan.500)"
                            },
                            { 
                              label: "Overall Consistency", 
                              value: calculateStudentPerformance(selectedStudent).consistency, 
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
                                Student has maintained <strong>{calculateAttendancePercentage(selectedStudent)}%</strong> attendance out of <strong>{calculateWorkingDays(selectedStudent.start_date, selectedStudent.end_date)}</strong> working days in their <strong>{calculateInternshipDuration(selectedStudent)}-month</strong> internship period.
                              </Text>
                              <Progress 
                                value={calculateAttendancePercentage(selectedStudent)} 
                                colorScheme="blue" 
                                w="full"
                                h="3"
                                borderRadius="full"
                              />
                              <HStack spacing={6} mt={2}>
                                <Stat>
                                  <StatLabel color="gray.600">Present Days</StatLabel>
                                  <StatNumber color="green.500">
                                    {studentAttendanceHistory.filter(a => a.status === 'present').length}
                                  </StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel color="gray.600">Absent Days</StatLabel>
                                  <StatNumber color="red.500">
                                    {studentAttendanceHistory.filter(a => a.status === 'absent').length}
                                  </StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel color="gray.600">Late Days</StatLabel>
                                  <StatNumber color="orange.500">
                                    {studentAttendanceHistory.filter(a => a.is_late).length}
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
                  Send Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}