import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Center,
  Container,
  HStack,
  VStack,
  Icon,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  Grid,
  GridItem,
  Collapse,
  AspectRatio,
  Textarea
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBuilding,
  FaHome,
  FaChartPie,
  FaFilter,
  FaInfoCircle,
  FaUserClock,
  FaChevronDown,
  FaChevronUp,
  FaHistory,
  FaDownload,
  FaStickyNote
} from "react-icons/fa";

export default function AttendanceHistory() {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    status: "",
    workMode: "",
    search: "",
    sortBy: "date-desc"
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    office: 0,
    home: 0,
    totalHours: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const headerGradient = useColorModeValue("linear(to-r, blue.500, purple.500)", "linear(to-r, blue.300, purple.300)");
  const statCardBg = useColorModeValue("white", "gray.750");
  const filterCardBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.100", "blue.800");

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Fixed: Calculate hours worked from time strings
  const calculateHoursWorkedValue = useCallback((entryTime, exitTime) => {
    if (!entryTime || !exitTime) return 0;

    try {
      // Parse PostgreSQL time with timezone format
      const parseTime = (timeStr) => {
        if (!timeStr) return null;
        
        // Remove timezone part and extract time
        const timePart = timeStr.split('+')[0].split('-')[0].trim();
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) return null;
        
        return hours + minutes / 60;
      };

      const entryHours = parseTime(entryTime);
      const exitHours = parseTime(exitTime);

      if (entryHours === null || exitHours === null) return 0;

      // Handle case where exit time might be next day
      let hoursDiff = exitHours - entryHours;
      if (hoursDiff < 0) hoursDiff += 24;

      return Math.max(0, hoursDiff);
    } catch (error) {
      console.error('Error calculating hours:', error);
      return 0;
    }
  }, []);

  // ✅ FIXED: Calculate statistics from ALL data (including absent days)
  const calculateStats = useCallback((data) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let office = 0;
    let home = 0;

    data.forEach(item => {
      // Count work modes only for days with attendance
      if (item.has_attendance) {
        if (item.work_mode === "office") office++;
        if (item.work_mode === "home") home++;
      }

      // Count status based on display_status
      if (item.display_status === "present") {
        present++;
      } else if (item.display_status === "late") {
        present++; // Late is counted as present
        late++; // But also counted separately for display
      } else if (item.display_status === "absent") {
        absent++;
      }
    });

    // Calculate total hours worked (only for days with both entry and exit)
    let totalHours = 0;
    data.forEach(item => {
      if (item.entry_time && item.exit_time) {
        totalHours += calculateHoursWorkedValue(item.entry_time, item.exit_time);
      }
    });

    setStats({
      present,
      late,
      absent,
      office,
      home,
      totalHours: Math.round(totalHours * 10) / 10
    });
  }, [calculateHoursWorkedValue]);

  // Fixed: Get user ID from localStorage
  useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user && user.userId) {
        setUserId(user.userId);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      router.push("/login");
    }
  }, [router]);

  // Fixed: Fetch attendance history
  useEffect(() => {
    if (!userId) return;

    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/history?user_id=${userId}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();

        if (data.success && data.data) {
          setAttendanceData(data.data);
          setFilteredData(data.data);
          calculateStats(data.data);
        } else {
          console.error("API returned unsuccessful response:", data);
          setAttendanceData([]);
          setFilteredData([]);
        }
      } catch (err) {
        console.error("Error fetching attendance history:", err);
        setAttendanceData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, [userId, calculateStats]);

  // Fixed: Apply filters
  useEffect(() => {
    let filtered = [...attendanceData];

    // Month filter
    if (filters.month) {
      filtered = filtered.filter(item => {
        const date = new Date(item.date);
        return (date.getMonth() + 1).toString() === filters.month;
      });
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear().toString() === filters.year;
      });
    }

    // Status filter - use display_status for filtering
    if (filters.status) {
      filtered = filtered.filter(item => item.display_status === filters.status);
    }

    // Work mode filter - only apply to days with attendance
    if (filters.workMode) {
      filtered = filtered.filter(item => 
        !item.has_attendance ? false : item.work_mode === filters.workMode
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.date.toLowerCase().includes(searchTerm) ||
        (item.display_status && item.display_status.toLowerCase().includes(searchTerm)) ||
        (item.work_mode && item.work_mode.toLowerCase().includes(searchTerm)) ||
        (item.note && item.note.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "hours-asc":
        filtered.sort((a, b) => {
          const aHours = calculateHoursWorkedValue(a.entry_time, a.exit_time);
          const bHours = calculateHoursWorkedValue(b.entry_time, b.exit_time);
          return (aHours || 0) - (bHours || 0);
        });
        break;
      case "hours-desc":
        filtered.sort((a, b) => {
          const aHours = calculateHoursWorkedValue(a.entry_time, a.exit_time);
          const bHours = calculateHoursWorkedValue(b.entry_time, b.exit_time);
          return (bHours || 0) - (aHours || 0);
        });
        break;
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    setFilteredData(filtered);
    calculateStats(filtered);
  }, [filters, attendanceData, calculateStats, calculateHoursWorkedValue]);

  // Fixed: Status color mapping - use display_status for UI
  const getStatusColor = (displayStatus) => {
    switch (displayStatus) {
      case "present": return "green";
      case "late": return "orange";
      case "absent": return "red";
      default: return "gray";
    }
  };

  // Fixed: Status icon mapping - use display_status for UI
  const getStatusIcon = (displayStatus) => {
    switch (displayStatus) {
      case "present": return FaCheckCircle;
      case "late": return FaClock;
      case "absent": return FaTimesCircle;
      default: return FaCheckCircle;
    }
  };

  // Fixed: Work mode icon mapping
  const getWorkModeIcon = (mode) => {
    switch (mode) {
      case "office": return FaBuilding;
      case "home": return FaHome;
      default: return FaBuilding;
    }
  };

  // Fixed: Time formatting for display
  const formatTime = (time) => {
    if (!time) return "-";
    return time; // API already formats the time
  };

  // Fixed: Date formatting
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Fixed: Get unique years from data
  const getUniqueYears = () => {
    const years = new Set();
    attendanceData.forEach(item => {
      try {
        const year = new Date(item.date).getFullYear();
        years.add(year);
      } catch (error) {
        console.error('Error parsing date for year:', item.date);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  // Fixed: Calculate hours worked for display
  const calculateHoursWorked = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return "-";

    try {
      const hours = calculateHoursWorkedValue(entryTime, exitTime);
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);

      if (wholeHours === 0 && minutes === 0) return "-";
      
      return `${wholeHours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating hours worked:', error);
      return "-";
    }
  };

  // Fixed: Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ["Date", "Status", "Work Mode", "Entry Time", "Exit Time", "Hours Worked", "Note"];
      const csvData = filteredData.map(record => [
        formatDate(record.date),
        record.display_status || "Unknown",
        record.has_attendance ? (record.work_mode?.charAt(0).toUpperCase() + record.work_mode?.slice(1) || "Office") : "-",
        formatTime(record.formatted_entry_time),
        formatTime(record.formatted_exit_time),
        record.entry_time && record.exit_time ? calculateHoursWorked(record.entry_time, record.exit_time) : "-",
        record.note || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-history-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Fixed: View note function
  const viewNote = (note) => {
    setSelectedNote(note || "No note available");
    setNoteModalOpen(true);
  };

  // Centered loading component
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
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text fontFamily="'Segoe UI', sans-serif">Loading attendance history...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={8}>
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
                  <Icon as={FaHistory} boxSize={8} />
                  <Heading size="xl" fontFamily="'Segoe UI', sans-serif">
                    Attendance History
                  </Heading>
                </HStack>
                <Text mt={2} fontSize="lg" opacity={0.9}>
                  Track and analyze your attendance records
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
            onClick={() => router.push("/student/attendance")}
            leftIcon={<FaArrowLeft />}
            fontFamily="'Segoe UI', sans-serif"
            borderRadius="full"
            size={isMobile ? "sm" : "md"}
          >
            Back
          </Button>

          <Tooltip label="View Statistics" hasArrow>
            <IconButton
              position="absolute"
              right={4}
              top={4}
              aria-label="View Statistics"
              icon={<FaChartPie />}
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={onOpen}
              borderRadius="full"
              size={isMobile ? "sm" : "md"}
            />
          </Tooltip>
        </Box>

        {/* Statistics Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">
              <HStack>
                <Icon as={FaChartPie} color={accentColor} />
                <Text>Attendance Statistics</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={4}>
                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Present</StatLabel>
                    <StatNumber color="green.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.present}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {attendanceData.length > 0 ? Math.round((stats.present / attendanceData.length) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={attendanceData.length > 0 ? (stats.present / attendanceData.length) * 100 : 0} colorScheme="green" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Late</StatLabel>
                    <StatNumber color="orange.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.late}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {stats.present > 0 ? Math.round((stats.late / stats.present) * 100) : 0}% of present
                    </StatHelpText>
                    <Progress value={stats.present > 0 ? (stats.late / stats.present) * 100 : 0} colorScheme="orange" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Absent</StatLabel>
                    <StatNumber color="red.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.absent}
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      {attendanceData.length > 0 ? Math.round((stats.absent / attendanceData.length) * 100) : 0}% of total
                    </StatHelpText>
                    <Progress value={attendanceData.length > 0 ? (stats.absent / attendanceData.length) * 100 : 0} colorScheme="red" size="sm" mt={2} />
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Total Hours</StatLabel>
                    <StatNumber color="blue.500" fontFamily="'Segoe UI', sans-serif">
                      {stats.totalHours}h
                    </StatNumber>
                    <StatHelpText fontFamily="'Segoe UI', sans-serif">
                      Across all attendance records
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
                  <Stat>
                    <StatLabel fontFamily="'Segoe UI', sans-serif">Work Mode</StatLabel>
                    <HStack spacing={4} mt={2} justify="center">
                      <VStack>
                        <Icon as={FaBuilding} color="blue.500" boxSize={6} />
                        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="bold">{stats.office}</Text>
                        <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm">Office</Text>
                      </VStack>
                      <VStack>
                        <Icon as={FaHome} color="green.500" boxSize={6} />
                        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="bold">{stats.home}</Text>
                        <Text fontFamily="'Segoe UI', sans-serif" fontSize="sm">Home</Text>
                      </VStack>
                    </HStack>
                  </Stat>
                </Card>
              </SimpleGrid>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Note View Modal */}
        <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="'Segoe UI', sans-serif">
              <HStack>
                <Icon as={FaStickyNote} color={accentColor} />
                <Text>Attendance Note</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Textarea
                value={selectedNote}
                isReadOnly
                rows={6}
                fontFamily="'Segoe UI', sans-serif"
                placeholder="No note available for this attendance record."
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
            </Box>
            <VStack>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaCheckCircle} boxSize={3} />
                  <Text>Present</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="green.500" fontFamily="'Segoe UI', sans-serif">
                {stats.present}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaClock} boxSize={16} color="orange.500" />
            </Box>
            <VStack>
              <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaClock} boxSize={3} />
                  <Text>Late</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500" fontFamily="'Segoe UI', sans-serif">
                {stats.late}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaTimesCircle} boxSize={16} color="red.500" />
            </Box>
            <VStack>
              <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaTimesCircle} boxSize={3} />
                  <Text>Absent</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="red.500" fontFamily="'Segoe UI', sans-serif">
                {stats.absent}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaBuilding} boxSize={16} color="blue.500" />
            </Box>
            <VStack>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaBuilding} boxSize={3} />
                  <Text>Office</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500" fontFamily="'Segoe UI', sans-serif">
                {stats.office}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaHome} boxSize={16} color="green.500" />
            </Box>
            <VStack>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaHome} boxSize={3} />
                  <Text>Home</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="green.500" fontFamily="'Segoe UI', sans-serif">
                {stats.home}
              </Text>
            </VStack>
          </Card>

          <Card bg={statCardBg} p={3} borderRadius="xl" boxShadow="md" textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" top={-2} right={-2} opacity={0.1}>
              <Icon as={FaUserClock} boxSize={16} color="purple.500" />
            </Box>
            <VStack>
              <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaUserClock} boxSize={3} />
                  <Text>Hours</Text>
                </HStack>
              </Badge>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500" fontFamily="'Segoe UI', sans-serif">
                {stats.totalHours}
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
                    setFilters({ month: "", year: "", status: "", workMode: "", search: "", sortBy: "date-desc" });
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
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Time Period</Text>
                      <HStack spacing={2} width="100%">
                        <Select
                          placeholder="Month"
                          value={filters.month}
                          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                          borderRadius="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </Select>

                        <Select
                          placeholder="Year"
                          value={filters.year}
                          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                          borderRadius="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          {getUniqueYears().map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </Select>
                      </HStack>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Status & Mode</Text>
                      <HStack spacing={2} width="100%">
                        <Select
                          placeholder="Status"
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          borderRadius="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </Select>

                        <Select
                          placeholder="Work Mode"
                          value={filters.workMode}
                          onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                          borderRadius="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          <option value="office">Office</option>
                          <option value="home">Home</option>
                        </Select>
                      </HStack>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Sort & Search</Text>
                      <HStack spacing={2} width="100%">
                        <Select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                          borderRadius="lg"
                          fontFamily="'Segoe UI', sans-serif"
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          <option value="date-desc">Newest First</option>
                          <option value="date-asc">Oldest First</option>
                          <option value="hours-desc">Most Hours First</option>
                          <option value="hours-asc">Least Hours First</option>
                        </Select>
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>

                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by date, status, work mode, or note..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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

        {/* Results Count and Actions */}
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <HStack>
            <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontWeight="medium">
              Showing {filteredData.length} of {attendanceData.length} records
            </Text>
            <Badge colorScheme={filteredData.length === attendanceData.length ? "gray" : "blue"} fontFamily="'Segoe UI', sans-serif">
              {filteredData.length === attendanceData.length ? "No filters" : "Filtered"}
            </Badge>
          </HStack>

          <HStack spacing={3}>
            <HStack>
              <Icon as={FaInfoCircle} color="gray.500" boxSize={4} />
              <Text fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                Last updated: {new Date().toLocaleDateString('en-GB')}
              </Text>
            </HStack>

            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<FaDownload />}
              onClick={exportToCSV}
              fontFamily="'Segoe UI', sans-serif"
              borderRadius="lg"
              isDisabled={filteredData.length === 0}
            >
              Export CSV
            </Button>
          </HStack>
        </Flex>

        {/* Attendance Table */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={headerGradient}>
                <Tr>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Date</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Status</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Work Mode</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Entry Time</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Exit Time</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Hours Worked</Th>
                  <Th color="black" fontFamily="'Segoe UI', sans-serif" textAlign="center">Note</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={12}>
                      <VStack spacing={3}>
                        <Icon as={FaCalendarAlt} boxSize={10} color="gray.400" />
                        <Text fontFamily="'Segoe UI', sans-serif" color={textColor} fontSize="lg">
                          No attendance records found
                        </Text>
                        <Text fontFamily="'Segoe UI', sans-serif" color="gray.500">
                          {attendanceData.length === 0 ? 
                            "You haven't marked any attendance yet." : 
                            "Try adjusting your filters or search term."
                          }
                        </Text>
                        {attendanceData.length > 0 && (
                          <Button
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => setFilters({ month: "", year: "", status: "", workMode: "", search: "", sortBy: "date-desc" })}
                            fontFamily="'Segoe UI', sans-serif"
                            size="sm"
                            mt={2}
                          >
                            Clear all filters
                          </Button>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  filteredData.map((record) => (
                    <Tr key={record.date} _hover={{ bg: subtleBg }} transition="all 0.2s">
                      <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium" textAlign="center">
                        <VStack spacing={0}>
                          <Text>{formatDate(record.date)}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </Text>
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <Badge
                          colorScheme={getStatusColor(record.display_status)}
                          fontFamily="'Segoe UI', sans-serif"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          <HStack spacing={1} justify="center">
                            <Icon as={getStatusIcon(record.display_status)} boxSize={3} />
                            <Text>{record.display_status}</Text>
                          </HStack>
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        {record.has_attendance ? (
                          <Badge
                            colorScheme={record.work_mode === "office" ? "blue" : "green"}
                            fontFamily="'Segoe UI', sans-serif"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="sm"
                          >
                            <HStack spacing={1} justify="center">
                              <Icon as={getWorkModeIcon(record.work_mode)} boxSize={3} />
                              <Text>{record.work_mode ? record.work_mode.charAt(0).toUpperCase() + record.work_mode.slice(1) : "Office"}</Text>
                            </HStack>
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.500">-</Text>
                        )}
                      </Td>
                      <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium" textAlign="center">
                        {record.formatted_entry_time}
                      </Td>
                      <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium" textAlign="center">
                        {record.formatted_exit_time}
                      </Td>
                      <Td fontFamily="'Segoe UI', sans-serif" fontWeight="medium" textAlign="center">
                        {record.entry_time && record.exit_time ? (
                          <Badge
                            colorScheme={calculateHoursWorkedValue(record.entry_time, record.exit_time) >= 8 ? "green" : "orange"}
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {calculateHoursWorked(record.entry_time, record.exit_time)}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td textAlign="center">
                        {record.note ? (
                          <Tooltip label="View note" hasArrow>
                            <IconButton
                              icon={<FaStickyNote />}
                              aria-label="View note"
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => viewNote(record.note)}
                            />
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.500">-</Text>
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}