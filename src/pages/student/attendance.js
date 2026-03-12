import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  useColorModeValue,
  keyframes,
  useToast,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Stack,
  Badge,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Progress,
  SimpleGrid,
  useBreakpointValue,
  Container,
  Grid,
  GridItem,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FaCalendarDay,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaCalendarCheck,
  FaLaptopHouse,
  FaBuilding,
  FaChartLine,
  FaHistory,
  FaInfoCircle,
  FaDoorOpen,
  FaDoorClosed,
  FaAward,
  FaTimesCircle,
  FaStickyNote,
  FaCheck,
  FaClock,
  FaUserTie,
  FaRocket,
  FaUmbrellaBeach,
  FaCalendarTimes
} from "react-icons/fa";
import { motion } from "framer-motion";

// Animation components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function MarkAttendance() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [student, setStudent] = useState(null);
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("office");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internshipInfo, setInternshipInfo] = useState(null);
  const [canMarkAttendance, setCanMarkAttendance] = useState(false);
  const [attendanceRestriction, setAttendanceRestriction] = useState({ canMark: false, reason: "Loading..." });
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [submittingExit, setSubmittingExit] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({ 
    present: 0, 
    total: 0, 
    absent: 0,
    percentage: 0 
  });
  const [lastAttendance, setLastAttendance] = useState(null);
  const [todayEntryMarked, setTodayEntryMarked] = useState(false);
  const [todayExitMarked, setTodayExitMarked] = useState(false);
  const [absentNote, setAbsentNote] = useState("");
  const [attendanceType, setAttendanceType] = useState("");
  const [noteMode, setNoteMode] = useState(""); // "before" or "after"
  const [mentorAllocated, setMentorAllocated] = useState(false);
  const [internshipStarted, setInternshipStarted] = useState(false);
  const [internshipEnded, setInternshipEnded] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidaysLoaded, setHolidaysLoaded] = useState(false);

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const gradientBg = useColorModeValue("linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)");

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Check if today is a weekend
  const isWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  };

  // Check if today is a public holiday
  const checkIfHoliday = useCallback((dateToCheck = new Date()) => {
    if (!publicHolidays || publicHolidays.length === 0) return false;
    
    const todayStr = dateToCheck.toISOString().split('T')[0];
    const holiday = publicHolidays.find(h => h.date === todayStr);
    
    if (holiday) {
      setHolidayName(holiday.name);
      return true;
    }
    
    return false;
  }, [publicHolidays]);

  // Check if current time is within office hours (9:30 AM to 5:45 PM)
  const isWithinOfficeHours = useCallback(() => {
    if (isWeekend() || isHoliday) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // Office hours: 9:30 AM (9*60+30 = 570) to 5:45 PM (17*60+45 = 1065)
    return totalMinutes >= 570 && totalMinutes <= 1065;
  }, [isHoliday]);

  // Check if it's time to mark entry (after 9:30 AM)
  const canMarkEntryNow = useCallback(() => {
    if (isWeekend() || isHoliday) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // Entry allowed from 9:30 AM onwards (570 minutes)
    return totalMinutes >= 570;
  }, [isHoliday]);

  // Check if it's time to mark exit (after 5:00 PM)
  const canMarkExitNow = useCallback(() => {
    if (isWeekend() || isHoliday) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // Exit allowed from 5:00 PM onwards (1020 minutes)
    return totalMinutes >= 1020;
  }, [isHoliday]);

  // Check if office hours have ended (after 5:45 PM)
  const isAfterOfficeHours = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // After 5:45 PM (1065 minutes)
    return totalMinutes > 1065;
  }, []);

  // Check if student is late (arrives after 10:00 AM)
  const isLate = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // Late if after 10:00 AM (600 minutes)
    return totalMinutes > 600;
  }, []);

  // Check if student is leaving early (before 5:30 PM)
  const isLeavingEarly = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    // Leaving early if before 5:30 PM (1050 minutes)
    return totalMinutes < 1050;
  }, []);

  // Get current time status for display
  const getTimeStatus = useCallback(() => {
    if (isWeekend()) {
      return { status: "weekend", message: "Weekend - No attendance today it's the weekend." };
    }
    
    if (isHoliday) {
      return { status: "holiday", message: `Public Holiday - ${holidayName}` };
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;
    
    if (totalMinutes < 570) {
      return { status: "before_office", message: "Office hours start at 9:30 AM" };
    } else if (totalMinutes <= 1065) {
      return { status: "office_hours", message: "Office hours: 9:30 AM - 5:45 PM" };
    } else {
      return { status: "after_office", message: "Office hours have ended" };
    }
  }, [isHoliday, holidayName]);

  // Format date to dd/mm/yyyy
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  // Format time to hh:mm AM/PM
  const formatTime = useCallback((timeString) => {
    if (!timeString || timeString === "N/A") return "N/A";
    
    try {
      // If it's already formatted by the API, return as is
      if (typeof timeString === 'string' && (timeString.includes('AM') || timeString.includes('PM'))) {
        return timeString;
      }
      
      // Handle other formats if needed
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error, "Input:", timeString);
      return "N/A";
    }
  }, []);

  // Check if attendance can be marked based on internship status - FIXED VERSION
  const checkAttendanceEligibility = useCallback((internshipData) => {
    if (!internshipData) {
      return { 
        canMark: false, 
        reason: "No accepted internship application found.",
        mentorAllocated: false,
        internshipStarted: false,
        internshipEnded: false
      };
    }

    // Check if mentor is allocated
    const hasMentor = internshipData.mentor && internshipData.mentor.trim() !== '';
    setMentorAllocated(hasMentor);

    // If mentor is allocated, fetch mentor name
    if (hasMentor) {
      try {
        fetch(`/api/mentor-name?mentorId=${internshipData.mentor}`)
          .then(res => res.json())
          .then(mentorData => {
            setMentorName(mentorData.name || internshipData.mentor);
          })
          .catch(() => {
            setMentorName(internshipData.mentor);
          });
      } catch (error) {
        setMentorName(internshipData.mentor);
      }
    } else {
      setMentorName("");
    }

    // Check if today is within internship period - FIXED LOGIC
    const today = new Date();
    const startDate = new Date(internshipData.start_date);
    const endDate = new Date(internshipData.end_date);
    
    // Set time to midnight for accurate comparison
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const startDateStart = new Date(startDate);
    startDateStart.setHours(0, 0, 0, 0);
    
    const endDateEnd = new Date(endDate);
    endDateEnd.setHours(23, 59, 59, 999);
    
    const hasStarted = todayStart >= startDateStart;
    const hasEnded = todayStart > endDateEnd;
    
    console.log('Internship Date Check:', {
      today: todayStart.toISOString(),
      startDate: startDateStart.toISOString(),
      endDate: endDateEnd.toISOString(),
      hasStarted,
      hasEnded
    });

    setInternshipStarted(hasStarted);
    setInternshipEnded(hasEnded);

    if (!hasMentor) {
      return {
        canMark: false,
        reason: "Mentor not allocated. Please wait for mentor assignment.",
        mentorAllocated: false,
        internshipStarted: hasStarted,
        internshipEnded: hasEnded
      };
    } else if (!hasStarted) {
      const formattedStartDate = new Date(internshipData.start_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return {
        canMark: false,
        reason: `Internship has not started yet. Start date: ${formattedStartDate}`,
        mentorAllocated: true,
        internshipStarted: false,
        internshipEnded: false
      };
    } else if (hasEnded) {
      const formattedEndDate = new Date(internshipData.end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return {
        canMark: false,
        reason: `Internship has ended. End date: ${formattedEndDate}`,
        mentorAllocated: true,
        internshipStarted: true,
        internshipEnded: true
      };
    }

    return { 
      canMark: true, 
      reason: "",
      mentorAllocated: true,
      internshipStarted: true,
      internshipEnded: false
    };
  }, []);

  // Open absent note modal
  const openAbsentNoteModal = (type, mode = "before") => {
    setAttendanceType(type);
    setNoteMode(mode);
    setAbsentNote("");
    onOpen();
  };

  // ✅ Submit Attendance (entry or exit) with time validation
  const markAttendance = async (type, note = "") => {
    if (!attendanceRestriction.canMark) {
      toast({
        title: "Cannot mark attendance",
        description: attendanceRestriction.reason,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (isWeekend()) {
      toast({
        title: "Weekend",
        description: "Attendance cannot be marked on weekends.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (isHoliday) {
      toast({
        title: "Public Holiday",
        description: `Attendance cannot be marked on ${holidayName}.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (type === "entry") {
      setSubmittingEntry(true);
    } else {
      setSubmittingExit(true);
    }
    
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          date,
          work_mode: mode,
          type, // "entry" or "exit"
          is_late: type === "entry" && isLate(),
          is_early: type === "exit" && isLeavingEarly(),
          note: note || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        let description = "";
        
        if (type === "entry") {
          if (isLate()) {
            description = "You've been marked as late today (arrived after 10:00 AM).";
          } else {
            description = "Entry marked successfully! Have a productive day!";
          }
          
          setTodayEntryMarked(true);
          
          // ✅ Student is now counted as PRESENT when they mark entry
          toast({
            title: "Entry marked successfully!",
            description: description + " You are now marked present for today.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        } else {
          if (isLeavingEarly()) {
            description = "You've been marked as leaving early today (before 5:30 PM).";
          } else {
            description = "Exit marked successfully! Great work today!";
          }
          
          setTodayExitMarked(true);
          
          toast({
            title: `${type === "entry" ? "Entry" : "Exit"} marked successfully!`,
            description: description,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
        
        if (note) {
          description += " Note added.";
        }
        
        // Refresh the page to update status
        router.replace(router.asPath);
      } else {
        toast({
          title: "Error marking attendance",
          description: data.error,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err) {
      toast({
        title: "Server error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      if (type === "entry") {
        setSubmittingEntry(false);
      } else {
        setSubmittingExit(false);
      }
      onClose();
    }
  };

  // Submit note only (without marking attendance)
  const submitNoteOnly = async () => {
    setSubmittingNote(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          date,
          note: absentNote,
          note_only: true, // This flag tells the API to only add a note
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Note added successfully!",
          description: "Your note has been added to today's attendance record.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        
        // Refresh the page to update status
        router.replace(router.asPath);
      } else {
        toast({
          title: "Error adding note",
          description: data.error,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err) {
      toast({
        title: "Server error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setSubmittingNote(false);
      onClose();
    }
  };

  // Submit with note based on mode
  const submitWithNote = () => {
    if (noteMode === "before") {
      markAttendance(attendanceType, absentNote);
    } else {
      submitNoteOnly();
    }
  };

  // Check if note features should be disabled
  const shouldDisableNotes = useCallback(() => {
    return isWeekend() || isHoliday || isAfterOfficeHours() || !attendanceRestriction.canMark;
  }, [isHoliday, isAfterOfficeHours, attendanceRestriction.canMark]);

  // Combine all restrictions
  const canMarkEntry = attendanceRestriction.canMark && !isWeekend() && !isHoliday && isWithinOfficeHours() && canMarkEntryNow() && !todayEntryMarked;
  const canMarkExit = attendanceRestriction.canMark && !isWeekend() && !isHoliday && isWithinOfficeHours() && canMarkExitNow() && todayEntryMarked && !todayExitMarked;

  const timeStatus = getTimeStatus();

  // Debug useEffect to check internship status
  useEffect(() => {
    if (internshipInfo) {
      console.log('Internship Status Debug:', {
        internshipInfo,
        mentorAllocated,
        internshipStarted,
        internshipEnded,
        attendanceRestriction
      });
    }
  }, [internshipInfo, mentorAllocated, internshipStarted, internshipEnded, attendanceRestriction]);

  // ✅ Load user_id from localStorage
  useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    
    if (!userData) {
      toast({
        title: "No user data found.",
        description: "Please log in again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (user && user.userId) {
        setUserId(user.userId);
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
      } else {
        throw new Error("User ID not found in user data");
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      toast({
        title: "Error loading user data",
        description: "Please log in again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
    }
  }, [router, toast]);

  // ✅ Fetch public holidays
  useEffect(() => {
    if (holidaysLoaded) return;
    
    const fetchHolidays = async () => {
      try {
        const res = await fetch('/api/holidays');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPublicHolidays(data.holidays);
            setHolidaysLoaded(true);
            
            // Check if today is a holiday
            const todayIsHoliday = checkIfHoliday();
            setIsHoliday(todayIsHoliday);
          }
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidaysLoaded(true);
      }
    };
    
    fetchHolidays();
  }, [holidaysLoaded, checkIfHoliday]);

  // ✅ Fetch student details and internship info
  useEffect(() => {
    if (!userId) return;
    
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile
        const profileRes = await fetch(`/api/attendance?user_id=${userId}`);
        if (!profileRes.ok) throw new Error("Failed to fetch student profile");
        
        const profileData = await profileRes.json();
        if (profileData.success && profileData.student) {
          setStudent(profileData.student);
        } else {
          throw new Error(profileData.error || "Student not found");
        }

        // Fetch internship information
        const internshipRes = await fetch(`/api/getApplications?user_id=${userId}`);
        if (!internshipRes.ok) throw new Error("Failed to fetch internship info");
        
        const internshipData = await internshipRes.json();
        const acceptedInternship = Array.isArray(internshipData) 
          ? internshipData.find(app => app.status === 'accepted')
          : null;
        
        if (acceptedInternship) {
          const formattedInternship = {
            ...acceptedInternship,
            status: acceptedInternship.status.charAt(0).toUpperCase() + acceptedInternship.status.slice(1)
          };
          
          setInternshipInfo(formattedInternship);
          
          // Check attendance eligibility
          const eligibility = checkAttendanceEligibility(acceptedInternship);
          setAttendanceRestriction(eligibility);
          setCanMarkAttendance(eligibility.canMark);
        } else {
          setAttendanceRestriction({
            canMark: false,
            reason: "No accepted internship application found.",
            mentorAllocated: false,
            internshipStarted: false,
            internshipEnded: false
          });
          setCanMarkAttendance(false);
        }

        // Fetch attendance stats with proper calculation
        const statsRes = await fetch(`/api/attendance/stats?user_id=${userId}&calculate=true`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setAttendanceStats(statsData.stats);
          }
        }

        // Fetch today's attendance to check if entry/exit already marked
        const todayRes = await fetch(`/api/attendance?today=true&user_id=${userId}`);
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          if (todayData.success && todayData.records) {
            const todayRecord = todayData.records[0];
            setTodayEntryMarked(!!todayRecord?.entry_time);
            setTodayExitMarked(!!todayRecord?.exit_time);
          }
        }

        // Fetch last attendance record - FIXED: Corrected variable name
        const lastAttRes = await fetch(`/api/attendance/last?user_id=${userId}`);
        if (lastAttRes.ok) {
          const lastAttData = await lastAttRes.json(); // FIXED: Changed from lastAttData.json() to lastAttRes.json()
          if (lastAttData.success && lastAttData.record) {
            const formattedRecord = {
              ...lastAttData.record,
              formattedDate: formatDate(lastAttData.record.date),
              formattedTime: formatTime(lastAttData.record.formatted_time),
              type: lastAttData.record.type || "N/A",
              work_mode: lastAttData.record.work_mode || "N/A",
              note: lastAttData.record.note || ""
            };
            setLastAttendance(formattedRecord);
          }
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [userId, toast, formatDate, formatTime, checkAttendanceEligibility]);

  // Update holiday status when publicHolidays changes
  useEffect(() => {
    if (publicHolidays.length > 0) {
      const todayIsHoliday = checkIfHoliday();
      setIsHoliday(todayIsHoliday);
    }
  }, [publicHolidays, checkIfHoliday]);

  // Show internship ended message - MOVED TO THE TOP of conditional rendering
  if (internshipEnded && !loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <Card maxW="md" p={8} textAlign="center" boxShadow="xl" borderRadius="2xl">
          <Box color="red.500" mb={6}>
            <Icon as={FaCalendarTimes} boxSize={16} />
          </Box>
          <Heading size="lg" mb={4} color="gray.700">
            Internship Period Ended
          </Heading>
          <Text mb={4} color="gray.600">
            The internship end date has been reached and you can no longer mark attendance.
          </Text>
          <Text mb={6} color="gray.600" fontSize="sm">
            {internshipInfo ? `The internship period ended on ${new Date(internshipInfo.end_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}` : "Your internship period has ended."}
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push("/student/dashboard")}
            leftIcon={<FaArrowLeft />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  // Show mentor not allocated message
  if (!mentorAllocated && !loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
        {/* Background elements */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="blue.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 8s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="10%"
          left="10%"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="purple.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 10s ease-in-out infinite`}
        />
        
        <Box position="relative" zIndex="1">
          <Center>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg="blue.100"
                  color="blue.500"
                >
                  <Icon as={FaUserTie} boxSize={10} />
                </Box>
                <Heading size="lg" color="blue.500" fontFamily="'Segoe UI', sans-serif">Mentor Required</Heading>
                <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
                  You cannot mark attendance until a mentor has been assigned to you.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait for our team to allocate a mentor to your account. Once a mentor is assigned, 
                  you&apos;ll be able to mark your attendance through this portal.
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  You can mark attendance only after a mentor is allocated to you.
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => router.push("/student/dashboard")}
                  mt={4}
                  fontFamily="'Segoe UI', sans-serif"
                  rightIcon={<FaRocket />}
                >
                  Back to Dashboard
                </Button>
              </VStack>
            </MotionBox>
          </Center>
        </Box>
      </Box>
    );
  }

  // Show internship not started message
  if (!internshipStarted && mentorAllocated && !loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <Card maxW="md" p={8} textAlign="center" boxShadow="xl" borderRadius="2xl">
          <Box color="orange.500" mb={6}>
            <Icon as={FaExclamationTriangle} boxSize={16} />
          </Box>
          <Heading size="lg" mb={4} color="gray.700">
            Internship Not Started Yet
          </Heading>
          <Text mb={6} color="gray.600">
            {internshipInfo ? `You can mark attendance starting from ${new Date(internshipInfo.start_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}` : "Your internship has not started yet."}
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push("/student/dashboard")}
            leftIcon={<FaArrowLeft />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient="linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaCalendarDay} boxSize={10} color="white" />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="orange.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Loading your attendance information...</Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6}>
        <Button 
          mb={6} 
          colorScheme="blue" 
          variant="outline" 
          onClick={() => router.push("/student/dashboard")}
          leftIcon={<FaArrowLeft />}
          fontFamily="'Segoe UI', sans-serif"
          _hover={{ transform: "translateX(-3px)", shadow: "md" }}
          transition="all 0.2s ease"
        >
          Back to Dashboard
        </Button>
        <Center>
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
              <Box 
                p={4} 
                borderRadius="full" 
                bg="red.100"
                color="red.500"
                animation={`${pulse} 2s infinite`}
              >
                <Icon as={FaExclamationTriangle} boxSize={10} />
              </Box>
              <Heading size="lg" color="red.500" fontFamily="'Segoe UI', sans-serif">Student Profile Not Found</Heading>
              <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
                We couldn&apos;t find your student profile. Please contact support if this issue persists.
              </Text>
              <Button 
                colorScheme="blue" 
                onClick={() => router.push("/student/profile")}
                mt={4}
                fontFamily="'Segoe UI', sans-serif"
              >
                Update Profile
              </Button>
            </VStack>
          </MotionBox>
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={8} px={4}>
      <Container maxW="6xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={8}>
          <Button 
            colorScheme="blue" 
            variant="outline" 
            onClick={() => router.push("/student/dashboard")}
            leftIcon={<FaArrowLeft />}
            fontFamily="'Segoe UI', sans-serif"
            _hover={{ transform: "translateX(-3px)", shadow: "md" }}
            transition="all 0.2s ease"
            size={{ base: "sm", md: "md" }}
          >
            Back to Dashboard
          </Button>
          
          <HStack spacing={4}>
            <Button 
              colorScheme="blue" 
              variant="outline" 
              onClick={() => router.push("/student/attendance/history")}
              leftIcon={<FaHistory />}
            >
              View History
            </Button>
            <Tooltip label="Your attendance statistics" hasArrow>
              <Badge colorScheme="blue" p={2} borderRadius="md">
                <HStack>
                  <FaChartLine />
                  <Text>{attendanceStats.percentage}% Attendance</Text>
                </HStack>
              </Badge>
            </Tooltip>
          </HStack>
        </Flex>

        {/* Main Content */}
        <VStack spacing={8} align="stretch">
          {/* Centered Today's Date Card */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            maxW="2xl"
            mx="auto"
            w="full"
          >
            <MotionCard
              bgGradient={isHoliday ? "linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)" : gradientBg}
              color="white"
              borderRadius="xl"
              boxShadow="xl"
              overflow="hidden"
              animation={`${float} 6s ease-in-out infinite`}
            >
              <CardBody display="flex" flexDirection="column" justifyContent="center">
                <VStack spacing={4} align="stretch" textAlign="center">
                  <Box 
                    p={3} 
                    borderRadius="full" 
                    bg="rgba(255,255,255,0.2)"
                    width="max-content"
                    mx="auto"
                  >
                    <Icon as={isHoliday ? FaUmbrellaBeach : FaCalendarCheck} boxSize={6} />
                  </Box>
                  
                  <Text fontSize="sm" opacity={0.9}>
                    {isHoliday ? "PUBLIC HOLIDAY" : "TODAY'S DATE"}
                  </Text>
                  
                  <Heading size="lg">
                    {isHoliday ? holidayName : new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Heading>
                  
                  <Text fontSize="sm" opacity={0.9}>
                    {timeStatus.message}
                  </Text>
                </VStack>
              </CardBody>
            </MotionCard>
          </MotionBox>

          {/* Attendance Restriction Alert */}
          {!attendanceRestriction.canMark && (
            <Alert 
              status="warning" 
              borderRadius="xl" 
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Attendance Restricted</AlertTitle>
                <AlertDescription>
                  {attendanceRestriction.reason}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Holiday Alert */}
          {isHoliday && (
            <Alert 
              status="info" 
              borderRadius="xl" 
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Public Holiday - {holidayName}</AlertTitle>
                <AlertDescription>
                  No attendance marking required today. Enjoy your holiday!
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Time Status Alert */}
          {!isHoliday && (
            <Alert 
              status={
                timeStatus.status === "weekend" ? "warning" :
                timeStatus.status === "before_office" ? "info" : 
                timeStatus.status === "office_hours" ? "success" : "warning"
              } 
              borderRadius="xl" 
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {timeStatus.status === "weekend" ? "Weekend" :
                  timeStatus.status === "before_office" ? "Before Office Hours" : 
                  timeStatus.status === "office_hours" ? "Office Hours" : "After Office Hours"}
                </AlertTitle>
                <AlertDescription>
                  {timeStatus.message}
                  {timeStatus.status === "office_hours" && " You can mark attendance now."}
                  {timeStatus.status === "weekend" && ""}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Today's Attendance Status */}
          {attendanceRestriction.canMark && !isWeekend() && !isHoliday && (
            <Alert 
              status="info" 
              borderRadius="xl" 
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Today&apos;s Attendance Status</AlertTitle>
                <AlertDescription>
                  {todayEntryMarked ? (
                    "✅ You have marked entry for today and are counted as PRESENT."
                  ) : (
                    "⏳ No attendance marked yet for today. You will be counted as ABSENT if you don't mark entry."
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Warning for late/early attendance */}
          {attendanceRestriction.canMark && !isWeekend() && !isHoliday && isWithinOfficeHours() && (
            <>
              {canMarkEntryNow() && isLate() && !todayEntryMarked && (
                <Alert status="warning" borderRadius="xl" variant="left-accent">
                  <AlertIcon />
                  <AlertDescription>
                    ⚠️ You will be marked as <strong>LATE</strong> (arrived after 10:00 AM)
                  </AlertDescription>
                </Alert>
              )}
              {canMarkExitNow() && isLeavingEarly() && !todayExitMarked && (
                <Alert status="warning" borderRadius="xl" variant="left-accent">
                  <AlertIcon />
                  <AlertDescription>
                    ⚠️ You will be marked as <strong>LEAVING EARLY</strong> (before 5:30 PM)
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Stats and Info Cards */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Stats Card */}
            <GridItem>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                bg={cardBg}
                borderRadius="xl"
                boxShadow="xl"
                overflow="hidden"
                h="full"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md" color={accentColor}>
                        Attendance Stats
                      </Heading>
                      <Box 
                        p={2} 
                        borderRadius="md" 
                        bg="blue.100"
                        color="blue.600"
                      >
                        <Icon as={FaChartLine} boxSize={5} />
                      </Box>
                    </HStack>
                    
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium" fontSize="sm">Current Attendance</Text>
                          <Text fontWeight="bold" fontSize="sm">{attendanceStats.percentage}%</Text>
                        </HStack>
                        <Progress 
                          value={attendanceStats.percentage} 
                          size="sm" 
                          colorScheme={attendanceStats.percentage >= 80 ? "green" : attendanceStats.percentage >= 60 ? "orange" : "red"} 
                          borderRadius="full" 
                        />
                      </Box>
                      
                      <SimpleGrid columns={2} spacing={4}>
                        <Box p={3} bg="green.50" borderRadius="md">
                          <Text fontSize="md" fontWeight="bold" color="green.600">
                            {attendanceStats.present}
                          </Text>
                          <Text fontSize="xs" color="green.600">Days Present</Text>
                        </Box>
                        <Box p={3} bg="red.50" borderRadius="md">
                          <Text fontSize="md" fontWeight="bold" color="red.600">
                            {attendanceStats.absent}
                          </Text>
                          <Text fontSize="xs" color="red.600">Days Absent</Text>
                        </Box>
                        <Box p={3} bg="blue.50" borderRadius="md">
                          <Text fontSize="md" fontWeight="bold" color="blue.600">
                            {attendanceStats.total}
                          </Text>
                          <Text fontSize="xs" color="blue.600">Total Days</Text>
                        </Box>
                        <Box p={3} bg="purple.50" borderRadius="md">
                          <Text fontSize="md" fontWeight="bold" color="purple.600">
                            {internshipInfo?.duration_months || 0}
                          </Text>
                          <Text fontSize="xs" color="purple.600">Months Duration</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>
            </GridItem>

            {/* Last Attendance Card */}
            <GridItem>
              {lastAttendance ? (
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="xl"
                  overflow="hidden"
                  h="full"
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md" color={accentColor}>
                          Last Attendance
                        </Heading>
                        <Box 
                          p={2} 
                          borderRadius="md" 
                          bg="purple.100"
                          color="purple.600"
                        >
                          <Icon as={FaHistory} boxSize={5} />
                        </Box>
                      </HStack>
                      
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium" fontSize="sm">Date</Text>
                          <Text fontSize="sm">{lastAttendance.formattedDate || "N/A"}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium" fontSize="sm">Type</Text>
                          {lastAttendance.type ? (
                            <Badge 
                              colorScheme={lastAttendance.type === "entry" ? "green" : "blue"}
                              fontSize="xs"
                            >
                              {lastAttendance.type.toUpperCase()}
                            </Badge>
                          ) : (
                            <Text fontSize="sm">N/A</Text>
                          )}
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium" fontSize="sm">Mode</Text>
                          <Text fontSize="sm" textTransform="capitalize">
                            {lastAttendance.work_mode}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium" fontSize="sm">Time</Text>
                          <Text fontSize="sm">{lastAttendance.formattedTime || "N/A"}</Text>
                        </HStack>

                        {lastAttendance.note && (
                          <Box>
                            <Text fontWeight="medium" fontSize="sm" mb={1}>Note</Text>
                            <Text fontSize="xs" color="gray.600" bg="gray.50" p={2} borderRadius="md">
                              {lastAttendance.note}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ) : (
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="xl"
                  overflow="hidden"
                  h="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <CardBody textAlign="center">
                    <VStack spacing={3}>
                      <Box 
                        p={3} 
                        borderRadius="full" 
                        bg="gray.100"
                        color="gray.500"
                      >
                        <Icon as={FaHistory} boxSize={5} />
                      </Box>
                      <Text fontWeight="medium" color={textColor} fontSize="sm">
                        No attendance records yet
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Mark your first attendance to see records here
                      </Text>
                    </VStack>
                  </CardBody>
                </MotionCard>
              )}
            </GridItem>
          </Grid>

          {/* Main Attendance Form - Centered */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            maxW="3xl"
            mx="auto"
            w="full"
          >
            <Card 
              bg={cardBg} 
              p={8} 
              borderRadius="xl" 
              boxShadow="xl"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                bgGradient: isHoliday ? "linear-gradient(to-r, pink.400, red.400)" : "linear-gradient(to-r, blue.400, purple.400)",
                backgroundSize: "200% 200%",
                animation: `${gradient} 3s ease infinite`,
              }}
            >
              <CardBody p={0}>
                <VStack spacing={8} align="stretch">
                  <Center flexDirection="column" textAlign="center" mb={4}>
                    <Box 
                      p={5} 
                      borderRadius="xl" 
                      bgGradient={isHoliday ? "linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)" : gradientBg}
                      color="white"
                      boxShadow="xl"
                      mb={4}
                      animation={isHoliday ? "none" : `${pulse} 2s infinite`}
                    >
                      <Icon as={isHoliday ? FaUmbrellaBeach : FaCalendarDay} boxSize={10} />
                    </Box>
                    <Heading color={isHoliday ? "pink.500" : accentColor} fontSize="3xl">
                      {isHoliday ? "Public Holiday" : "Mark Your Attendance"}
                    </Heading>
                    <Text color={textColor} fontSize="lg">
                      {isHoliday ? `Enjoy your ${holidayName}!` : "Record your daily attendance for the internship program"}
                    </Text>
                  </Center>

                  {!attendanceRestriction.canMark && (
                    <Alert 
                      status="warning" 
                      borderRadius="xl" 
                      variant="left-accent"
                      flexDirection={{ base: "column", md: "row" }}
                      alignItems="flex-start"
                    >
                      <AlertIcon boxSize={6} mt={1} />
                      <Box>
                        <AlertTitle>Attendance Not Available</AlertTitle>
                        <AlertDescription>
                          {attendanceRestriction.reason}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {isHoliday ? (
                    <Alert 
                      status="info" 
                      borderRadius="xl" 
                      variant="left-accent"
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Public Holiday - No Attendance Required</AlertTitle>
                        <AlertDescription>
                          Today is {holidayName}. You don&apos;t need to mark attendance on public holidays.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ) : (
                    <SimpleGrid columns={{ base: 1 }} spacing={8}>
                      {/* Student Information Card */}
                      <Card bg={subtleBg} borderRadius="xl">
                        <CardBody>
                          <HStack justify="space-between" mb={4}>
                            <Heading size="md" color={accentColor}>
                              Student Information
                            </Heading>
                            <Box 
                              p={2} 
                              borderRadius="md" 
                              bg="blue.100"
                              color="blue.600"
                            >
                              <Icon as={FaUser} boxSize={4} />
                            </Box>
                          </HStack>
                          <VStack spacing={4} align="stretch">
                            <HStack spacing={4}>
                              <Icon as={FaUser} color="blue.500" />
                              <FormControl isReadOnly>
                                <FormLabel fontWeight="medium">Full Name</FormLabel>
                                <Input value={student.name} isReadOnly borderRadius="md" />
                              </FormControl>
                            </HStack>
                            
                            <HStack spacing={4}>
                              <Icon as={FaIdCard} color="green.500" />
                              <FormControl isReadOnly>
                                <FormLabel fontWeight="medium">Student ID</FormLabel>
                                <Input value={student.student_id || "N/A"} isReadOnly borderRadius="md" />
                              </FormControl>
                            </HStack>
                            
                            <HStack spacing={4}>
                              <Icon as={FaEnvelope} color="purple.500" />
                              <FormControl isReadOnly>
                                <FormLabel fontWeight="medium">Email Address</FormLabel>
                                <Input value={student.email} isReadOnly borderRadius="md" />
                              </FormControl>
                            </HStack>

                            {mentorName && (
                              <HStack spacing={4}>
                                <Icon as={FaUserTie} color="orange.500" />
                                <FormControl isReadOnly>
                                  <FormLabel fontWeight="medium">Mentor</FormLabel>
                                  <Input value={mentorName} isReadOnly borderRadius="md" />
                                </FormControl>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Attendance Form Card */}
                      <Card bg={subtleBg} borderRadius="xl">
                        <CardBody>
                          <HStack justify="space-between" mb={4}>
                            <Heading size="md" color={accentColor}>
                              Attendance Details
                            </Heading>
                            <Box 
                              p={2} 
                              borderRadius="md" 
                              bg="green.100"
                              color="green.600"
                            >
                              <Icon as={FaCheckCircle} boxSize={4} />
                            </Box>
                          </HStack>
                          <VStack spacing={4} align="stretch">
                            <HStack spacing={4}>
                              <Icon as={FaCalendarCheck} color="orange.500" />
                              <FormControl>
                                <FormLabel fontWeight="medium">Date</FormLabel>
                                <Input 
                                  type="date" 
                                  value={date} 
                                  disabled 
                                  borderRadius="md"
                                />
                              </FormControl>
                            </HStack>
                            
                            <FormControl>
                              <FormLabel fontWeight="medium">Work Mode</FormLabel>
                              <RadioGroup onChange={setMode} value={mode}>
                                <Stack direction="column" spacing={4}>
                                  <Radio 
                                    value="office" 
                                    colorScheme="blue"
                                    size="lg"
                                    isDisabled={isWeekend() || isHoliday || !isWithinOfficeHours() || !attendanceRestriction.canMark}
                                  >
                                    <HStack>
                                      <Icon as={FaBuilding} color="blue.500" />
                                      <VStack align="start" spacing={0}>
                                        <Text>Work from Office</Text>
                                        <Text fontSize="sm" color="gray.500">Physical attendance at workplace</Text>
                                      </VStack>
                                    </HStack>
                                  </Radio>
                                  <Radio 
                                    value="home" 
                                    colorScheme="green"
                                    size="lg"
                                    isDisabled={isWeekend() || isHoliday || !isWithinOfficeHours() || !attendanceRestriction.canMark}
                                  >
                                    <HStack>
                                      <Icon as={FaLaptopHouse} color="green.500" />
                                      <VStack align="start" spacing={0}>
                                        <Text>Work from Home</Text>
                                        <Text fontSize="sm" color="gray.500">Remote work arrangement</Text>
                                      </VStack>
                                    </HStack>
                                  </Radio>
                                </Stack>
                              </RadioGroup>
                            </FormControl>

                            {/* Two Separate Buttons */}
                            <HStack spacing={4} mt={6}>
                              <Button 
                                colorScheme="green" 
                                flex={1}
                                onClick={() => markAttendance("entry")}
                                isDisabled={!canMarkEntry || submittingEntry || submittingExit}
                                leftIcon={<FaDoorOpen />}
                                size="lg"
                                height="60px"
                                isLoading={submittingEntry}
                                loadingText="Marking Entry"
                                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                                transition="all 0.2s ease"
                                borderRadius="xl"
                                boxShadow="md"
                              >
                                {todayEntryMarked ? "Entry Already Marked" : "Mark Entry"}
                              </Button>
                              <Button 
                                colorScheme="blue" 
                                flex={1}
                                onClick={() => markAttendance("exit")}
                                isDisabled={!canMarkExit || submittingEntry || submittingExit}
                                leftIcon={<FaDoorClosed />}
                                size="lg"
                                height="60px"
                                isLoading={submittingExit}
                                loadingText="Marking Exit"
                                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                                transition="all 0.2s ease"
                                borderRadius="xl"
                                boxShadow="md"
                              >
                                {todayExitMarked ? "Exit Already Marked" : "Mark Exit"}
                              </Button>
                            </HStack>

                            {/* Note Buttons - Disabled on weekends, holidays and after office hours */}
                            <HStack spacing={4} mt={4}>
                              <Button 
                                colorScheme="orange" 
                                flex={1}
                                onClick={() => openAbsentNoteModal("entry", "before")}
                                isDisabled={shouldDisableNotes() || todayEntryMarked || !canMarkEntryNow() || submittingEntry || submittingExit}
                                leftIcon={<FaStickyNote />}
                                size="md"
                                variant="outline"
                              >
                                Add Note Before Entry
                              </Button>
                              <Button 
                                colorScheme="purple" 
                                flex={1}
                                onClick={() => openAbsentNoteModal("exit", "before")}
                                isDisabled={shouldDisableNotes() || todayExitMarked || !todayEntryMarked || !canMarkExitNow() || submittingEntry || submittingExit}
                                leftIcon={<FaStickyNote />}
                                size="md"
                                variant="outline"
                              >
                                Add Note Before Exit
                              </Button>
                            </HStack>

                            {/* Add Note After Button - Disabled on weekends, holidays and after office hours */}
                            <Button 
                              colorScheme="gray" 
                              onClick={() => openAbsentNoteModal("both", "after")}
                              isDisabled={shouldDisableNotes() || (!todayEntryMarked && !todayExitMarked)}
                              leftIcon={<FaStickyNote />}
                              size="md"
                              variant="outline"
                            >
                              Add Note After Attendance
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  )}

                  {internshipInfo && (
                    <Card bg={subtleBg} borderRadius="xl">
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md" color={accentColor}>
                            Internship Information
                          </Heading>
                          <Box 
                            p={2} 
                            borderRadius="md" 
                            bg="purple.100"
                            color="purple.600"
                          >
                            <Icon as={FaAward} boxSize={4} />
                          </Box>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: mentorName ? 4 : 3 }} spacing={6}>
                          <Box p={4} bg="white" borderRadius="xl" boxShadow="sm">
                            <VStack spacing={2}>
                              <Badge colorScheme="purple" p={2}>
                                Internship Period
                              </Badge>
                              <Text textAlign="center" fontWeight="medium" fontSize="sm">
                                {formatDate(internshipInfo.start_date)} - {formatDate(internshipInfo.end_date)}
                              </Text>
                            </VStack>
                          </Box>
                          <Box p={4} bg="white" borderRadius="xl" boxShadow="sm">
                            <VStack spacing={2}>
                              <Badge colorScheme="blue" p={2}>
                                Duration
                              </Badge>
                              <Text fontWeight="medium">
                                {internshipInfo.duration_months} months
                              </Text>
                            </VStack>
                          </Box>
                          <Box p={4} bg="white" borderRadius="xl" boxShadow="sm">
                            <VStack spacing={2}>
                              <Badge colorScheme="green" p={2}>
                                Status
                              </Badge>
                              <Text fontWeight="medium">
                                {internshipInfo.status}
                              </Text>
                            </VStack>
                          </Box>
                          {mentorName && (
                            <Box p={4} bg="white" borderRadius="xl" boxShadow="sm">
                              <VStack spacing={2}>
                                <Badge colorScheme="orange" p={2}>
                                  <HStack>
                                    <Icon as={FaUserTie} />
                                    <Text>Mentor</Text>
                                  </HStack>
                                </Badge>
                                <Text fontWeight="medium" textAlign="center">
                                  {mentorName}
                                </Text>
                              </VStack>
                            </Box>
                          )}
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  )}

                  {/* Help Text */}
                  <Card bg="blue.50" borderRadius="xl">
                    <CardBody>
                      <HStack spacing={4}>
                        <Box 
                          p={3} 
                          borderRadius="full" 
                          bg="blue.100"
                          color="blue.600"
                        >
                          <Icon as={FaInfoCircle} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" color="blue.700">
                            💡 Attendance Guidelines
                          </Text>
                          <Text fontSize="sm" color="blue.600">
                            • Office Hours: 9:30 AM to 5:45 PM (Monday-Friday)<br/>
                            • No attendance on weekends and public holidays<br/>
                            • Entry can be marked from 9:30 AM onwards<br/>
                            • Exit can be marked from 5:00 PM onwards<br/>
                            • Arriving after 10:00 AM will be marked as Late<br/>
                            • Leaving before 5:30 PM will be marked as Early Departure<br/>
                            • ✅ <strong>You will be marked as PRESENT when you mark entry</strong><br/>
                            • ❌ <strong>You will be marked as ABSENT if you don&apos;t mark entry for the day</strong><br/>
                            • Exit marking is optional but recommended for complete records<br/>
                            • Attendance percentage is calculated based on working days in your internship period
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Note Guidelines */}
                  {!isHoliday && (
                    <Card bg="green.50" borderRadius="xl">
                      <CardBody>
                        <HStack spacing={4}>
                          <Box 
                            p={3} 
                            borderRadius="full" 
                            bg="green.100"
                            color="green.600"
                          >
                            <Icon as={FaStickyNote} boxSize={5} />
                          </Box>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" color="green.700">
                              📝 Note Feature Guidelines
                            </Text>
                            <List spacing={2} fontSize="sm" color="green.600">
                              <ListItem>
                                <ListIcon as={FaCheck} color="green.500" />
                                <strong>Before Marking Attendance:</strong> Add a note if you know you&apos;ll be late, leaving early, or absent
                              </ListItem>
                              <ListItem>
                                <ListIcon as={FaCheck} color="green.500" />
                                <strong>After Marking Attendance:</strong> Add a note to explain why you were late, left early, or for any other reason
                              </ListItem>
                              <ListItem>
                                <ListIcon as={FaCheck} color="green.500" />
                                <strong>Note Examples:</strong> &quot;Stuck in traffic&quot;, &quot;Doctor appointment&quot;, &quot;Internet connectivity issues&quot;, &quot;Family emergency&quot;  
                              </ListItem>
                              <ListItem>
                                <ListIcon as={FaCheck} color="green.500" />
                                Notes are visible to your supervisor and help provide context for your attendance
                              </ListItem>
                              <ListItem>
                                <ListIcon as={FaCheck} color="green.500" />
                                <strong>Note:</strong> Notes can only be added during office hours on weekdays
                              </ListItem>
                            </List>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        </VStack>
      </Container>

      {/* Absent Note Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {noteMode === "before" 
              ? `Add Note Before ${attendanceType === "entry" ? "Entry" : "Exit"}` 
              : "Add Note After Attendance"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertDescription fontSize="sm">
                    {noteMode === "before" 
                      ? `Adding a note before marking ${attendanceType} helps provide context for your supervisor.`
                      : "Adding a note after marking attendance helps explain any irregularities."}
                  </AlertDescription>
                </Box>
              </Alert>
              
              <FormControl>
                <FormLabel>
                  {noteMode === "before" 
                    ? `Note for ${attendanceType === "entry" ? "Entry" : "Exit"}`
                    : "Attendance Note"}
                </FormLabel>
                <Textarea
                  value={absentNote}
                  onChange={(e) => setAbsentNote(e.target.value)}
                  placeholder={
                    noteMode === "before" 
                      ? (attendanceType === "entry" 
                          ? "Explain why you might be late or absent..." 
                          : "Explain why you might leave early...")
                      : "Add any notes about your attendance for today..."
                  }
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={submitWithNote} 
              isLoading={
                noteMode === "before" 
                  ? (attendanceType === "entry" ? submittingEntry : submittingExit) 
                  : submittingNote
              }
              isDisabled={!absentNote.trim()}
            >
              {noteMode === "before" ? "Add Note & Mark Attendance" : "Add Note"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}