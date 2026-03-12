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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Avatar,
  IconButton,
  Wrap,
  Tooltip,
  Center,
  SimpleGrid,
  keyframes,
  Progress,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFileAlt,
  FaStar,
  FaSync,
  FaEdit,
  FaFilePdf,
  FaFileImage,
  FaFileCode,
  FaFileArchive,
  FaArrowLeft,
  FaUsers,
  FaBookOpen,
  FaRocket,
  FaChartLine,
  FaLightbulb,
  FaTrophy,
  FaUserGraduate,
  FaAward,
  FaGraduationCap,
  FaClipboardCheck,
  FaComment,
  FaTasks,
  FaQuestionCircle,
  FaReply,
  FaCheckSquare,
} from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export default function MentorReviewTasks() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const { isOpen: isQueryOpen, onOpen: onQueryOpen, onClose: onQueryClose } = useDisclosure();
  const { isOpen: isQueryDetailsOpen, onOpen: onQueryDetailsOpen, onClose: onQueryDetailsClose } = useDisclosure();

  // State variables
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dbError, setDbError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    submissionId: null,
    feedback: "",
    marks: "",
    status: "reviewed"
  });

  // Query answer form state
  const [queryForm, setQueryForm] = useState({
    queryId: null,
    answer: "",
    status: "answered",
    isEditing: false
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    averageMarks: 0,
    completionRate: 0,
    openQueries: 0
  });

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("blue.50", "blue.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");

  // Set minimum load time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format datetime function
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Load user data and submissions
  useEffect(() => {
    const showToast = (title, status, description, duration = 3000) => {
      toast({
        title,
        description,
        status,
        duration,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    };

    const loadSubmissions = async (mentorId) => {
      try {
        setDbError(null);
        setIsRefreshing(true);
        
        // Load task submissions
        const submissionsResponse = await fetch(`/api/mentor/task-submissions?mentorId=${mentorId}`);
        // Load task queries
        const queriesResponse = await fetch(`/api/mentor/task-queries?mentorId=${mentorId}`);

        if (submissionsResponse.ok && queriesResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          const queriesData = await queriesResponse.json();

          // Process submissions with student_id and profile photo
          const formattedSubmissions = await Promise.all(submissionsData.map(async (item) => {
            let studentProfilePhoto = null;
            let studentId = item.student_id; // This is user_id from the query

            // Get student profile data including student_id and profile_photo
            if (item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?userId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                  studentId = profileData.student_id || item.student_id; // Use actual student_id if available
                }
              } catch (error) {
                console.log('Could not fetch student profile:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: studentId, // Use the actual student_id
              student_profile_photo: studentProfilePhoto,
              file_paths: Array.isArray(item.file_paths) ? item.file_paths : [],
              status: item.status || 'submitted',
              marks: item.marks || null,
              feedback: item.mentor_feedback || '',
              formatted_date: formatDate(item.submission_date),
              task_title: item.task_title || 'Untitled Task',
              task_description: item.task_description || ''
            };
          }));

          // Process queries with student_id and profile photo
          const formattedQueries = await Promise.all(queriesData.map(async (item) => {
            let studentProfilePhoto = null;
            let studentId = item.student_id; // This is user_id from the query

            // Get student profile data including student_id and profile_photo
            if (item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?userId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                  studentId = profileData.student_id || item.student_id; // Use actual student_id if available
                }
              } catch (error) {
                console.log('Could not fetch student profile:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: studentId, // Use the actual student_id
              student_profile_photo: studentProfilePhoto,
              formatted_query_date: formatDate(item.query_date), // CHANGED: Only show date, no time
              formatted_answer_date: item.answer_date ? formatDate(item.answer_date) : null, // CHANGED: Only show date, no time
              task_title: item.task_title || 'Untitled Task'
            };
          }));

          setSubmissions(formattedSubmissions);
          setFilteredSubmissions(formattedSubmissions);
          setQueries(formattedQueries);
          calculateStats(formattedSubmissions, formattedQueries);

        } else {
          throw new Error("Failed to load data");
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setDbError("connection");
        setSubmissions([]);
        setFilteredSubmissions([]);
        setQueries([]);
        setStats({ total: 0, pending: 0, reviewed: 0, averageMarks: 0, completionRate: 0, openQueries: 0 });
        
        showToast("🌐 Connection Issue", "error", "Unable to fetch data. Please check your connection.");
      } finally {
        setIsRefreshing(false);
      }
    };

    const calculateStats = (submissionsData, queriesData) => {
      const total = submissionsData.length;
      const pending = submissionsData.filter(d => d.status === 'submitted').length;
      const reviewed = submissionsData.filter(d => d.status === 'reviewed').length;
      const gradedSubmissions = submissionsData.filter(d => d.marks);
      const averageMarks = gradedSubmissions.length > 0
        ? (gradedSubmissions.reduce((acc, d) => acc + (d.marks || 0), 0) / gradedSubmissions.length).toFixed(1)
        : 0;
      const completionRate = total > 0 ? Math.round((reviewed / total) * 100) : 0;
      const openQueries = queriesData.filter(q => q.status === 'open').length;

      setStats({ total, pending, reviewed, averageMarks, completionRate, openQueries });
    };

    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user') ||
          localStorage.getItem('userData') ||
          localStorage.getItem('mentorUser') ||
          sessionStorage.getItem('user') ||
          sessionStorage.getItem('userData');

        if (!userData) {
          showToast("🔐 Authentication Required", "warning", "Please log in to access this page");
          router.push('/login');
          return;
        }

        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          if (typeof userData === 'string' && userData.includes('user_id')) {
            const userIdMatch = userData.match(/"user_id":"([^"]+)"/);
            if (userIdMatch) {
              parsedUser = { user_id: userIdMatch[1] };
            } else {
              throw new Error('Invalid user data format');
            }
          } else {
            throw new Error('Invalid user data format');
          }
        }

        const userId = parsedUser.user_id || parsedUser.id || parsedUser.UserID || parsedUser.userId;

        if (!userId) {
          showToast("❌ Invalid Session", "error", "Please log in again");
          router.push('/login');
          return;
        }

        const normalizedUser = {
          user_id: userId,
          name: parsedUser.name || parsedUser.username || parsedUser.email || 'Mentor',
          email: parsedUser.email || '',
          role: parsedUser.role || 'mentor',
          profile_photo: parsedUser.profile_photo || null
        };

        setUser(normalizedUser);
        await loadSubmissions(userId);

      } catch (error) {
        showToast("🚨 Error Loading Data", "error", error.message || "Please log in again");
        router.push('/login');
      } finally {
        if (minimumLoadTimePassed) {
          setIsLoading(false);
        } else {
          setTimeout(() => setIsLoading(false), 2000 - (Date.now() - startTime));
        }
      }
    };

    const startTime = Date.now();
    loadUserData();
  }, [router, toast, minimumLoadTimePassed]);

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, filterStatus, submissions]);

  // Start reviewing a submission
  const startReview = (submission) => {
    setReviewForm({
      submissionId: submission.submission_id,
      feedback: submission.feedback || "",
      marks: submission.marks || "",
      status: "reviewed"
    });
    onReviewOpen();
  };

  // Start answering a query
  const startAnswerQuery = (query) => {
    setSelectedQuery(query);
    setQueryForm({
      queryId: query.query_id,
      answer: query.answer || "",
      status: "answered",
      isEditing: !!query.answer // Set to true if there's already an answer
    });
    onQueryOpen();
  };

  // View query details
  const viewQueryDetails = (query) => {
    setSelectedQuery(query);
    onQueryDetailsOpen();
  };

  // Submit review for a submission
  const submitReview = async () => {
    if (!reviewForm.submissionId) return;

    if (!reviewForm.feedback.trim()) {
      toast({
        title: "📝 Feedback Required",
        description: "Please provide constructive feedback for the student",
        status: "warning",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
      return;
    }

    try {
      const reviewData = {
        submission_id: reviewForm.submissionId,
        mentor_feedback: reviewForm.feedback.trim(),
        marks: reviewForm.marks ? parseInt(reviewForm.marks) : null,
        status: reviewForm.status,
        reviewed_by: user.user_id
      };

      const response = await fetch('/api/mentor/review-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      toast({
        title: "✅ Task Reviewed Successfully!",
        description: "Your feedback has been submitted to the student",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });

      // Reload data
      await reloadData();

      setReviewForm({ submissionId: null, feedback: "", marks: "", status: "reviewed" });
      onReviewClose();
    } catch (error) {
      toast({
        title: "❌ Review Failed",
        description: error.message || "Please try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    }
  };

  // Submit answer for a query
  const submitQueryAnswer = async () => {
    if (!queryForm.queryId) return;

    if (!queryForm.answer.trim()) {
      toast({
        title: "📝 Answer Required",
        description: "Please provide an answer for the student's query",
        status: "warning",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
      return;
    }

    try {
      const answerData = {
        query_id: queryForm.queryId,
        answer: queryForm.answer.trim(),
        status: "answered",
        answered_by: user.user_id
      };

      const endpoint = queryForm.isEditing ? '/api/mentor/update-query-answer' : '/api/mentor/answer-query';
      const method = queryForm.isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${queryForm.isEditing ? 'update' : 'submit'} answer`);
      }

      toast({
        title: queryForm.isEditing ? "✅ Answer Updated Successfully!" : "✅ Query Answered Successfully!",
        description: queryForm.isEditing ? "Your answer has been updated" : "Your answer has been sent to the student",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });

      // Reload data
      await reloadData();

      setQueryForm({ queryId: null, answer: "", status: "answered", isEditing: false });
      setSelectedQuery(null);
      onQueryClose();
    } catch (error) {
      toast({
        title: `❌ ${queryForm.isEditing ? 'Update' : 'Answer'} Failed`,
        description: error.message || "Please try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    }
  };

  // Request changes for a submission
  const requestChanges = async () => {
    if (!reviewForm.submissionId) return;

    if (!reviewForm.feedback.trim()) {
      toast({
        title: "📝 Feedback Required",
        description: "Please provide feedback explaining what changes are needed",
        status: "warning",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
      return;
    }

    try {
      const reviewData = {
        submission_id: reviewForm.submissionId,
        mentor_feedback: reviewForm.feedback.trim(),
        marks: reviewForm.marks ? parseInt(reviewForm.marks) : null,
        status: "rejected", // This status indicates changes are requested
        reviewed_by: user.user_id
      };

      const response = await fetch('/api/mentor/review-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to request changes');
      }

      toast({
        title: "🔄 Changes Requested",
        description: "The student has been asked to make improvements",
        status: "info",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });

      // Reload data
      await reloadData();

      setReviewForm({ submissionId: null, feedback: "", marks: "", status: "reviewed" });
      onReviewClose();
    } catch (error) {
      toast({
        title: "❌ Request Failed",
        description: error.message || "Please try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    }
  };

  // Reload all data
  const reloadData = async () => {
    if (user) {
      setDbError(null);
      setIsRefreshing(true);
      
      try {
        const submissionsResponse = await fetch(`/api/mentor/task-submissions?mentorId=${user.user_id}`);
        const queriesResponse = await fetch(`/api/mentor/task-queries?mentorId=${user.user_id}`);

        if (submissionsResponse.ok && queriesResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          const queriesData = await queriesResponse.json();

          const formattedSubmissions = await Promise.all(submissionsData.map(async (item) => {
            let studentProfilePhoto = null;
            let studentId = item.student_id;

            if (item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?userId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                  studentId = profileData.student_id || item.student_id;
                }
              } catch (error) {
                console.log('Could not fetch student profile:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: studentId,
              student_profile_photo: studentProfilePhoto,
              file_paths: Array.isArray(item.file_paths) ? item.file_paths : [],
              status: item.status || 'submitted',
              marks: item.marks || null,
              feedback: item.mentor_feedback || '',
              formatted_date: formatDate(item.submission_date),
              task_title: item.task_title || 'Untitled Task',
              task_description: item.task_description || ''
            };
          }));

          const formattedQueries = await Promise.all(queriesData.map(async (item) => {
            let studentProfilePhoto = null;
            let studentId = item.student_id;

            if (item.student_id) {
              try {
                const profileResponse = await fetch(`/api/student-profile?userId=${item.student_id}`);
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  studentProfilePhoto = profileData.profile_photo;
                  studentId = profileData.student_id || item.student_id;
                }
              } catch (error) {
                console.log('Could not fetch student profile:', error);
              }
            }

            return {
              ...item,
              student_name: item.student_name || 'Unknown Student',
              student_id: studentId,
              student_profile_photo: studentProfilePhoto,
              formatted_query_date: formatDate(item.query_date), // CHANGED: Only show date, no time
              formatted_answer_date: item.answer_date ? formatDate(item.answer_date) : null, // CHANGED: Only show date, no time
              task_title: item.task_title || 'Untitled Task'
            };
          }));

          setSubmissions(formattedSubmissions);
          setFilteredSubmissions(formattedSubmissions);
          setQueries(formattedQueries);
          
          const total = formattedSubmissions.length;
          const pending = formattedSubmissions.filter(d => d.status === 'submitted').length;
          const reviewed = formattedSubmissions.filter(d => d.status === 'reviewed').length;
          const gradedSubmissions = formattedSubmissions.filter(d => d.marks);
          const averageMarks = gradedSubmissions.length > 0
            ? (gradedSubmissions.reduce((acc, d) => acc + (d.marks || 0), 0) / gradedSubmissions.length).toFixed(1)
            : 0;
          const completionRate = total > 0 ? Math.round((reviewed / total) * 100) : 0;
          const openQueries = formattedQueries.filter(q => q.status === 'open').length;

          setStats({ total, pending, reviewed, averageMarks, completionRate, openQueries });
        }
      } catch (error) {
        console.error('Error reloading data:', error);
        setDbError("connection");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Cancel review
  const cancelReview = () => {
    setReviewForm({ submissionId: null, feedback: "", marks: "", status: "reviewed" });
    onReviewClose();
  };

  // Cancel query answer
  const cancelQueryAnswer = () => {
    setQueryForm({ queryId: null, answer: "", status: "answered", isEditing: false });
    setSelectedQuery(null);
    onQueryClose();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'orange';
      case 'reviewed': return 'green';
      case 'rejected': return 'red';
      case 'resubmitted': return 'purple';
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Pending Review';
      case 'reviewed': return 'Reviewed';
      case 'rejected': return 'Changes Requested';
      case 'resubmitted': return 'Resubmitted';
      default: return status;
    }
  };

  // Get query status color
  const getQueryStatusColor = (status) => {
    switch (status) {
      case 'open': return 'orange';
      case 'answered': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  // Get query status text
  const getQueryStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'answered': return 'Answered';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return FaFileAlt;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return FaFilePdf;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return FaFileImage;
      case 'zip': case 'rar': case 'tar': return FaFileArchive;
      case 'js': case 'html': case 'css': case 'py': return FaFileCode;
      default: return FaFileAlt;
    }
  };

  // Get file color
  const getFileColor = (fileName) => {
    if (!fileName) return 'gray';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'red';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'green';
      case 'zip': case 'rar': case 'tar': return 'orange';
      case 'js': case 'html': case 'css': case 'py': return 'blue';
      default: return 'gray';
    }
  };

  // Download file
  const downloadFile = async (filePath, fileName) => {
    try {
      if (!filePath) {
        toast({
          title: "❌ Download Error",
          description: "No file path available",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
          variant: "left-accent",
          containerStyle: {
            animation: `${fadeIn} 0.5s ease-out`,
          },
        });
        return;
      }

      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "📥 Download Started",
        description: `${fileName} is being downloaded...`,
        status: "info",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    } catch (error) {
      toast({
        title: "❌ Download Failed",
        description: "Failed to download file",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
        variant: "left-accent",
        containerStyle: {
          animation: `${fadeIn} 0.5s ease-out`,
        },
      });
    }
  };

  // Retry connection
  const retryConnection = () => {
    reloadData();
  };

  // Filter open queries
  const openQueries = queries.filter(q => q.status === 'open');
  const answeredQueries = queries.filter(q => q.status === 'answered');

  // Loading state
    if (isLoading) {
      return (
        <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6}>
            <Box
              p={6}
              borderRadius="xl"
              bgGradient="linear(to-r, cyan.500, cyan.600)"
              color="white"
              boxShadow="xl"
              animation={`${pulse} 2s infinite`}
            >
              <Icon as={FaCheckSquare} boxSize={10} />
            </Box>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="cyan.500" />
            <Text fontWeight="medium" fontSize="lg">
               Loading Task Submissions...
            </Text>
            <Text fontSize="sm" color="gray.500">Preparing your review dashboard</Text>
          </VStack>
        </Box>
      );
    }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" p={4}>
      <Box maxW="7xl" mx="auto">
        {/* Back Button */}
        <Button 
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
          fontWeight="bold"
          borderRadius="xl"
          mb={6}
          onClick={() => router.push('/mentor/dashboard')}
          _hover={{
            bg: "blue.50",
            transform: "translateX(-4px)",
            transition: "all 0.3s"
          }}
          animation={`${slideIn} 0.6s ease-out`}
        >
          Back to Dashboard
        </Button>

        {/* Header Section */}
        <Card
          mb={8}
          borderRadius="3xl"
          boxShadow="xl"
          bg={cardBg}
          overflow="hidden"
          position="relative"
          animation={`${fadeIn} 0.8s ease-out`}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="120px"
            bgGradient="linear(to-r, blue.500, purple.500)"
            opacity="0.08"
            borderRadius="3xl"
          />
          <CardBody p={8} pb={10}>
            <VStack spacing={4} textAlign="center" position="relative" zIndex={1}>
              <Flex align="center" justify="center" mb={2}>
                <Icon as={FaTasks} boxSize={8} color="blue.500" /> 
                <Heading as="h2" size="lg" ml={2} color="blue.700">
                  Review Tasks & Queries
                </Heading>
              </Flex>
              <Text color="gray.600" mb={8}>
                Evaluate student submissions and answer their queries
              </Text>
              {/* Enhanced Stats Cards */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={4} w="full">
                {[
                  { 
                    icon: FaRocket, 
                    label: "Review Progress", 
                    value: `${stats.completionRate}%`, 
                    color: "purple", 
                    desc: `${stats.reviewed}/${stats.total} reviewed`,
                    progress: stats.completionRate
                  },
                  { 
                    icon: FaTrophy, 
                    label: "Quality Score", 
                    value: stats.averageMarks, 
                    color: "yellow", 
                    desc: "Average marks given",
                    progress: stats.averageMarks
                  },
                  { 
                    icon: FaClock, 
                    label: "Pending Review", 
                    value: stats.pending, 
                    color: "orange", 
                    desc: "Need your attention",
                    progress: stats.total > 0 ? (stats.pending/stats.total)*100 : 0
                  },
                  { 
                    icon: FaQuestionCircle, 
                    label: "Open Queries", 
                    value: stats.openQueries, 
                    color: "red", 
                    desc: "Waiting for answers",
                    progress: stats.openQueries > 0 ? 100 : 0
                  },
                ].map((stat, index) => (
                  <Card 
                    key={stat.label} 
                    bg={cardBg} 
                    borderRadius="2xl" 
                    boxShadow="lg" 
                    border="1px solid" 
                    borderColor={`${stat.color}.100`}
                    animation={`${fadeIn} 0.6s ease-out ${index * 0.1}s both`}
                    _hover={{ transform: "translateY(-4px)", transition: "all 0.3s" }}
                  >
                    <CardBody p={5}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Box>
                            <Text color="gray.600" fontSize="sm" mb={1} fontWeight="medium">{stat.label}</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.600`}>{stat.value}</Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>{stat.desc}</Text>
                          </Box>
                          <Center w="50px" h="50px" borderRadius="xl" bg={`${stat.color}.100`} color={`${stat.color}.600`}>
                            <Icon as={stat.icon} boxSize={5} />
                          </Center>
                        </HStack>
                        <Progress 
                          value={stat.progress} 
                          colorScheme={stat.color} 
                          size="sm" 
                          borderRadius="full"
                          bg={`${stat.color}.50`}
                          mt={2}
                        />
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4} mb={6}>
          {[
            { icon: FaFileAlt, label: "Total", value: stats.total, color: "blue", desc: "Submissions" },
            { icon: FaClock, label: "Pending", value: stats.pending, color: "orange", desc: "Need review" },
            { icon: FaCheckCircle, label: "Reviewed", value: stats.reviewed, color: "green", desc: "Completed" },
            { icon: FaStar, label: "Avg Marks", value: stats.averageMarks, color: "purple", desc: "Quality" },
            { icon: FaQuestionCircle, label: "Open Queries", value: stats.openQueries, color: "red", desc: "Need answers" },
            { icon: FaUsers, label: "Students", value: new Set([...submissions.map(d => d.student_id), ...queries.map(q => q.student_id)].filter(Boolean)).size, color: "teal", desc: "Participated" },
          ].map((stat, index) => (
            <Card 
              key={stat.label} 
              bg={cardBg} 
              borderRadius="2xl" 
              boxShadow="lg" 
              border="1px solid" 
              borderColor={`${stat.color}.100`}
              animation={`${fadeIn} 0.6s ease-out ${index * 0.1}s both`}
              _hover={{ transform: "translateY(-4px)", transition: "all 0.3s" }}
            >
              <CardBody p={5}>
                <HStack justify="space-between">
                  <Box>
                    <Text color="gray.600" fontSize="sm" mb={1} fontWeight="medium">{stat.label}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.600`}>{stat.value}</Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>{stat.desc}</Text>
                  </Box>
                  <Center w="50px" h="50px" borderRadius="xl" bg={`${stat.color}.100`} color={`${stat.color}.600`}>
                    <Icon as={stat.icon} boxSize={5} />
                  </Center>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Error Alert */}
        {dbError && (
          <Alert status="error" borderRadius="2xl" mb={6} animation={`${fadeIn} 0.5s ease-out`}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>
                {dbError === 'database' 
                  ? 'Unable to connect to the database server.'
                  : 'Failed to connect to the server. Please check your connection.'
                }
              </AlertDescription>
            </Box>
            <Button 
              colorScheme="red" 
              onClick={retryConnection} 
              leftIcon={<FaSync />}
              size="sm"
              borderRadius="lg"
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Tabs for Submissions and Queries */}
        <Tabs index={activeTab} onChange={setActiveTab} isLazy>
          <TabList bg={cardBg} borderRadius="2xl" p={1} mb={6}>
            <Tab 
              _selected={{ bg: "blue.500", color: "white" }}
              borderRadius="xl"
              fontWeight="medium"
            >
              <HStack>
                <Icon as={FaTasks} />
                <Text>Task Submissions ({submissions.length})</Text>
              </HStack>
            </Tab>
            <Tab 
              _selected={{ bg: "orange.500", color: "white" }}
              borderRadius="xl"
              fontWeight="medium"
            >
              <HStack>
                <Icon as={FaQuestionCircle} />
                <Text>Student Queries ({queries.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Submissions Tab */}
            <TabPanel p={0}>
              {/* Search and Filter */}
              <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" mb={6} animation={`${fadeIn} 0.7s ease-out`}>
                <CardBody p={5}>
                  <HStack spacing={4} flexWrap="wrap">
                    <Box flex="1" minW="300px">
                      <HStack>
                        <Icon as={FaSearch} color="gray.400" boxSize={5} />
                        <Input
                          placeholder="Search students, tasks, or remarks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          isDisabled={!!dbError}
                          size="md"
                          borderRadius="lg"
                        />
                      </HStack>
                    </Box>
                    
                    <HStack>
                      <Text whiteSpace="nowrap" fontWeight="medium">Filter by:</Text>
                      <Select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        size="md"
                        borderRadius="lg"
                        minWidth="140px"
                      >
                        <option value="all">All Status</option>
                        <option value="submitted">Pending Review</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="rejected">Changes Requested</option>
                        <option value="resubmitted">Resubmitted</option>
                      </Select>
                    </HStack>
                    
                    <Button
                      colorScheme="blue"
                      onClick={retryConnection}
                      leftIcon={<FaSync />}
                      isDisabled={!!dbError}
                      isLoading={isRefreshing}
                      size="md"
                      borderRadius="lg"
                    >
                      Refresh
                    </Button>
                  </HStack>
                </CardBody>
              </Card>

              {/* Submissions Table */}
              <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" animation={`${fadeIn} 0.8s ease-out`}>
                <Box
                  p={6}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  bgGradient="linear(to-r, blue.50, purple.50)"
                  borderTopRadius="2xl"
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon as={FaTasks} color="blue.600" boxSize={7} />
                      <Heading size="lg" color="blue.800">
                        Task Submissions
                      </Heading>
                    </HStack>
                    <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
                      {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </Flex>
                </Box>

                <Box>
                  {filteredSubmissions.length === 0 ? (
                    <Center p={12}>
                      <VStack spacing={4}>
                        <Icon as={FaTasks} boxSize={20} color="gray.300" />
                        <Text color="gray.500" fontSize="xl" fontWeight="bold">
                          {submissions.length === 0 ? "No Submissions Yet" : "No Matching Results"}
                        </Text>
                        <Text color="gray.400" textAlign="center" maxW="md">
                          {submissions.length === 0 ? 
                            "Students haven't submitted any tasks yet. " : 
                            "Try adjusting your search or filter criteria. "
                          }
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="lg" fontSize="md">
                        <Thead bg={tableHeaderBg}>
                          <Tr>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" py={6} px={4} borderTopLeftRadius="12px">Student</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Task</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Submission Date</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Remarks</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Files</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Status</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4}>Marks</Th>
                            <Th fontWeight="bold" color="blue.800" fontSize="md" px={4} textAlign="center" borderTopRightRadius="12px">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredSubmissions.map((submission, index) => (
                            <Tr 
                              key={submission.submission_id} 
                              _hover={{ bg: hoverBg }} 
                              transition="all 0.2s"
                              animation={`${fadeIn} 0.5s ease-out ${index * 0.05}s both`}
                            >
                              <Td py={4} px={4}>
                                <HStack spacing={4}>
                                  <Avatar 
                                    size="lg" 
                                    name={submission.student_name} 
                                    src={submission.student_profile_photo}
                                    border="2px solid"
                                    borderColor="blue.200"
                                    bg="white"
                                  />
                                  <Box>
                                    <Text fontWeight="600" fontSize="md">{submission.student_name}</Text>
                                    <Text fontSize="sm" color="gray.600">{submission.student_id}</Text>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td maxW="200px" px={4}>
                                <Tooltip label={submission.task_title} hasArrow>
                                  <Text fontWeight="600" fontSize="md" isTruncated>
                                    {submission.task_title}
                                  </Text>
                                </Tooltip>
                                <Tooltip label={submission.task_description} hasArrow>
                                  <Text fontSize="sm" color="gray.600" isTruncated>
                                    {submission.task_description}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td fontSize="md" fontWeight="500" px={4}>{submission.formatted_date}</Td>
                              <Td maxW="200px" px={4}>
                                <Tooltip label={submission.remarks || "No remarks"} hasArrow>
                                  <Text isTruncated fontSize="md">
                                    {submission.remarks || "No remarks"}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td px={4}>
                                <Wrap spacing={2}>
                                  {submission.file_paths?.slice(0, 3).map((path, idx) => {
                                    const fileName = path.split('/').pop() || `file_${idx + 1}`;
                                    return (
                                      <Tooltip key={idx} label={`Download ${fileName}`} hasArrow>
                                        <IconButton
                                          aria-label={`Download ${fileName}`}
                                          icon={<Icon as={getFileIcon(fileName)} />}
                                          size="md"
                                          variant="ghost"
                                          onClick={() => downloadFile(path, fileName)}
                                          colorScheme={getFileColor(fileName)}
                                          borderRadius="lg"
                                        />
                                      </Tooltip>
                                    );
                                  })}
                                  {submission.file_paths?.length > 3 && (
                                    <Badge colorScheme="blue" variant="subtle" fontSize="sm" px={2} borderRadius="md">
                                      +{submission.file_paths.length - 3}
                                    </Badge>
                                  )}
                                </Wrap>
                              </Td>
                              <Td px={4}>
                                <Badge 
                                  colorScheme={getStatusColor(submission.status)} 
                                  fontSize="sm" 
                                  px={3} 
                                  py={2} 
                                  borderRadius="lg"
                                  fontWeight="bold"
                                >
                                  {getStatusText(submission.status)}
                                </Badge>
                              </Td>
                              <Td px={4}>
                                {submission.marks ? (
                                  <Text fontWeight="600" fontSize="md">{submission.marks}/100</Text>
                                ) : (
                                  <Text color="gray.500" fontSize="sm">Not graded</Text>
                                )}
                              </Td>
                              <Td px={4}>
                                <HStack spacing={3} justify="center">
                                  <Tooltip label="View details" hasArrow>
                                    <IconButton
                                      icon={<FaEye />}
                                      colorScheme="blue"
                                      variant="outline"
                                      size="lg"
                                      onClick={() => {
                                        setSelectedSubmission(submission);
                                        onOpen();
                                      }}
                                      borderRadius="lg"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Review" hasArrow>
                                    <IconButton
                                      icon={<FaEdit />}
                                      colorScheme="green"
                                      size="lg"
                                      onClick={() => startReview(submission)}
                                      borderRadius="lg"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>
              </Card>
            </TabPanel>

            {/* Queries Tab */}
            <TabPanel p={0}>
              {/* Queries Table */}
              <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" animation={`${fadeIn} 0.8s ease-out`}>
                <Box
                  p={6}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  bgGradient="linear(to-r, orange.50, red.50)"
                  borderTopRadius="2xl"
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon as={FaQuestionCircle} color="orange.600" boxSize={7} />
                      <Heading size="lg" color="orange.800">
                        Student Queries
                      </Heading>
                    </HStack>
                    <Badge colorScheme="orange" fontSize="lg" px={4} py={2} borderRadius="full">
                      {queries.length} {queries.length === 1 ? 'query' : 'queries'}
                    </Badge>
                  </Flex>
                </Box>

                <Box>
                  {queries.length === 0 ? (
                    <Center p={12}>
                      <VStack spacing={4}>
                        <Icon as={FaQuestionCircle} boxSize={20} color="gray.300" />
                        <Text color="gray.500" fontSize="xl" fontWeight="bold">
                          No Queries Yet
                        </Text>
                        <Text color="gray.400" textAlign="center" maxW="md">
                          Students haven&apos;t asked any questions yet.
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="lg" fontSize="md">
                        <Thead bg="orange.50">
                          <Tr>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" py={6} px={4} borderTopLeftRadius="12px">Student</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4}>Task</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4}>Subject</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4}>Query Date</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4}>Priority</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4}>Status</Th>
                            <Th fontWeight="bold" color="orange.800" fontSize="md" px={4} textAlign="center" borderTopRightRadius="12px">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {queries.map((query, index) => (
                            <Tr 
                              key={query.query_id} 
                              _hover={{ bg: "orange.50" }} 
                              transition="all 0.2s"
                              animation={`${fadeIn} 0.5s ease-out ${index * 0.05}s both`}
                            >
                              <Td py={4} px={4}>
                                <HStack spacing={4}>
                                  <Avatar 
                                    size="lg" 
                                    name={query.student_name} 
                                    src={query.student_profile_photo}
                                    border="2px solid"
                                    borderColor="orange.200"
                                    bg="white"
                                  />
                                  <Box>
                                    <Text fontWeight="600" fontSize="md">{query.student_name}</Text>
                                    <Text fontSize="sm" color="gray.600">{query.student_id}</Text>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td maxW="200px" px={4}>
                                <Tooltip label={query.task_title} hasArrow>
                                  <Text fontWeight="600" fontSize="md" isTruncated>
                                    {query.task_title}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td maxW="200px" px={4}>
                                <Tooltip label={query.subject} hasArrow>
                                  <Text fontWeight="600" fontSize="md" isTruncated>
                                    {query.subject}
                                  </Text>
                                </Tooltip>
                                <Tooltip label={query.message} hasArrow>
                                  <Text fontSize="sm" color="gray.600" isTruncated>
                                    {query.message}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td fontSize="md" fontWeight="500" px={4}>{query.formatted_query_date}</Td>
                              <Td px={4}>
                                <Badge 
                                  colorScheme={query.priority === 'high' ? 'red' : query.priority === 'medium' ? 'orange' : 'green'} 
                                  fontSize="sm" 
                                  px={3} 
                                  py={2} 
                                  borderRadius="lg"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                >
                                  {query.priority}
                                </Badge>
                              </Td>
                              <Td px={4}>
                                <Badge 
                                  colorScheme={getQueryStatusColor(query.status)} 
                                  fontSize="sm" 
                                  px={3} 
                                  py={2} 
                                  borderRadius="lg"
                                  fontWeight="bold"
                                >
                                  {getQueryStatusText(query.status)}
                                </Badge>
                              </Td>
                              <Td px={4}>
                                <HStack spacing={3} justify="center">
                                  <Tooltip label="View query details" hasArrow>
                                    <IconButton
                                      icon={<FaEye />}
                                      colorScheme="blue"
                                      variant="outline"
                                      size="lg"
                                      onClick={() => viewQueryDetails(query)}
                                      borderRadius="lg"
                                    />
                                  </Tooltip>
                                  <Tooltip label={query.answer ? "Edit answer" : "Answer query"} hasArrow>
                                    <IconButton
                                      icon={query.answer ? <FaEdit /> : <FaReply />}
                                      colorScheme={query.answer ? "orange" : "green"}
                                      size="lg"
                                      onClick={() => startAnswerQuery(query)}
                                      borderRadius="lg"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* View Submission Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaEye} />
              <Text fontWeight="bold">Submission Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {selectedSubmission && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} mb={3}>
                  <Avatar size="lg" name={selectedSubmission.student_name} src={selectedSubmission.student_profile_photo} />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{selectedSubmission.student_name}</Text>
                    <Text fontSize="sm" color="gray.600">Student ID: {selectedSubmission.student_id}</Text>
                    <Badge colorScheme={getStatusColor(selectedSubmission.status)} mt={1} borderRadius="md">
                      {getStatusText(selectedSubmission.status)}
                    </Badge>
                  </Box>
                </HStack>

                <Box>
                  <Text fontWeight="600" mb={2}>Task Details</Text>
                  <Card bg="gray.50" p={3} borderRadius="lg">
                    <Text fontWeight="bold" fontSize="md">{selectedSubmission.task_title}</Text>
                    <Text fontSize="sm" mt={1}>{selectedSubmission.task_description}</Text>
                  </Card>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Student Remarks</Text>
                  <Text p={3} bg="gray.100" borderRadius="lg" fontSize="sm">
                    {selectedSubmission.remarks || "No remarks provided"}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Submitted Files</Text>
                  <VStack spacing={2}>
                    {selectedSubmission.file_paths?.map((path, idx) => {
                      const fileName = path.split('/').pop() || `file_${idx + 1}`;
                      return (
                        <HStack key={idx} justify="space-between" w="full" p={2} bg="gray.100" borderRadius="lg">
                          <HStack>
                            <Icon as={getFileIcon(fileName)} color={getFileColor(fileName)} />
                            <Text fontSize="sm">{fileName}</Text>
                          </HStack>
                          <Button size="sm" onClick={() => downloadFile(path, fileName)} leftIcon={<FaDownload />} borderRadius="md">
                            Download
                          </Button>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>

                {/* Display Marks and Feedback */}
                {selectedSubmission.marks && (
                  <Box>
                    <Text fontWeight="600" mb={2}>Marks Awarded</Text>
                    <Card bg="green.50" p={3} borderRadius="lg">
                      <Text fontWeight="bold" fontSize="xl" color="green.600">
                        {selectedSubmission.marks}/100
                      </Text>
                    </Card>
                  </Box>
                )}

                {selectedSubmission.feedback && (
                  <Box>
                    <Text fontWeight="600" mb={2}>Your Feedback</Text>
                    <Text p={3} bg="green.50" borderRadius="lg" fontSize="sm">
                      {selectedSubmission.feedback}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} borderRadius="lg">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={cancelReview} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaEdit} />
              <Text fontWeight="bold">Review Task Submission</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="600">Marks (0-100)</FormLabel>
                <NumberInput 
                  min={0} 
                  max={100} 
                  value={reviewForm.marks} 
                  onChange={(v) => setReviewForm({...reviewForm, marks: v})}
                >
                  <NumberInputField borderRadius="lg" placeholder="Enter marks out of 100" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Feedback</FormLabel>
                <Textarea
                  placeholder="Provide constructive feedback for the student..."
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})}
                  minH="150px"
                  borderRadius="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={cancelReview} borderRadius="lg">Cancel</Button>
            <HStack>
              <Button 
                colorScheme="orange" 
                onClick={requestChanges} 
                leftIcon={<FaTimesCircle />} 
                borderRadius="lg"
                isDisabled={!reviewForm.feedback.trim()}
              >
                Request Changes
              </Button>
              <Button 
                colorScheme="green" 
                onClick={submitReview} 
                leftIcon={<FaCheckCircle />} 
                borderRadius="lg"
                isDisabled={!reviewForm.feedback.trim()}
              >
                Approve
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Answer Query Modal */}
      <Modal isOpen={isQueryOpen} onClose={cancelQueryAnswer} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, orange.500, red.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaReply} />
              <Text fontWeight="bold">
                {queryForm.isEditing ? "Edit Query Answer" : "Answer Student Query"}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {selectedQuery && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="600" mb={2}>Student Query</Text>
                  <Card bg="gray.50" p={3} borderRadius="lg">
                    <Text fontWeight="bold" fontSize="md">{selectedQuery.subject}</Text>
                    <Text fontSize="sm" mt={2}>{selectedQuery.message}</Text>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Asked on: {selectedQuery.formatted_query_date}
                    </Text>
                    {selectedQuery.answer && (
                      <Box mt={3} p={2} bg="yellow.50" borderRadius="md">
                        <Text fontSize="xs" fontWeight="bold" color="orange.600">Current Answer:</Text>
                        <Text fontSize="sm" color="gray.700">{selectedQuery.answer}</Text>
                      </Box>
                    )}
                  </Card>
                </Box>

                <FormControl>
                  <FormLabel fontWeight="600">
                    {queryForm.isEditing ? "Edit Your Answer" : "Your Answer"}
                  </FormLabel>
                  <Textarea
                    placeholder="Provide a helpful answer to the student's query..."
                    value={queryForm.answer}
                    onChange={(e) => setQueryForm({...queryForm, answer: e.target.value})}
                    minH="150px"
                    borderRadius="lg"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={cancelQueryAnswer} borderRadius="lg">Cancel</Button>
            <Button 
              colorScheme={queryForm.isEditing ? "orange" : "green"} 
              onClick={submitQueryAnswer} 
              leftIcon={<FaCheckCircle />} 
              borderRadius="lg"
              isDisabled={!queryForm.answer.trim()}
            >
              {queryForm.isEditing ? "Update Answer" : "Submit Answer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Query Details Modal */}
      <Modal isOpen={isQueryDetailsOpen} onClose={onQueryDetailsClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader py={4} bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderTopRadius="2xl">
            <HStack>
              <Icon as={FaQuestionCircle} />
              <Text fontWeight="bold">Query Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            {selectedQuery && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} mb={3}>
                  <Avatar size="lg" name={selectedQuery.student_name} src={selectedQuery.student_profile_photo} />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{selectedQuery.student_name}</Text>
                    <Text fontSize="sm" color="gray.600">Student ID: {selectedQuery.student_id}</Text>
                    <Badge colorScheme={getQueryStatusColor(selectedQuery.status)} mt={1} borderRadius="md">
                      {getQueryStatusText(selectedQuery.status)}
                    </Badge>
                  </Box>
                </HStack>

                <Box>
                  <Text fontWeight="600" mb={2}>Task</Text>
                  <Card bg="gray.50" p={3} borderRadius="lg">
                    <Text fontWeight="bold" fontSize="md">{selectedQuery.task_title}</Text>
                  </Card>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Subject</Text>
                  <Text p={3} bg="blue.50" borderRadius="lg" fontSize="md" fontWeight="bold">
                    {selectedQuery.subject}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Query Message</Text>
                  <Text p={3} bg="gray.100" borderRadius="lg" fontSize="sm" whiteSpace="pre-wrap">
                    {selectedQuery.message}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Query Date</Text>
                  <Text p={3} bg="gray.50" borderRadius="lg" fontSize="sm">
                    {selectedQuery.formatted_query_date}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="600" mb={2}>Priority</Text>
                  <Badge 
                    colorScheme={selectedQuery.priority === 'high' ? 'red' : selectedQuery.priority === 'medium' ? 'orange' : 'green'} 
                    fontSize="md" 
                    px={4} 
                    py={2} 
                    borderRadius="lg"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    {selectedQuery.priority}
                  </Badge>
                </Box>

                {selectedQuery.answer && (
                  <Box>
                    <Text fontWeight="600" mb={2}>Your Answer</Text>
                    <Text p={3} bg="green.50" borderRadius="lg" fontSize="sm" whiteSpace="pre-wrap">
                      {selectedQuery.answer}
                    </Text>
                    {selectedQuery.formatted_answer_date && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Answered on: {selectedQuery.formatted_answer_date}
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onQueryDetailsClose} borderRadius="lg">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}